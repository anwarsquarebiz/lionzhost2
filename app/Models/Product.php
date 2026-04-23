<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'location',
        'product_type',
        'description',
        'currency',
        'resellerclub_key',
        'is_active',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /**
     * Get the plans for the product.
     */
    public function plans(): HasMany
    {
        return $this->hasMany(Plan::class);
    }

    /**
     * Get the features for the product.
     */
    public function features(): HasMany
    {
        return $this->hasMany(Feature::class);
    }

    /**
     * Get active plans for the product.
     */
    public function activePlans(): HasMany
    {
        return $this->hasMany(Plan::class)->where('is_active', true);
    }

    /**
     * Get the cheapest plan for the product.
     */
    public function getCheapestPlanAttribute(): ?Plan
    {
        return $this->plans()
            ->where('is_active', true)
            ->where('plan_type', 'add')
            ->orderBy('price_per_month')
            ->first();
    }

    /**
     * Get plans grouped by plan type.
     */
    public function getPlansByType(string $type): HasMany
    {
        return $this->plans()->where('plan_type', $type);
    }
}
