<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tld extends Model
{
    use HasFactory;

    protected $fillable = [
        'extension',
        'name',
        'registry_operator',
        'is_active',
        'min_years',
        'max_years',
        'auto_renewal',
        'privacy_protection',
        'dns_management',
        'email_forwarding',
        'id_protection',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'auto_renewal' => 'boolean',
            'privacy_protection' => 'boolean',
            'dns_management' => 'boolean',
            'email_forwarding' => 'boolean',
            'id_protection' => 'boolean',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /**
     * Get the domain prices for the TLD.
     */
    public function domainPrices(): HasMany
    {
        return $this->hasMany(DomainPrice::class);
    }

    /**
     * Get the domain orders for the TLD.
     */
    public function domainOrders(): HasMany
    {
        return $this->hasMany(DomainOrder::class);
    }
}
