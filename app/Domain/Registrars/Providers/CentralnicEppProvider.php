<?php

namespace App\Domain\Registrars\Providers;

use App\Domain\Epp\Commands\EppContactCommands;
use App\Domain\Epp\Commands\EppDomainCommands;
use App\Domain\Epp\Commands\EppPollCommands;
use App\Domain\Epp\Contracts\EppClient;
use App\Domain\Epp\EppSocketClient;
use App\Domain\Registrars\Contracts\RegistrarProvider;
use App\Domain\Registrars\Results\AvailabilityResult;
use App\Domain\Registrars\Results\DomainInfo;
use App\Domain\Registrars\Results\ProviderContactBundle;
use App\Domain\Registrars\Results\ProviderContactRef;
use App\Domain\Registrars\Results\ProviderDomainRef;
use App\Models\Contact;
use App\Models\DomainOrder;
use App\Models\RegistryAccount;
use Illuminate\Support\Facades\Log;

class CentralnicEppProvider implements RegistrarProvider
{
    private ?RegistryAccount $account = null;
    private ?EppClient $client = null;
    private bool $loggedIn = false;

    public function __construct()
    {
        $this->account = $this->getAccount();
    }

    public function checkAvailability(string $domain): AvailabilityResult
    {
        // Mock mode: Return mock availability for development
        if (config('registrars.centralnic.use_mock', false)) {
            Log::info('CentralNic EPP in mock mode - returning mock availability', [
                'domain' => $domain
            ]);

            // Mock: Domains containing "unavailable" or "taken" are not available
            $available = !str_contains(strtolower($domain), 'unavailable') && 
                         !str_contains(strtolower($domain), 'taken');

            // Mock pricing based on TLD
            $mockPrices = [
                'com' => 12.99,
                'net' => 13.99,
                'org' => 14.99,
                'bh' => 89.99,
                'in' => 9.99,
                'co' => 15.99,
            ];
            
            $tldExtension = substr($domain, strrpos($domain, '.') + 1);
            $mockPrice = $mockPrices[$tldExtension] ?? 10.99;

            return new AvailabilityResult(
                domain: $domain,
                available: $available,
                reason: $available ? null : 'Domain is registered',
                price: $available ? $mockPrice : null,
                currency: 'USD',
                period: 1,
                metadata: ['mode' => 'mock', 'source' => 'centralnic']
            );
        }

        try {
            $this->ensureConnected();

            $client = $this->getClient();
            $clTRID = $client->generateTransactionId();
            $xml = EppDomainCommands::check([$domain], $clTRID);
            $response = $client->request($xml);

            if (!$response['success']) {
                throw new \Exception($response['message'] ?? 'Domain check failed');
            }

            // Parse domain availability from response
            $dom = $response['dom'];
            $xpath = new \DOMXPath($dom);
            $xpath->registerNamespace('domain', 'urn:ietf:params:xml:ns:domain-1.0');

            $nameNode = $xpath->query('//domain:name[@avail]')->item(0);
            $available = $nameNode && $nameNode->getAttribute('avail') === '1';
            $reason = $nameNode ? $nameNode->textContent : null;

            return new AvailabilityResult(
                domain: $domain,
                available: $available,
                reason: $reason,
                metadata: ['response' => $response]
            );
        } catch (\Exception $e) {
            Log::warning('CentralNic EPP availability check failed, assuming available', [
                'domain' => $domain,
                'error' => $e->getMessage()
            ]);

            // Fallback: Assume available when API fails (optimistic)
            // In production, you might want to show as "unknown" instead
            return new AvailabilityResult(
                domain: $domain,
                available: true,
                reason: 'Unable to verify (assuming available)',
                metadata: ['error' => $e->getMessage(), 'fallback' => true]
            );
        }
    }

