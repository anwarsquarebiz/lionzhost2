<?php

namespace App\Domain\ResellerClub;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ResellerClubClient
{
    private string $baseUrl;
    private string $authUserId;
    private string $apiKey;
    private int $timeout;
    private bool $sandbox;

    public function __construct(?array $config = null)
    {
        $config = $config ?? config('registrars.resellerclub');

        $this->sandbox = $config['mode'] === 'test';
        $this->baseUrl = $this->sandbox
            ? 'https://test.httpapi.com/api'
            : 'https://httpapi.com/api';

        $this->authUserId = $config['api']['auth_userid'] ?? '';
        $this->apiKey = $config['api']['api_key'] ?? '';
        $this->timeout = $config['api']['timeout'] ?? 30;
    }

    /**
     * Make a GET request to ResellerClub API.
     */
    public function get(string $endpoint, array $params = []): array
    {
        return $this->request('GET', $endpoint, $params);
    }

    /**
     * Make a POST request to ResellerClub API.
     */
    public function post(string $endpoint, array $params = []): array
    {
        return $this->request('POST', $endpoint, $params);
    }

    /**
     * Make a request to ResellerClub API.
     */
    private function request(string $method, string $endpoint, array $params = []): array
    {
        $url = $this->baseUrl . $endpoint;

        // Add authentication parameters
        $params['auth-userid'] = $this->authUserId;
        $params['api-key'] = $this->apiKey;

        Log::debug('ResellerClub API Request', [
            'method' => $method,
            'endpoint' => $endpoint,
            'params' => array_merge($params, [
                'auth-userid' => '***',
                'api-key' => '***'
            ])
        ]);

        try {
            $response = Http::timeout($this->timeout)
                ->withOptions([
                    'verify' => config('app.env') === 'production', // Disable SSL verification in dev
                ])
                ->asForm()
                ->$method($url, $params);

            $body = $response->body();

            Log::debug('ResellerClub API Response', [
                'status' => $response->status(),
                'body_length' => strlen($body),
                'body' => $body
            ]);

            // Try to parse as JSON first
            $data = $response->json();

            if ($data === null && json_last_error() !== JSON_ERROR_NONE) {
                // If not JSON, return raw body
                return ['response' => $body];
            }

            // Check for error in response
            if (isset($data['status']) && $data['status'] === 'ERROR') {
                throw new ResellerClubException(
                    $data['message'] ?? 'API request failed',
                    $response->status()
                );
            }

            return $data;
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('ResellerClub API Connection Failed', [
                'endpoint' => $endpoint,
                'error' => $e->getMessage()
            ]);

            throw new ResellerClubException('Connection failed: ' . $e->getMessage());
        }
    }

    /**
     * Check if client is in sandbox mode.
     */
    public function isSandbox(): bool
    {
        return $this->sandbox;
    }

    /**
     * Get the base URL.
     */
    public function getBaseUrl(): string
    {
        return $this->baseUrl;
    }

    /**
     * Check domain availability.
     */
    public function checkDomainAvailability(array $domains, array $tlds = []): array
    {
        // ResellerClub expects each domain as separate parameter
        $params = [];

        // For single domain (most common case)
        if (count($domains) === 1) {
            $params['domain-name'] = $domains[0];  // ✅ Single string
        } else {
            // For multiple domains, use array notation
            foreach ($domains as $index => $domain) {
                $params['domain-name'][] = $domain;
            }
        }

        if (!empty($tlds)) {
            if (count($tlds) === 1) {
                $params['tlds'] = $tlds[0];  // ✅ Single string: tlds = "com"
            } else {
                // For multiple TLDs, use array notation
                foreach ($tlds as $index => $tld) {
                    $params['tlds'][] = $tld;
                }
            }
        }

        return $this->get('/domains/available.json', $params);
    }

    /**
     * Get reseller pricing for products.
     */
    public function getResellerPricing(): array
    {
        return $this->get('/products/reseller-price.json');
    }

