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

class ResellerclubProvider implements RegistrarProvider
{
    private ?RegistryAccount $account = null;
    private string $baseUrl;
    private array $credentials;

    public function __construct()
    {
        $this->account = $this->getAccount();
        $this->baseUrl = $this->getBaseUrl();
        $this->credentials = $this->getCredentials();
    }

    public function checkAvailability(string $domain): AvailabilityResult
    {
        try {
            $response = $this->makeRequest('POST', '/domains/available.json', [
                'domain-name' => $domain,
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
            Log::error('ResellerClub availability check failed', [
                'domain' => $domain,
                'error' => $e->getMessage()
            ]);

            return new AvailabilityResult(
                domain: $domain,
                available: false,
                reason: 'Provider error: ' . $e->getMessage()
            );
        }
    }

    public function createOrSyncContact(Contact $contact): ProviderContactRef
    {
        try {
            $response = $this->makeRequest('POST', '/contacts/add', [
                'type' => $contact->type,
                'name' => $contact->first_name . ' ' . $contact->last_name,
                'email' => $contact->email,
                'phone' => $contact->phone,
                'company' => $contact->organization,
                'address-line-1' => $contact->address_line_1,
                'address-line-2' => $contact->address_line_2,
                'city' => $contact->city,
                'state' => $contact->state,
                'zipcode' => $contact->postal_code,
                'country' => $contact->country,
            ]);

            $data = $response['data'] ?? [];
            $contactId = $data['contactid'] ?? null;

            if (!$contactId) {
                throw new \Exception('Contact creation failed: No contact ID returned');
            }

            return new ProviderContactRef(
                provider: 'resellerclub',
                contactId: $contactId,
                type: $contact->type,
                externalId: $data['external_id'] ?? null,
                metadata: $data
            );
        } catch (\Exception $e) {
            Log::error('ResellerClub contact creation failed', [
                'contact_id' => $contact->id,
                'error' => $e->getMessage()
            ]);

            throw new \Exception('Contact creation failed: ' . $e->getMessage());
        }
    }

    public function registerDomain(DomainOrder $order, ProviderContactBundle $contacts): ProviderDomainRef
    {
        try {
            $response = $this->makeRequest('POST', '/domains/register', [
                'domain-name' => $order->domain . '.' . $order->tld->extension,
                'years' => $order->years,
                'registrant-contact-id' => $contacts->registrant->contactId,
                'admin-contact-id' => $contacts->getAdmin()->contactId,
                'tech-contact-id' => $contacts->getTech()->contactId,
                'billing-contact-id' => $contacts->getBilling()->contactId,
                'ns' => $order->nameservers ?? [],
                'privacy-protection' => $order->privacy_protection,
                'auto-renew' => $order->auto_renewal,
            ]);

            $data = $response['data'] ?? [];
            $orderId = $data['orderid'] ?? null;
            $status = $data['status'] ?? 'pending';
            $externalId = $data['external_id'] ?? null;
            $authCode = $data['auth_code'] ?? null;
            $expiresAt = isset($data['expires-at']) ? new \DateTime($data['expires-at']) : null;

            if (!$orderId) {
                throw new \Exception('Domain registration failed: No order ID returned');
            }

            return new ProviderDomainRef(
                provider: 'resellerclub',
                domain: $order->domain . '.' . $order->tld->extension,
                orderId: $orderId,
                status: $status,
                externalId: $externalId,
                authCode: $authCode,
                expiresAt: $expiresAt,
                metadata: $data
            );
        } catch (\Exception $e) {
            Log::error('ResellerClub domain registration failed', [
                'domain_order_id' => $order->id,
                'error' => $e->getMessage()
            ]);

            throw new \Exception('Domain registration failed: ' . $e->getMessage());
        }
    }

    public function getDomainInfo(string $domain): DomainInfo
    {
        try {
            $response = $this->makeRequest('POST', '/domains/details', [
                'domain-name' => $domain,
            ]);

            $data = $response['data'] ?? [];
            $status = $data['status'] ?? 'unknown';
            $createdAt = isset($data['creationtime']) ? new \DateTime($data['creationtime']) : null;
            $expiresAt = isset($data['endtime']) ? new \DateTime($data['endtime']) : null;
            $updatedAt = isset($data['modificationtime']) ? new \DateTime($data['modificationtime']) : null;
            $nameservers = $data['ns'] ?? [];
            $authCode = $data['auth-code'] ?? null;
            $privacyEnabled = $data['privacy-protection'] ?? false;
            $locked = $data['locked'] ?? false;
            $autoRenew = $data['auto-renew'] ?? false;

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
            Log::error('ResellerClub domain info retrieval failed', [
                'domain' => $domain,
                'error' => $e->getMessage()
            ]);

            throw new \Exception('Domain info retrieval failed: ' . $e->getMessage());
        }
    }

    public function renew(string $domain, int $years): void
    {
        try {
            $this->makeRequest('POST', '/domains/renew', [
                'domain-name' => $domain,
                'years' => $years,
            ]);

            Log::info('ResellerClub domain renewal initiated', [
                'domain' => $domain,
                'years' => $years
            ]);
        } catch (\Exception $e) {
            Log::error('ResellerClub domain renewal failed', [
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
            $this->makeRequest('POST', '/domains/transfer', [
                'domain-name' => $domain,
                'auth-code' => $authCode,
            ]);

            Log::info('ResellerClub domain transfer initiated', [
                'domain' => $domain
            ]);
        } catch (\Exception $e) {
            Log::error('ResellerClub domain transfer failed', [
                'domain' => $domain,
                'error' => $e->getMessage()
            ]);

            throw new \Exception('Domain transfer failed: ' . $e->getMessage());
        }
    }

    public function updateNameservers(string $domain, array $nameservers): void
    {
        try {
            $this->makeRequest('POST', '/domains/modify-ns', [
                'domain-name' => $domain,
                'ns' => $nameservers,
            ]);

            Log::info('ResellerClub nameservers updated', [
                'domain' => $domain,
                'nameservers' => $nameservers
            ]);
        } catch (\Exception $e) {
            Log::error('ResellerClub nameserver update failed', [
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
            $this->makeRequest('POST', '/domains/modify-privacy-protection', [
                'domain-name' => $domain,
                'protect-privacy' => $enable,
            ]);

            Log::info('ResellerClub privacy protection toggled', [
                'domain' => $domain,
                'enabled' => $enable
            ]);
        } catch (\Exception $e) {
            Log::error('ResellerClub privacy toggle failed', [
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
            $this->makeRequest('POST', '/domains/modify-lock', [
                'domain-name' => $domain,
                'lock' => true,
            ]);

            Log::info('ResellerClub domain locked', [
                'domain' => $domain
            ]);
        } catch (\Exception $e) {
            Log::error('ResellerClub domain lock failed', [
                'domain' => $domain,
                'error' => $e->getMessage()
            ]);

            throw new \Exception('Domain lock failed: ' . $e->getMessage());
        }
    }

    public function unlock(string $domain): void
    {
        try {
            $this->makeRequest('POST', '/domains/modify-lock', [
                'domain-name' => $domain,
                'lock' => false,
            ]);

            Log::info('ResellerClub domain unlocked', [
                'domain' => $domain
            ]);
        } catch (\Exception $e) {
            Log::error('ResellerClub domain unlock failed', [
                'domain' => $domain,
                'error' => $e->getMessage()
            ]);

            throw new \Exception('Domain unlock failed: ' . $e->getMessage());
        }
    }

    public function getProviderName(): string
    {
        return 'resellerclub';
    }

    public function isAvailable(): bool
    {
        return $this->account !== null && $this->account->is_active;
    }

    public function testConnection(): bool
    {
        try {
            $response = $this->makeRequest('POST', '/customers/details');
            return isset($response['status']) && $response['status'] === 'Success';
        } catch (\Exception $e) {
            return false;
        }
    }

    private function getAccount(): ?RegistryAccount
    {
        return RegistryAccount::where('provider', 'resellerclub')
            ->where('is_active', true)
            ->first();
    }

    private function getBaseUrl(): string
    {
        $config = config('registrars.resellerclub');
        
        if ($this->account && $this->account->mode === 'live') {
            return $config['api']['base_url'] ?? 'https://httpapi.com/api';
        }
        
        return $config['api']['base_url'] ?? 'https://test.httpapi.com/api';
    }

    private function getCredentials(): array
    {
        $config = config('registrars.resellerclub');
        
        // Use database account if available, otherwise use config
        if ($this->account) {
            return [
                'username' => $this->account->username,
                'password' => $this->account->password,
                'api_key' => $this->account->api_key,
            ];
        }
        
        return [
            'username' => $config['api']['auth_userid'],
            'password' => '', // ResellerClub doesn't use password
            'api_key' => $config['api']['api_key'],
        ];
    }

    private function makeRequest(string $method, string $endpoint, array $data = []): array
    {
        $url = $this->baseUrl . $endpoint;
        $config = config('registrars.resellerclub');
        $timeout = $config['api']['timeout'] ?? config('registrars.defaults.timeout', 30);
        
        // Add authentication parameters
        $data['auth-userid'] = $this->credentials['username'];
        $data['auth-password'] = $this->credentials['password'];
        $data['api-key'] = $this->credentials['api_key'];

        $response = Http::timeout($timeout)->asForm()->$method($url, $data);

        if (!$response->successful()) {
            throw new \Exception('API request failed: ' . $response->body());
        }

        return $response->json();
    }
}