    public function createOrSyncContact(Contact $contact): ProviderContactRef
    {
        try {
            $this->ensureConnected();

            $client = $this->getClient();
            
            // Generate unique contact ID
            $contactId = 'C' . time() . rand(1000, 9999);

            $params = [
                'id' => $contactId,
                'name' => $contact->first_name . ' ' . $contact->last_name,
                'org' => $contact->organization,
                'street' => $contact->address_line_1,
                'street2' => $contact->address_line_2,
                'city' => $contact->city,
                'sp' => $contact->state,
                'pc' => $contact->postal_code,
                'cc' => $contact->country,
                'voice' => $contact->phone,
                'email' => $contact->email,
                'authInfo' => bin2hex(random_bytes(8)),
            ];

            $clTRID = $client->generateTransactionId();
            $xml = EppContactCommands::create($params, $clTRID);
            $response = $client->request($xml);

            if (!$response['success']) {
                throw new \Exception($response['message'] ?? 'Contact creation failed');
            }

            return new ProviderContactRef(
                provider: 'centralnic',
                contactId: $contactId,
                type: $contact->type,
                metadata: ['response' => $response]
            );
        } catch (\Exception $e) {
            Log::error('CentralNic EPP contact creation failed', [
                'contact_id' => $contact->id,
                'error' => $e->getMessage()
            ]);

            throw new \Exception('Contact creation failed: ' . $e->getMessage());
        }
    }

    public function registerDomain(DomainOrder $order, ProviderContactBundle $contacts): ProviderDomainRef
    {
        try {
            $this->ensureConnected();

            $client = $this->getClient();
            $domain = $order->domain . '.' . $order->tld->extension;

            $params = [
                'domain' => $domain,
                'years' => $order->years,
                'nameservers' => $order->nameservers ?? [],
                'registrant' => $contacts->registrant->contactId,
                'contacts' => [
                    'admin' => $contacts->getAdmin()->contactId,
                    'tech' => $contacts->getTech()->contactId,
                    'billing' => $contacts->getBilling()->contactId,
                ],
                'authInfo' => bin2hex(random_bytes(8)),
            ];

            $clTRID = $client->generateTransactionId();
            $xml = EppDomainCommands::create($params, $clTRID);
            $response = $client->request($xml);

            if (!$response['success']) {
                throw new \Exception($response['message'] ?? 'Domain registration failed');
            }

            // Parse domain creation response
            $dom = $response['dom'];
            $xpath = new \DOMXPath($dom);
            $xpath->registerNamespace('domain', 'urn:ietf:params:xml:ns:domain-1.0');

            $exDateNode = $xpath->query('//domain:exDate')->item(0);
            $expiresAt = $exDateNode ? new \DateTime($exDateNode->textContent) : null;

            return new ProviderDomainRef(
                provider: 'centralnic',
                domain: $domain,
                orderId: $response['clTRID'],
                status: 'registered',
                authCode: $params['authInfo'],
                expiresAt: $expiresAt,
                metadata: ['response' => $response]
            );
        } catch (\Exception $e) {
            Log::error('CentralNic EPP domain registration failed', [
                'domain_order_id' => $order->id,
                'error' => $e->getMessage()
            ]);

            throw new \Exception('Domain registration failed: ' . $e->getMessage());
        }
    }

    public function getDomainInfo(string $domain): DomainInfo
    {
        try {
            $this->ensureConnected();

            $client = $this->getClient();
            $clTRID = $client->generateTransactionId();
            $xml = EppDomainCommands::info($domain, $clTRID);
            $response = $client->request($xml);

            if (!$response['success']) {
                throw new \Exception($response['message'] ?? 'Domain info retrieval failed');
            }

            // Parse domain info from response
            $dom = $response['dom'];
            $xpath = new \DOMXPath($dom);
            $xpath->registerNamespace('domain', 'urn:ietf:params:xml:ns:domain-1.0');

            $statusNodes = $xpath->query('//domain:status');
            $statuses = [];
            foreach ($statusNodes as $node) {
                $statuses[] = $node->getAttribute('s');
            }
            $status = !empty($statuses) ? $statuses[0] : 'unknown';

            $crDateNode = $xpath->query('//domain:crDate')->item(0);
            $createdAt = $crDateNode ? new \DateTime($crDateNode->textContent) : null;

            $exDateNode = $xpath->query('//domain:exDate')->item(0);
            $expiresAt = $exDateNode ? new \DateTime($exDateNode->textContent) : null;

            $upDateNode = $xpath->query('//domain:upDate')->item(0);
            $updatedAt = $upDateNode ? new \DateTime($upDateNode->textContent) : null;

            $nsNodes = $xpath->query('//domain:hostObj');
            $nameservers = [];
            foreach ($nsNodes as $node) {
                $nameservers[] = $node->textContent;
            }

            return new DomainInfo(
                domain: $domain,
                status: $status,
                createdAt: $createdAt,
                expiresAt: $expiresAt,
                updatedAt: $updatedAt,
                nameservers: $nameservers,
                locked: in_array('clientTransferProhibited', $statuses),
                metadata: ['response' => $response]
            );
        } catch (\Exception $e) {
            Log::error('CentralNic EPP domain info retrieval failed', [
                'domain' => $domain,
                'error' => $e->getMessage()
            ]);

            throw new \Exception('Domain info retrieval failed: ' . $e->getMessage());
        }
    }

