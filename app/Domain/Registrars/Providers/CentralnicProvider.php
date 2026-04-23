<?php

namespace App\Domain\Registrars\Providers;

use App\Domain\Registrars\Contracts\RegistrarProvider;
use App\Domain\Registrars\Results\AvailabilityResult;
use App\Domain\Registrars\Results\DomainInfo;
use App\Domain\Registrars\Results\ProviderContactBundle;
use App\Domain\Registrars\Results\ProviderContactRef;
use App\Domain\Registrars\Results\ProviderDomainRef;
use App\Models\Contact;
use App\Models\DomainOrder;
use App\Models\RegistryAccount;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CentralnicProvider implements RegistrarProvider
{
    private ?RegistryAccount $account = null;

    public function __construct()
    {
        $this->account = $this->getAccount();
    }

    public function checkAvailability(string $domain): AvailabilityResult
    {
        try {
            $response = $this->makeEppRequest('domain:check', [
                'domain' => $domain,
            ]);

            $data = $response['data'] ?? [];
            $available = $data['available'] ?? false;
            $reason = $data['reason'] ?? null;
            $price = $data['price'] ?? null;
            $currency = $data['currency'] ?? 'USD';
            $period = $data['period'] ?? 1;

            return new AvailabilityResult(
                domain: $domain,
                available: $available,
                reason: $reason,
                price: $price,
                currency: $currency,
                period: $period,
                metadata: $data
            );
        } catch (\Exception $e) {
            Log::error('CentralNic EPP availability check failed', [
                'domain' => $domain,
                'error' => $e->getMessage()
            ]);

            return new AvailabilityResult(
                domain: $domain,
                available: false,
                reason: 'EPP error: ' . $e->getMessage()
            );
        }
    }

    public function createOrSyncContact(Contact $contact): ProviderContactRef
    {
        try {
            $response = $this->makeRequest('POST', '/contact/create', [
                'type' => $contact->type,
                'first_name' => $contact->first_name,
                'last_name' => $contact->last_name,
                'email' => $contact->email,
                'phone' => $contact->phone,
                'organization' => $contact->organization,
                'address_line_1' => $contact->address_line_1,
                'address_line_2' => $contact->address_line_2,
                'city' => $contact->city,
                'state' => $contact->state,
                'postal_code' => $contact->postal_code,
                'country' => $contact->country,
            ]);

            $data = $response['data'] ?? [];
            $contactId = $data['contact_id'] ?? null;

            if (!$contactId) {
                throw new \Exception('Contact creation failed: No contact ID returned');
            }

            return new ProviderContactRef(
                provider: 'centralnic',
                contactId: $contactId,
                type: $contact->type,
                externalId: $data['external_id'] ?? null,
                metadata: $data
            );
        } catch (\Exception $e) {
            Log::error('CentralNic contact creation failed', [
                'contact_id' => $contact->id,
                'error' => $e->getMessage()
            ]);

            throw new \Exception('Contact creation failed: ' . $e->getMessage());
        }
    }

    public function registerDomain(DomainOrder $order, ProviderContactBundle $contacts): ProviderDomainRef
    {
        try {
            $response = $this->makeRequest('POST', '/domain/register', [
                'domain' => $order->domain . '.' . $order->tld->extension,
                'years' => $order->years,
                'registrant_contact' => $contacts->registrant->contactId,
                'admin_contact' => $contacts->getAdmin()->contactId,
                'tech_contact' => $contacts->getTech()->contactId,
                'billing_contact' => $contacts->getBilling()->contactId,
                'nameservers' => $order->nameservers ?? [],
                'privacy_protection' => $order->privacy_protection,
                'auto_renewal' => $order->auto_renewal,
            ]);

            $data = $response['data'] ?? [];
            $orderId = $data['order_id'] ?? null;
            $status = $data['status'] ?? 'pending';
            $externalId = $data['external_id'] ?? null;
            $authCode = $data['auth_code'] ?? null;
            $expiresAt = isset($data['expires_at']) ? new \DateTime($data['expires_at']) : null;

            if (!$orderId) {
                throw new \Exception('Domain registration failed: No order ID returned');
            }

            return new ProviderDomainRef(
                provider: 'centralnic',
                domain: $order->domain . '.' . $order->tld->extension,
                orderId: $orderId,
                status: $status,
                externalId: $externalId,
                authCode: $authCode,
                expiresAt: $expiresAt,
                metadata: $data
            );
        } catch (\Exception $e) {
            Log::error('CentralNic domain registration failed', [
                'domain_order_id' => $order->id,
                'error' => $e->getMessage()
            ]);

            throw new \Exception('Domain registration failed: ' . $e->getMessage());
        }
    }

    public function getDomainInfo(string $domain): DomainInfo
    {
        try {
            $response = $this->makeRequest('GET', '/domain/info', [
                'domain' => $domain,
            ]);

            $data = $response['data'] ?? [];
            $status = $data['status'] ?? 'unknown';
            $createdAt = isset($data['created_at']) ? new \DateTime($data['created_at']) : null;
            $expiresAt = isset($data['expires_at']) ? new \DateTime($data['expires_at']) : null;
            $updatedAt = isset($data['updated_at']) ? new \DateTime($data['updated_at']) : null;
            $nameservers = $data['nameservers'] ?? [];
            $authCode = $data['auth_code'] ?? null;
            $privacyEnabled = $data['privacy_enabled'] ?? false;
            $locked = $data['locked'] ?? false;
            $autoRenew = $data['auto_renew'] ?? false;

            return new DomainInfo(
                domain: $domain,
                status: $status,
                createdAt: $createdAt,
                expiresAt: $expiresAt,
                updatedAt: $updatedAt,
                nameservers: $nameservers,
                authCode: $authCode,
                privacyEnabled: $privacyEnabled,
                locked: $locked,
                autoRenew: $autoRenew,
                metadata: $data
            );
        } catch (\Exception $e) {
            Log::error('CentralNic domain info retrieval failed', [
                'domain' => $domain,
                'error' => $e->getMessage()
            ]);

            throw new \Exception('Domain info retrieval failed: ' . $e->getMessage());
        }
    }

    public function renew(string $domain, int $years): void
    {
        try {
            $this->makeRequest('POST', '/domain/renew', [
                'domain' => $domain,
                'years' => $years,
            ]);

            Log::info('CentralNic domain renewal initiated', [
                'domain' => $domain,
                'years' => $years
            ]);
        } catch (\Exception $e) {
            Log::error('CentralNic domain renewal failed', [
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
            $this->makeRequest('POST', '/domain/transfer', [
                'domain' => $domain,
                'auth_code' => $authCode,
            ]);

            Log::info('CentralNic domain transfer initiated', [
                'domain' => $domain
            ]);
        } catch (\Exception $e) {
            Log::error('CentralNic domain transfer failed', [
                'domain' => $domain,
                'error' => $e->getMessage()
            ]);

            throw new \Exception('Domain transfer failed: ' . $e->getMessage());
        }
    }

    public function updateNameservers(string $domain, array $nameservers): void
    {
        try {
            $this->makeRequest('POST', '/domain/nameservers', [
                'domain' => $domain,
                'nameservers' => $nameservers,
            ]);

            Log::info('CentralNic nameservers updated', [
                'domain' => $domain,
                'nameservers' => $nameservers
            ]);
        } catch (\Exception $e) {
            Log::error('CentralNic nameserver update failed', [
                'domain' => $domain,
                'nameservers' => $nameservers,
                'error' => $e->getMessage()
            ]);

            throw new \Exception('Nameserver update failed: ' . $e->getMessage());
        }
    }

    public function togglePrivacy(string $domain, bool $enable): void
    {
        try {
            $this->makeRequest('POST', '/domain/privacy', [
                'domain' => $domain,
                'enable' => $enable,
            ]);

            Log::info('CentralNic privacy protection toggled', [
                'domain' => $domain,
                'enabled' => $enable
            ]);
        } catch (\Exception $e) {
            Log::error('CentralNic privacy toggle failed', [
                'domain' => $domain,
                'enable' => $enable,
                'error' => $e->getMessage()
            ]);

            throw new \Exception('Privacy toggle failed: ' . $e->getMessage());
        }
    }

    public function lock(string $domain): void
    {
        try {
            $this->makeRequest('POST', '/domain/lock', [
                'domain' => $domain,
                'locked' => true,
            ]);

            Log::info('CentralNic domain locked', [
                'domain' => $domain
            ]);
        } catch (\Exception $e) {
            Log::error('CentralNic domain lock failed', [
                'domain' => $domain,
                'error' => $e->getMessage()
            ]);

            throw new \Exception('Domain lock failed: ' . $e->getMessage());
        }
    }

    public function unlock(string $domain): void
    {
        try {
            $this->makeRequest('POST', '/domain/lock', [
                'domain' => $domain,
                'locked' => false,
            ]);

            Log::info('CentralNic domain unlocked', [
                'domain' => $domain
            ]);
        } catch (\Exception $e) {
            Log::error('CentralNic domain unlock failed', [
                'domain' => $domain,
                'error' => $e->getMessage()
            ]);

            throw new \Exception('Domain unlock failed: ' . $e->getMessage());
        }
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
            $response = $this->makeEppRequest('epp:hello');
            return isset($response['status']) && $response['status'] === 'success';
        } catch (\Exception $e) {
            return false;
        }
    }

    private function getAccount(): ?RegistryAccount
    {
        return RegistryAccount::where('provider', 'centralnic')
            ->where('is_active', true)
            ->first();
    }

    private function getEppConfig(): array
    {
        $config = config('registrars.centralnic.epp');
        
        // Use database account if available, otherwise use config
        if ($this->account) {
            return [
                'host' => $config['host'],
                'port' => $config['port'],
                'username' => $this->account->username,
                'password' => $this->account->password,
                'timeout' => $config['timeout'],
                'ssl' => $config['ssl'],
            ];
        }
        
        return [
            'host' => $config['host'],
            'port' => $config['port'],
            'username' => $config['username'],
            'password' => $config['password'],
            'timeout' => $config['timeout'],
            'ssl' => $config['ssl'],
        ];
    }

    private function makeEppRequest(string $command, array $data = []): array
    {
        $eppConfig = $this->getEppConfig();
        
        // TODO: Implement actual EPP protocol communication
        // This is a placeholder for EPP implementation
        // In a real implementation, you would:
        // 1. Establish SSL connection to EPP server
        // 2. Send EPP XML commands
        // 3. Parse EPP XML responses
        // 4. Handle EPP session management
        
        Log::info('CentralNic EPP request', [
            'command' => $command,
            'data' => $data,
            'host' => $eppConfig['host'],
            'port' => $eppConfig['port']
        ]);
        
        // Placeholder response - replace with actual EPP implementation
        return [
            'status' => 'success',
            'data' => [
                'command' => $command,
                'result' => 'EPP command executed successfully'
            ]
        ];
    }
}
