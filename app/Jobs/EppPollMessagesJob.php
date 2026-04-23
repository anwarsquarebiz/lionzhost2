<?php

namespace App\Jobs;

use App\Domain\Registrars\Providers\CentralnicEppProvider;
use App\Models\EppPollMessage;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class EppPollMessagesJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;
    public int $backoff = 60; // 1 minute exponential backoff

    /**
     * Create a new job instance.
     */
    public function __construct(
        public string $provider = 'centralnic'
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Log::info('EPP poll messages job started', ['provider' => $this->provider]);

        try {
            $provider = $this->getProvider();
            
            if (!$provider->isAvailable()) {
                Log::warning('EPP provider not available', ['provider' => $this->provider]);
                return;
            }

            $messages = $provider->pollMessages();
            $processedCount = 0;

            foreach ($messages as $message) {
                try {
                    // Store message in database
                    EppPollMessage::create([
                        'provider' => $this->provider,
                        'message_id' => $message['id'],
                        'message_date' => $message['date'],
                        'message' => $message['message'],
                        'response_data' => json_encode($message['response']),
                        'processed' => false,
                    ]);

                    // Acknowledge message
                    $provider->acknowledgePollMessage($message['id']);
                    
                    $processedCount++;

                    Log::info('EPP poll message processed', [
                        'provider' => $this->provider,
                        'message_id' => $message['id']
                    ]);
                } catch (\Exception $e) {
                    Log::error('Failed to process EPP poll message', [
                        'provider' => $this->provider,
                        'message_id' => $message['id'] ?? 'unknown',
                        'error' => $e->getMessage()
                    ]);
                }
            }

            Log::info('EPP poll messages job completed', [
                'provider' => $this->provider,
                'processed_count' => $processedCount
            ]);
        } catch (\Exception $e) {
            Log::error('EPP poll messages job failed', [
                'provider' => $this->provider,
                'error' => $e->getMessage()
            ]);

            throw $e; // Re-throw to trigger retry
        }
    }

    /**
     * Get the provider instance.
     */
    private function getProvider(): CentralnicEppProvider
    {
        return match ($this->provider) {
            'centralnic' => new CentralnicEppProvider(),
            default => throw new \InvalidArgumentException("Unknown provider: {$this->provider}")
        };
    }

    /**
     * Calculate the number of seconds to wait before retrying the job.
     */
    public function backoff(): array
    {
        return [60, 120, 300]; // 1 minute, 2 minutes, 5 minutes
    }
}
