<?php

namespace App\Jobs;

use App\Domain\ResellerClub\HostingService;
use App\Models\HostingOrder;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class ProvisionHostingOrderJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;
    public int $backoff = 120;
    public string $uniqueId;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public int $hostingOrderId
    ) {
        // Generate unique ID for idempotency
        $this->uniqueId = 'provision-hosting-' . $this->hostingOrderId;
    }

    /**
     * Get the unique ID for the job.
     */
    public function uniqueId(): string
    {
        return $this->uniqueId;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Log::info('Provisioning hosting order started', ['hosting_order_id' => $this->hostingOrderId]);

        try {
            $hostingOrder = HostingOrder::with(['product', 'customer'])->findOrFail($this->hostingOrderId);

            // Check if already provisioned
            if ($hostingOrder->isActive()) {
                Log::info('Hosting order already provisioned', ['hosting_order_id' => $this->hostingOrderId]);
                return;
            }

            // Check if already has provider order ID (idempotency)
            if ($hostingOrder->provider_order_id) {
                Log::info('Hosting order already has provider ID, syncing status', [
                    'hosting_order_id' => $this->hostingOrderId,
                    'provider_order_id' => $hostingOrder->provider_order_id
                ]);

                $hostingService = new HostingService();
                $hostingService->syncHostingStatus($hostingOrder);
                return;
            }

            // Update status to processing
            $hostingOrder->update(['status' => 'processing']);

            // Purchase hosting via ResellerClub
            $hostingService = new HostingService();
            
            $params = [
                'customer_id' => $hostingOrder->customer_id,
                'product_id' => $hostingOrder->product_id,
                'domain' => $hostingOrder->domain,
                'package_name' => $hostingOrder->package_name,
                'billing_cycle' => $hostingOrder->billing_cycle,
                'orderable_type' => get_class($hostingOrder->orderable),
                'orderable_id' => $hostingOrder->orderable_id,
                'auto_renewal' => $hostingOrder->auto_renewal,
            ];

            // Note: This will create a NEW hosting order in the database
            // We need to update the existing one instead
            $result = $hostingService->purchaseHosting($params);

            // Copy provider data to existing hosting order
            $hostingOrder->update([
                'provider_order_id' => $result->provider_order_id,
                'status' => 'active',
                'activated_at' => now(),
                'provider_data' => $result->provider_data,
            ]);

            Log::info('Hosting provisioned successfully', [
                'hosting_order_id' => $this->hostingOrderId,
                'provider_order_id' => $result->provider_order_id
            ]);
        } catch (\Exception $e) {
            Log::error('Hosting provisioning failed', [
                'hosting_order_id' => $this->hostingOrderId,
                'error' => $e->getMessage()
            ]);

            // Update hosting order status
            HostingOrder::where('id', $this->hostingOrderId)
                ->update(['status' => 'failed']);

            throw $e;
        }
    }

    /**
     * Calculate the number of seconds to wait before retrying the job.
     */
    public function backoff(): array
    {
        return [120, 300, 900]; // 2 min, 5 min, 15 min
    }
}
