<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cart extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'session_id',
        'subtotal',
        'tax',
        'total',
        'currency',
        'coupon_code',
        'discount',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'subtotal' => 'decimal:2',
            'tax' => 'decimal:2',
            'total' => 'decimal:2',
            'discount' => 'decimal:2',
            'expires_at' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /**
     * Get the user that owns the cart.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the cart items.
     */
    public function items(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    /**
     * Calculate cart totals.
     */
    public function calculateTotals(): void
    {
        $subtotal = $this->items->sum('total_price');
        $discount = $this->discount ?? 0;
        $tax = ($subtotal - $discount) * 0.0; // Tax calculation can be customized
        $total = $subtotal - $discount + $tax;

        $this->update([
            'subtotal' => $subtotal,
            'tax' => $tax,
            'total' => $total,
        ]);
    }

    /**
     * Add item to cart.
     */
    public function addItem(array $data): CartItem
    {
        $item = $this->items()->create($data);
        $this->calculateTotals();
        return $item;
    }

    /**
     * Remove item from cart.
     */
    public function removeItem(int $itemId): void
    {
        $this->items()->where('id', $itemId)->delete();
        $this->calculateTotals();
    }

    /**
     * Clear all items from cart.
     */
    public function clear(): void
    {
        $this->items()->delete();
        $this->calculateTotals();
    }

    /**
     * Check if cart is empty.
     */
    public function isEmpty(): bool
    {
        return $this->items()->count() === 0;
    }

    /**
     * Check if cart is expired.
     */
    public function isExpired(): bool
    {
        return $this->expires_at && $this->expires_at < now();
    }
}
