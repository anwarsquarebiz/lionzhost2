<?php

namespace App\Domain\ResellerClub;

use App\Models\Customer;
use App\Models\HostingOrder;
use App\Models\Product;
use Illuminate\Support\Facades\Log;

class HostingService
{
    private ResellerClubClient $client;

    public function __construct(?ResellerClubClient $client = null)
    {
        $this->client = $client ?? new ResellerClubClient();
    }

    /**
     * Purchase hosting package.
     */
    public function purchaseHosting(array $params): HostingOrder
    {
        try {
            // Validate required parameters
            $required = ['customer_id', 'product_id', 'domain', 'package_name', 'billing_cycle'];
            foreach ($required as $field) {
                if (!isset($params[$field])) {
                    throw new \InvalidArgumentException("Missing required field: {$field}");
                }
            }

            $customer = Customer::findOrFail($params['customer_id']);
            $product = Product::findOrFail($params['product_id']);

            // Prepare ResellerClub API parameters
            $rcParams = [
                'domain-name' => $params['domain'],
                'plan-id' => $params['package_name'],
                'months' => $params['billing_cycle'],
                'customer-id' => $this->getResellerClubCustomerId($customer),
            ];

            // Add optional parameters
            if (isset($params['username'])) {
                $rcParams['username'] = $params['username'];
            }
            if (isset($params['password'])) {
                $rcParams['passwd'] = $params['password'];
            }

            // Call ResellerClub API
            $response = $this->client->addHostingOrder($rcParams);
            $providerOrderId = $response['orderid'] ?? $response['entityid'] ?? null;

            if (!$providerOrderId) {
                throw new \Exception('Hosting purchase failed: No order ID returned');
            }

            // Calculate expiry date
            $expiresAt = now()->addMonths($params['billing_cycle']);

            // Create hosting order in database
            $hostingOrder = HostingOrder::create([
                'orderable_type' => $params['orderable_type'] ?? null,
                'orderable_id' => $params['orderable_id'] ?? null,
                'product_id' => $product->id,
                'customer_id' => $customer->id,
                'provider' => 'resellerclub',
                'provider_order_id' => (string)$providerOrderId,
                'domain' => $params['domain'],
                'package_name' => $params['package_name'],
                'status' => 'pending',
                'billing_cycle' => $params['billing_cycle'],
                'price' => $product->price,
                'currency' => $product->currency,
                'features' => $product->features,
                'expires_at' => $expiresAt,
                'auto_renewal' => $params['auto_renewal'] ?? true,
                'provider_data' => $response,
            ]);

            Log::info('Hosting purchased successfully', [
                'hosting_order_id' => $hostingOrder->id,
                'provider_order_id' => $providerOrderId,
                'domain' => $params['domain']
            ]);

            return $hostingOrder;
        } catch (\Exception $e) {
            Log::error('Hosting purchase failed', [
                'params' => $params,
                'error' => $e->getMessage()
            ]);

            throw new \Exception('Hosting purchase failed: ' . $e->getMessage());
        }
    }

    /**
     * Get hosting status from ResellerClub.
     */
    public function getHostingStatus(HostingOrder $hostingOrder): array
    {
        try {
            if (!$hostingOrder->provider_order_id) {
                throw new \Exception('No provider order ID found');
            }

            $response = $this->client->getHostingOrderDetails((int)$hostingOrder->provider_order_id);

            return [
                'status' => $response['currentstatus'] ?? 'unknown',
                'details' => $response,
            ];
        } catch (\Exception $e) {
            Log::error('Failed to get hosting status', [
                'hosting_order_id' => $hostingOrder->id,
                'error' => $e->getMessage()
            ]);

            throw new \Exception('Failed to get hosting status: ' . $e->getMessage());
        }
    }

    /**
     * Sync hosting status with ResellerClub.
     */
    public function syncHostingStatus(HostingOrder $hostingOrder): void
    {
        try {
            $statusData = $this->getHostingStatus($hostingOrder);
            $status = $statusData['status'];
            $details = $statusData['details'];

            // Map ResellerClub status to our status
            $mappedStatus = $this->mapResellerClubStatus($status);

            // Update hosting order
            $hostingOrder->update([
                'status' => $mappedStatus,
                'provider_data' => $details,
            ]);

            // Update timestamps based on status
            if ($mappedStatus === 'active' && !$hostingOrder->activated_at) {
                $hostingOrder->update(['activated_at' => now()]);
            } elseif ($mappedStatus === 'suspended' && !$hostingOrder->suspended_at) {
                $hostingOrder->update(['suspended_at' => now()]);
            } elseif ($mappedStatus === 'cancelled' && !$hostingOrder->cancelled_at) {
                $hostingOrder->update(['cancelled_at' => now()]);
            }

            Log::info('Hosting status synced', [
                'hosting_order_id' => $hostingOrder->id,
                'old_status' => $hostingOrder->getOriginal('status'),
                'new_status' => $mappedStatus
            ]);
        } catch (\Exception $e) {
            Log::error('Hosting status sync failed', [
                'hosting_order_id' => $hostingOrder->id,
                'error' => $e->getMessage()
            ]);

            throw new \Exception('Hosting status sync failed: ' . $e->getMessage());
        }
    }

    /**
     * Map ResellerClub status to our status.
     */
    private function mapResellerClubStatus(string $rcStatus): string
    {
        return match (strtolower($rcStatus)) {
            'active', 'success' => 'active',
            'suspended' => 'suspended',
            'deleted', 'cancelled' => 'cancelled',
            'failed', 'failure' => 'failed',
            default => 'pending',
        };
    }

    /**
     * Get or create ResellerClub customer ID.
     */
    private function getResellerClubCustomerId(Customer $customer): int
    {
        // In a real implementation, you'd store the RC customer ID in your database
        // For now, return a placeholder
        return 0;
    }
}








