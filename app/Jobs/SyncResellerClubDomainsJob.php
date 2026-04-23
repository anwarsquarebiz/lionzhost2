<?php

namespace App\Jobs;

use App\Domain\Registrars\Providers\ResellerClubHttpProvider;
use App\Domain\ResellerClub\ResellerClubClient;
use App\Models\DomainOrder;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class SyncResellerClubDomainsJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;
    public int $backoff = 60;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public ?int $domainOrderId = null
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Log::info('ResellerClub domain sync started');

        try {
            $provider = new ResellerClubHttpProvider();
            $client = new ResellerClubClient();

            $query = DomainOrder::where('provider', 'resellerclub')
                ->whereIn('status', ['pending', 'registered', 'active']);

            // If specific domain order ID provided, sync only that one
            if ($this->domainOrderId) {
                $query->where('id', $this->domainOrderId);
            }

            $domainOrders = $query->get();
            $syncedCount = 0;

            foreach ($domainOrders as $domainOrder) {
                try {
                    $domain = $domainOrder->domain . '.' . $domainOrder->tld->extension;
                    
                    // Get domain info from ResellerClub
                    $domainInfo = $provider->getDomainInfo($domain);

                    // Update domain order status
                    $updates = [
                        'status' => $this->mapDomainStatus($domainInfo->status),
                        'expires_at' => $domainInfo->expiresAt,
                    ];

                    // Update nameservers if different
                    if (!empty($domainInfo->nameservers)) {
                        $updates['nameservers'] = $domainInfo->nameservers;
                    }

                    // Update privacy and lock status
                    $updates['privacy_protection'] = $domainInfo->privacyEnabled;
                    $updates['auto_renewal'] = $domainInfo->autoRenew;

                    $domainOrder->update($updates);
                    $syncedCount++;

                    Log::info('Domain synced successfully', [
                        'domain_order_id' => $domainOrder->id,
                        'domain' => $domain,
                        'status' => $updates['status']
                    ]);
                } catch (\Exception $e) {
                    Log::error('Failed to sync domain order', [
                        'domain_order_id' => $domainOrder->id,
                        'error' => $e->getMessage()
                    ]);
                }
            }

            Log::info('ResellerClub domain sync completed', [
                'synced_count' => $syncedCount,
                'total_count' => $domainOrders->count()
            ]);
        } catch (\Exception $e) {
            Log::error('ResellerClub domain sync failed', [
                'error' => $e->getMessage()
            ]);

            throw $e;
        }
    }

    /**
     * Map ResellerClub domain status to our status.
     */
    private function mapDomainStatus(string $rcStatus): string
    {
        return match (strtolower($rcStatus)) {
            'active', 'ok' => 'registered',
            'pending' => 'pending',
            'expired' => 'expired',
            'cancelled', 'deleted' => 'cancelled',
            'failed' => 'failed',
            default => 'pending',
        };
    }

    /**
     * Calculate the number of seconds to wait before retrying the job.
     */
    public function backoff(): array
    {
        return [60, 120, 300];
    }
}
