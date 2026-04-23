<?php

namespace App\Domain\Registrars\Providers;

use App\Domain\Registrars\Contracts\RegistrarProvider;
use App\Domain\Registrars\Results\AvailabilityResult;
use App\Domain\Registrars\Results\DomainInfo;
use App\Domain\Registrars\Results\ProviderContactBundle;
use App\Domain\Registrars\Results\ProviderContactRef;
use App\Domain\Registrars\Results\ProviderDomainRef;
use App\Domain\ResellerClub\ResellerClubClient;
use App\Models\Contact;
use App\Models\DomainOrder;
use App\Models\RegistryAccount;
use Illuminate\Support\Facades\Log;

class ResellerClubHttpProvider implements RegistrarProvider
{
    private ?RegistryAccount $account = null;
    private ?ResellerClubClient $client = null;

    public function __construct()
    {
        $this->account = $this->getAccount();
    }

    public function checkAvailability(string $domain): AvailabilityResult
    {

        try {
            $client = $this->getClient();
            
            // Parse domain to get domain name and TLD
            $domainParts = explode('.', $domain);
            $domainName = $domainParts[0];  // "lionzhost"
            $tld = $domainParts[1];         // "com"

            $response = $client->checkDomainAvailability([$domainName], [$tld]);

            // Parse availability from response
            $domainStatus = $response[$domain] ?? [];
            $available = isset($domainStatus['status']) && $domainStatus['status'] === 'available';
            $classkey = $domainStatus['classkey'] ?? null;

            // Get real pricing from ResellerClub API
            $price = null;
            $currency = 'USD';
            $period = 1;

            if ($classkey && $available) {
                $pricing = $client->getPricingForClasskey($classkey);
                if ($pricing) {
                    // Extract pricing information from the product data
                    $price = $pricing['addnewdomain'] ?? null;
                    $currency = $pricing['currency'] ?? 'USD';
                    $period = $pricing['period'] ?? 1;
                }
            }

            return new AvailabilityResult(
                domain: $domain,
                available: $available,
                reason: $domainStatus['status'] ?? null,
                price: $price,
                currency: $currency,
                period: $period,
                metadata: array_merge($response, [
                    'classkey' => $classkey,
                    'pricing_source' => 'resellerclub_api'
                ])
            );
        } catch (\Exception $e) {
            Log::warning('ResellerClub availability check failed, assuming available', [
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
            $client = $this->getClient();

            $params = [
                'name' => $contact->first_name . ' ' . $contact->last_name,
                'company' => $contact->organization ?? 'N/A',
                'email' => $contact->email,
                'address-line-1' => $contact->address_line_1,
                'city' => $contact->city,
                'state' => $contact->state ?? 'N/A',
                'country' => $contact->country,
                'zipcode' => $contact->postal_code,
                'phone-cc' => '1', // Default country code
                'phone' => preg_replace('/[^0-9]/', '', $contact->phone),
                'customer-id' => $this->getOrCreateCustomerId(),
                'type' => 'Contact',
            ];

            if ($contact->address_line_2) {
                $params['address-line-2'] = $contact->address_line_2;
            }

            $response = $client->addContact($params);
            $contactId = $response['contactid'] ?? $response['entityid'] ?? null;

            if (!$contactId) {
                throw new \Exception('Contact creation failed: No contact ID returned');
            }

            return new ProviderContactRef(
                provider: 'resellerclub',
                contactId: (string)$contactId,
                type: $contact->type,
                metadata: $response
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
            $client = $this->getClient();
            $domain = $order->domain . '.' . $order->tld->extension;

            $params = [
                'domain-name' => $domain,
                'years' => $order->years,
                'ns' => $order->nameservers ?? ['ns1.example.com', 'ns2.example.com'],
                'customer-id' => $this->getOrCreateCustomerId(),
                'reg-contact-id' => $contacts->registrant->contactId,
                'admin-contact-id' => $contacts->getAdmin()->contactId,
                'tech-contact-id' => $contacts->getTech()->contactId,
                'billing-contact-id' => $contacts->getBilling()->contactId,
                'invoice-option' => 'NoInvoice',
                'protect-privacy' => $order->privacy_protection,
            ];

            $response = $client->registerDomain($params);
            $orderId = $response['orderid'] ?? $response['entityid'] ?? null;

            if (!$orderId) {
                throw new \Exception('Domain registration failed: No order ID returned');
            }

            // Get domain details to extract expiry date
            $details = $client->getDomainDetails($orderId);
            $expiresAt = isset($details['endtime'])
                ? new \DateTime('@' . $details['endtime'])
                : null;

            return new ProviderDomainRef(
                provider: 'resellerclub',
                domain: $domain,
                orderId: (string)$orderId,
                status: $details['currentstatus'] ?? 'pending',
                externalId: (string)$orderId,
                expiresAt: $expiresAt,
                metadata: $response
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
            $client = $this->getClient();
            $response = $client->getDomainDetailsByName($domain);

            $createdAt = isset($response['creationtime'])
                ? new \DateTime('@' . $response['creationtime'])
                : null;

            $expiresAt = isset($response['endtime'])
                ? new \DateTime('@' . $response['endtime'])
                : null;

            $updatedAt = isset($response['modificationtime'])
                ? new \DateTime('@' . $response['modificationtime'])
                : null;

            $nameservers = [];
            if (isset($response['nameservers'])) {
                $nameservers = is_array($response['nameservers'])
                    ? $response['nameservers']
                    : [$response['nameservers']];
            }

            return new DomainInfo(
                domain: $domain,
                status: $response['currentstatus'] ?? 'unknown',
                createdAt: $createdAt,
                expiresAt: $expiresAt,
                updatedAt: $updatedAt,
                nameservers: $nameservers,
                privacyEnabled: $response['privacyprotectedallowed'] ?? false,
                locked: $response['istheftprotectionenabled'] ?? false,
                autoRenew: $response['autorenewstatus'] ?? false,
                metadata: $response
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
            $client = $this->getClient();

            // Get domain info to get order ID
            $domainInfo = $client->getDomainDetailsByName($domain);
            $orderId = $domainInfo['orderid'] ?? null;

            if (!$orderId) {
                throw new \Exception('Could not find order ID for domain');
            }

            $client->renewDomain($orderId, $years);

            Log::info('ResellerClub domain renewal successful', [
                'domain' => $domain,
                'years' => $years,
                'order_id' => $orderId
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
            $client = $this->getClient();

            $params = [
                'customer-id' => $this->getOrCreateCustomerId(),
                'invoice-option' => 'NoInvoice',
            ];

            $client->transferDomain($domain, $authCode, $params);

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
            $client = $this->getClient();

            // Get domain info to get order ID
            $domainInfo = $client->getDomainDetailsByName($domain);
            $orderId = $domainInfo['orderid'] ?? null;

            if (!$orderId) {
                throw new \Exception('Could not find order ID for domain');
            }

            $client->modifyNameservers($orderId, $nameservers);

            Log::info('ResellerClub nameservers updated', [
                'domain' => $domain,
                'nameservers' => $nameservers,
                'order_id' => $orderId
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
            $client = $this->getClient();

            // Get domain info to get order ID
            $domainInfo = $client->getDomainDetailsByName($domain);
            $orderId = $domainInfo['orderid'] ?? null;

            if (!$orderId) {
                throw new \Exception('Could not find order ID for domain');
            }

            $client->modifyPrivacyProtection($orderId, $enable);

            Log::info('ResellerClub privacy protection toggled', [
                'domain' => $domain,
                'enabled' => $enable,
                'order_id' => $orderId
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
            $client = $this->getClient();

            // Get domain info to get order ID
            $domainInfo = $client->getDomainDetailsByName($domain);
            $orderId = $domainInfo['orderid'] ?? null;

            if (!$orderId) {
                throw new \Exception('Could not find order ID for domain');
            }

            $client->enableTheftProtection($orderId);

            Log::info('ResellerClub domain locked', [
                'domain' => $domain,
                'order_id' => $orderId
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
            $client = $this->getClient();

            // Get domain info to get order ID
            $domainInfo = $client->getDomainDetailsByName($domain);
            $orderId = $domainInfo['orderid'] ?? null;

            if (!$orderId) {
                throw new \Exception('Could not find order ID for domain');
            }

            $client->disableTheftProtection($orderId);

            Log::info('ResellerClub domain unlocked', [
                'domain' => $domain,
                'order_id' => $orderId
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
            $client = $this->getClient();
            // Try a simple API call
            $client->get('/customers/details.json', ['customer-id' => 0]);
            return true;
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

    private function getClient(): ResellerClubClient
    {
        if ($this->client === null) {
            $this->client = new ResellerClubClient();
        }

        return $this->client;
    }

    private function getOrCreateCustomerId(): int
    {
        // For now, return a default customer ID from config/account
        // In a real implementation, you'd create a customer in ResellerClub
        // and store the customer_id in your database
        return (int)($this->account->username ?? 0);
    }
}
