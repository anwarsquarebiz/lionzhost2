<?php

namespace App\Jobs;

use App\Domain\ResellerClub\HostingService;
use App\Models\HostingOrder;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class SyncResellerClubOrdersJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;
    public int $backoff = 60;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public ?int $hostingOrderId = null
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Log::info('ResellerClub hosting orders sync started');

        try {
            $hostingService = new HostingService();
            $query = HostingOrder::where('provider', 'resellerclub')
                ->whereNotNull('provider_order_id')
                ->whereIn('status', ['pending', 'active']);

            // If specific order ID provided, sync only that one
            if ($this->hostingOrderId) {
                $query->where('id', $this->hostingOrderId);
            }

            $orders = $query->get();
            $syncedCount = 0;

            foreach ($orders as $order) {
                try {
                    $hostingService->syncHostingStatus($order);
                    $syncedCount++;
                } catch (\Exception $e) {
                    Log::error('Failed to sync hosting order', [
                        'hosting_order_id' => $order->id,
                        'error' => $e->getMessage()
                    ]);
                }
            }

            Log::info('ResellerClub hosting orders sync completed', [
                'synced_count' => $syncedCount,
                'total_count' => $orders->count()
            ]);
        } catch (\Exception $e) {
            Log::error('ResellerClub hosting orders sync failed', [
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
        return [60, 120, 300];
    }
}
