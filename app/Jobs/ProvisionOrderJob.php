<?php

namespace App\Jobs;

use App\Models\Order;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class ProvisionOrderJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;
    public int $backoff = 60;
    public string $uniqueId;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public int $orderId
    ) {
        // Generate unique ID for idempotency
        $this->uniqueId = 'provision-order-' . $this->orderId;
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
        Log::info('Provisioning order started', ['order_id' => $this->orderId]);

        try {
            $order = Order::findOrFail($this->orderId);

            // Check if already provisioned
            if ($order->status === 'completed') {
                Log::info('Order already provisioned', ['order_id' => $this->orderId]);
                return;
            }

            // Update order status
            $order->update(['status' => 'processing']);

            $provisionedCount = 0;
            $failedCount = 0;

            // Provision domain orders
            foreach ($order->domainOrders as $domainOrder) {
                try {
                    ProvisionDomainOrderJob::dispatch($domainOrder->id);
                    $provisionedCount++;
                } catch (\Exception $e) {
                    $failedCount++;
                    Log::error('Failed to dispatch domain provisioning', [
                        'domain_order_id' => $domainOrder->id,
                        'error' => $e->getMessage()
                    ]);
                }
            }

            // Provision hosting orders
            foreach ($order->hostingOrders as $hostingOrder) {
                try {
                    ProvisionHostingOrderJob::dispatch($hostingOrder->id);
                    $provisionedCount++;
                } catch (\Exception $e) {
                    $failedCount++;
                    Log::error('Failed to dispatch hosting provisioning', [
                        'hosting_order_id' => $hostingOrder->id,
                        'error' => $e->getMessage()
                    ]);
                }
            }

            // Update order status based on results
            if ($failedCount === 0) {
                $order->update([
                    'status' => 'processing',
                    'processed_at' => now(),
                ]);
            } else {
                $order->update(['status' => 'failed']);
            }

            Log::info('Provisioning order completed', [
                'order_id' => $this->orderId,
                'provisioned' => $provisionedCount,
                'failed' => $failedCount
            ]);
        } catch (\Exception $e) {
            Log::error('Provisioning order failed', [
                'order_id' => $this->orderId,
                'error' => $e->getMessage()
            ]);

            throw $e;
        }
    }

    /**
     * Calculate the number of seconds to wait before retrying the job.
     */
    public function backoff(): array
    {
        return [60, 180, 600]; // 1 min, 3 min, 10 min
    }
}
