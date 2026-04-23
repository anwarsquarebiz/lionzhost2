<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CartItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'cart_id',
        'type',
        'domain',
        'tld_id',
        'product_id',
        'years',
        'quantity',
        'unit_price',
        'total_price',
        'options',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'unit_price' => 'decimal:2',
            'total_price' => 'decimal:2',
            'options' => 'array',
            'metadata' => 'array',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /**
     * Get the cart that owns the item.
     */
    public function cart(): BelongsTo
    {
        return $this->belongsTo(Cart::class);
    }

    /**
     * Get the TLD for domain items.
     */
    public function tld(): BelongsTo
    {
        return $this->belongsTo(Tld::class);
    }

    /**
     * Get the product for hosting/other items.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Calculate total price.
     */
    public function calculateTotal(): void
    {
        $total = $this->unit_price * $this->quantity * $this->years;
        
        // Add upsells
        if ($this->hasOption('privacy')) {
            $total += 5.00 * $this->years; // Privacy protection cost
        }
        
        if ($this->hasOption('dnssec')) {
            $total += 3.00 * $this->years; // DNSSEC cost
        }

        $this->update(['total_price' => $total]);
    }

    /**
     * Check if item has a specific option.
     */
    public function hasOption(string $option): bool
    {
        return isset($this->options[$option]) && $this->options[$option];
    }

    /**
     * Get full domain name.
     */
    public function getFullDomain(): ?string
    {
        if ($this->type === 'domain' && $this->domain && $this->tld) {
            return $this->domain . '.' . $this->tld->extension;
        }
        
        return $this->domain;
    }
}
