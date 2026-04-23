<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'order_number',
        'status',
        'total_amount',
        'currency',
        'payment_method',
        'payment_status',
        'notes',
        'processed_at',
    ];

    protected function casts(): array
    {
        return [
            'total_amount' => 'decimal:2',
            'processed_at' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /**
     * Get the customer that owns the order.
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Get the order items for the order.
     */
    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Get the domain orders for the order.
     */
    public function domainOrders(): MorphMany
    {
        return $this->morphMany(DomainOrder::class, 'orderable');
    }

    /**
     * Get the hosting orders for the order.
     */
    public function hostingOrders(): MorphMany
    {
        return $this->morphMany(HostingOrder::class, 'orderable');
    }

    /**
     * Calculate the total amount for the order.
     */
    public function calculateTotal(): float
    {
        return $this->orderItems()->sum('total_price');
    }
}