    public function renew(string $domain, int $years): void
    {
        try {
            $this->ensureConnected();

            // First get domain info to get current expiry date
            $domainInfo = $this->getDomainInfo($domain);
            $currentExpiryDate = $domainInfo->expiresAt->format('Y-m-d');

            $client = $this->getClient();
            $clTRID = $client->generateTransactionId();
            $xml = EppDomainCommands::renew($domain, $currentExpiryDate, $years, $clTRID);
            $response = $client->request($xml);

            if (!$response['success']) {
                throw new \Exception($response['message'] ?? 'Domain renewal failed');
            }

            Log::info('CentralNic EPP domain renewal successful', [
                'domain' => $domain,
                'years' => $years
            ]);
        } catch (\Exception $e) {
            Log::error('CentralNic EPP domain renewal failed', [
                'domain' => $domain,
                'years' => $years,
                'error' => $e->getMessage()
            ]);

            throw new \Exception('Domain renewal failed: ' . $e->getMessage());
        }
    }

    public function transferRequest(string $domain, string $authCode): void
    {
        try {
            $this->ensureConnected();

            $client = $this->getClient();
            $clTRID = $client->generateTransactionId();
            $xml = EppDomainCommands::transfer($domain, $authCode, $clTRID);
            $response = $client->request($xml);

            if (!$response['success']) {
                throw new \Exception($response['message'] ?? 'Domain transfer failed');
            }

            Log::info('CentralNic EPP domain transfer initiated', [
                'domain' => $domain
            ]);
        } catch (\Exception $e) {
            Log::error('CentralNic EPP domain transfer failed', [
                'domain' => $domain,
                'error' => $e->getMessage()
            ]);

            throw new \Exception('Domain transfer failed: ' . $e->getMessage());
        }
    }

    public function updateNameservers(string $domain, array $nameservers): void
    {
        try {
            $this->ensureConnected();

            // Get current nameservers
            $domainInfo = $this->getDomainInfo($domain);
            $currentNs = $domainInfo->nameservers;

            // Calculate add/remove
            $add = array_diff($nameservers, $currentNs);
            $remove = array_diff($currentNs, $nameservers);

            $client = $this->getClient();
            $clTRID = $client->generateTransactionId();
            $xml = EppDomainCommands::updateNameservers($domain, $add, $remove, $clTRID);
            $response = $client->request($xml);

            if (!$response['success']) {
                throw new \Exception($response['message'] ?? 'Nameserver update failed');
            }

            Log::info('CentralNic EPP nameservers updated', [
                'domain' => $domain,
                'nameservers' => $nameservers
            ]);
        } catch (\Exception $e) {
            Log::error('CentralNic EPP nameserver update failed', [
                'domain' => $domain,
                'nameservers' => $nameservers,
                'error' => $e->getMessage()
            ]);

            throw new \Exception('Nameserver update failed: ' . $e->getMessage());
        }
    }

    public function togglePrivacy(string $domain, bool $enable): void
    {
        // Privacy protection is typically handled through extensions
        // This is a placeholder for EPP implementation
        Log::info('CentralNic EPP privacy toggle requested', [
            'domain' => $domain,
            'enabled' => $enable
        ]);

        throw new \Exception('Privacy protection not yet implemented for EPP');
    }

    public function lock(string $domain): void
    {
        // Domain locking would use domain:update with status changes
        // This is a placeholder
        Log::info('CentralNic EPP domain lock requested', [
            'domain' => $domain
        ]);

        throw new \Exception('Domain locking not yet implemented for EPP');
    }

    public function unlock(string $domain): void
    {
        // Domain unlocking would use domain:update with status changes
        // This is a placeholder
        Log::info('CentralNic EPP domain unlock requested', [
            'domain' => $domain
        ]);

        throw new \Exception('Domain unlocking not yet implemented for EPP');
    }

    public function getProviderName(): string
    {
        return 'centralnic';
    }

