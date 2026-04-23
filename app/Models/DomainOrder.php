<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class DomainOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'orderable_type',
        'orderable_id',
        'domain',
        'tld_id',
        'years',
        'nameservers',
        'privacy_protection',
        'auth_code',
        'provider',
        'status',
        'registered_at',
        'expires_at',
        'auto_renewal',
    ];

    protected function casts(): array
    {
        return [
            'nameservers' => 'array',
            'privacy_protection' => 'boolean',
            'auto_renewal' => 'boolean',
            'registered_at' => 'datetime',
            'expires_at' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /**
     * Get the polymorphic orderable model.
     */
    public function orderable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Get the TLD that owns the domain order.
     */
    public function tld(): BelongsTo
    {
        return $this->belongsTo(Tld::class);
    }

    /**
     * Get the full domain name.
     */
    public function getFullDomainAttribute(): string
    {
        return $this->domain . '.' . $this->tld->extension;
    }

    /**
     * Check if the domain is expired.
     */
    public function isExpired(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    /**
     * Check if the domain is expiring soon (within 30 days).
     */
    public function isExpiringSoon(): bool
    {
        return $this->expires_at && $this->expires_at->isBefore(now()->addDays(30));
    }
}