    /**
     * Get pricing for a specific classkey.
     */
    public function getPricingForClasskey(string $classkey): ?array
    {
        try {
            $pricing = $this->getResellerPricing();
            
            // Look for the classkey in the response
            foreach ($pricing as $product) {
                if (isset($product['classkey']) && $product['classkey'] === $classkey) {
                    return $product;
                }
            }
            
            return null;
        } catch (\Exception $e) {
            Log::error('Failed to get pricing for classkey', [
                'classkey' => $classkey,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Register a domain.
     */
    public function registerDomain(array $params): array
    {
        return $this->post('/domains/register.json', $params);
    }

    /**
     * Get domain details.
     */
    public function getDomainDetails(int $orderId): array
    {
        return $this->get('/domains/details.json', [
            'order-id' => $orderId,
            'options' => 'All',
        ]);
    }

    /**
     * Get domain details by domain name.
     */
    public function getDomainDetailsByName(string $domain): array
    {
        return $this->get('/domains/details-by-name.json', [
            'domain-name' => $domain,
            'options' => 'All',
        ]);
    }

    /**
     * Modify nameservers.
     */
    public function modifyNameservers(int $orderId, array $nameservers): array
    {
        $params = ['order-id' => $orderId];

        foreach ($nameservers as $index => $ns) {
            $params['ns'][] = $ns;
        }

        return $this->post('/domains/modify-ns.json', $params);
    }

    /**
     * Modify privacy protection.
     */
    public function modifyPrivacyProtection(int $orderId, bool $protect): array
    {
        return $this->post('/domains/modify-privacy-protection.json', [
            'order-id' => $orderId,
            'protect-privacy' => $protect,
        ]);
    }

    /**
     * Enable theft protection (lock).
     */
    public function enableTheftProtection(int $orderId): array
    {
        return $this->post('/domains/enable-theft-protection.json', [
            'order-id' => $orderId,
        ]);
    }

    /**
     * Disable theft protection (unlock).
     */
    public function disableTheftProtection(int $orderId): array
    {
        return $this->post('/domains/disable-theft-protection.json', [
            'order-id' => $orderId,
        ]);
    }

    /**
     * Renew domain.
     */
    public function renewDomain(int $orderId, int $years, string $invoiceOption = 'NoInvoice'): array
    {
        return $this->post('/domains/renew.json', [
            'order-id' => $orderId,
            'years' => $years,
            'exp-date' => time(), // Current expiry timestamp
            'invoice-option' => $invoiceOption,
        ]);
    }

    /**
     * Transfer domain.
     */
    public function transferDomain(string $domain, string $authCode, array $params = []): array
    {
        return $this->post('/domains/transfer.json', array_merge([
            'domain-name' => $domain,
            'auth-code' => $authCode,
        ], $params));
    }

    /**
     * Create customer.
     */
    public function createCustomer(array $params): array
    {
        return $this->post('/customers/signup.json', $params);
    }

    /**
     * Get customer details.
     */
    public function getCustomerDetails(int $customerId): array
    {
        return $this->get('/customers/details.json', [
            'customer-id' => $customerId,
        ]);
    }

    /**
     * Add contact.
     */
    public function addContact(array $params): array
    {
        return $this->post('/contacts/add.json', $params);
    }

    /**
     * Get contact details.
     */
    public function getContactDetails(int $contactId): array
    {
        return $this->get('/contacts/details.json', [
            'contact-id' => $contactId,
        ]);
    }

    /**
     * Modify contact.
     */
    public function modifyContact(int $contactId, array $params): array
    {
        return $this->post('/contacts/modify.json', array_merge([
            'contact-id' => $contactId,
        ], $params));
    }

    /**
     * Add hosting order.
     */
    public function addHostingOrder(array $params): array
    {
        return $this->post('/hosting/linux/add.json', $params);
    }

    /**
     * Get hosting order details.
     */
    public function getHostingOrderDetails(int $orderId): array
    {
        return $this->get('/hosting/linux/details.json', [
            'order-id' => $orderId,
        ]);
    }

    /**
     * Search orders.
     */
    public function searchOrders(array $params): array
    {
        return $this->get('/orders/search.json', $params);
    }

    /**
     * Get order details.
     */
    public function getOrderDetails(int $orderId): array
    {
        return $this->get('/orders/details.json', [
            'order-id' => $orderId,
        ]);
    }
}

class ResellerClubException extends \Exception {}