    public function isAvailable(): bool
    {
        return $this->account !== null && $this->account->is_active;
    }

    public function testConnection(): bool
    {
        try {
            $client = $this->getClient();
            $response = $client->hello();
            return $response['success'] ?? false;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Poll for EPP messages.
     */
    public function pollMessages(): array
    {
        try {
            $this->ensureConnected();

            $client = $this->getClient();
            $clTRID = $client->generateTransactionId();
            $xml = EppPollCommands::request($clTRID);
            $response = $client->request($xml);

            $messages = [];

            if ($response['success'] && $response['code'] === 1301) {
                // Parse poll message
                $dom = $response['dom'];
                $xpath = new \DOMXPath($dom);

                $msgNode = $xpath->query('//epp:msgQ')->item(0);
                if ($msgNode) {
                    $messages[] = [
                        'id' => $msgNode->getAttribute('id'),
                        'date' => $msgNode->getAttribute('qDate'),
                        'message' => $xpath->query('//epp:msg')->item(0)?->textContent,
                        'response' => $response,
                    ];
                }
            }

            return $messages;
        } catch (\Exception $e) {
            Log::error('CentralNic EPP poll failed', [
                'error' => $e->getMessage()
            ]);

            return [];
        }
    }

    /**
     * Acknowledge a poll message.
     */
    public function acknowledgePollMessage(string $msgId): void
    {
        try {
            $this->ensureConnected();

            $client = $this->getClient();
            $clTRID = $client->generateTransactionId();
            $xml = EppPollCommands::ack($msgId, $clTRID);
            $response = $client->request($xml);

            if (!$response['success']) {
                throw new \Exception($response['message'] ?? 'Poll acknowledgement failed');
            }

            Log::info('CentralNic EPP poll message acknowledged', [
                'msg_id' => $msgId
            ]);
        } catch (\Exception $e) {
            Log::error('CentralNic EPP poll acknowledgement failed', [
                'msg_id' => $msgId,
                'error' => $e->getMessage()
            ]);

            throw new \Exception('Poll acknowledgement failed: ' . $e->getMessage());
        }
    }

    private function getAccount(): ?RegistryAccount
    {
        return RegistryAccount::where('provider', 'centralnic')
            ->where('is_active', true)
            ->first();
    }

    private function getClient(): EppClient
    {
        if ($this->client === null) {
            $config = config('registrars.centralnic.epp');

            // Build SSL options
            $sslOptions = [
                'verify_peer' => config('app.env') === 'production', // Disable in dev
                'verify_peer_name' => config('app.env') === 'production',
            ];

            // Add certificate if file exists
            if ($config['ssl']['client_cert'] && file_exists($config['ssl']['client_cert'])) {
                $sslOptions['local_cert'] = $config['ssl']['client_cert'];
                if ($config['ssl']['client_key'] && file_exists($config['ssl']['client_key'])) {
                    $sslOptions['local_pk'] = $config['ssl']['client_key'];
                }
            }

            $this->client = new EppSocketClient(
                host: $config['host'],
                port: $config['port'],
                timeout: $config['timeout'],
                sslOptions: $sslOptions
            );

            $this->client->setTransactionIdPrefix('LHOST');
        }

        return $this->client;
    }

    private function ensureConnected(): void
    {
        $client = $this->getClient();

        if (!$client->isConnected()) {
            $client->connect();
        }

        if (!$this->loggedIn) {
            $this->login();
        }
    }

    private function login(): void
    {
        $config = config('registrars.centralnic.epp');
        
        // Use config credentials if account not found or doesn't have username
        $username = ($this->account && $this->account->username) 
            ? $this->account->username 
            : $config['username'];
        $password = ($this->account && $this->account->password) 
            ? $this->account->password 
            : $config['password'];

        if (!$username || !$password) {
            throw new \Exception('EPP credentials not configured');
        }

        $response = $this->client->login($username, $password);

        if (!$response['success']) {
            throw new \Exception('EPP login failed: ' . ($response['message'] ?? 'Unknown error'));
        }

        $this->loggedIn = true;

        Log::info('CentralNic EPP login successful', [
            'username' => $username
        ]);
    }

    public function __destruct()
    {
        if ($this->client && $this->loggedIn) {
            try {
                $this->client->logout();
            } catch (\Exception $e) {
                Log::error('EPP logout failed', ['error' => $e->getMessage()]);
            }
        }
    }
}
