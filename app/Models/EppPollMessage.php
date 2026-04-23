<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EppPollMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'provider',
        'message_id',
        'message_date',
        'message',
        'response_data',
        'processed',
        'processed_at',
    ];

    protected function casts(): array
    {
        return [
            'message_date' => 'datetime',
            'response_data' => 'array',
            'processed' => 'boolean',
            'processed_at' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /**
     * Mark the message as processed.
     */
    public function markAsProcessed(): void
    {
        $this->update([
            'processed' => true,
            'processed_at' => now(),
        ]);
    }

    /**
     * Scope to get unprocessed messages.
     */
    public function scopeUnprocessed($query)
    {
        return $query->where('processed', false);
    }

    /**
     * Scope to get messages for a specific provider.
     */
    public function scopeForProvider($query, string $provider)
    {
        return $query->where('provider', $provider);
    }
}
