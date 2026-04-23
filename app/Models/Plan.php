<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Plan extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'resellerclub_plan_id',
        'plan_type',
        'package_months',
        'price_per_month',
        'setup_fee',
        'is_active',
    ];

    protected $appends = [
        'total_price',
        'billing_period_display',
    ];

    protected function casts(): array
    {
        return [
            'price_per_month' => 'decimal:2',
            'setup_fee' => 'decimal:2',
            'is_active' => 'boolean',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /**
     * Get the product that owns the plan.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the total price for the billing period.
     */
    public function getTotalPriceAttribute(): float
    {
        return round(($this->price_per_month * $this->package_months) + $this->setup_fee, 2);
    }

    /**
     * Get billing period display name.
     */
    public function getBillingPeriodDisplayAttribute(): string
    {
        if ($this->package_months == 1) {
            return '1 Month';
        } elseif ($this->package_months < 12) {
            return $this->package_months . ' Months';
        } elseif ($this->package_months == 12) {
            return '1 Year';
        } elseif ($this->package_months == 24) {
            return '2 Years';
        } elseif ($this->package_months == 36) {
            return '3 Years';
        } else {
            return $this->package_months . ' Months';
        }
    }

    /**
     * Get monthly savings compared to 1-month plan.
     */
    public function getSavingsPercentageAttribute(): float
    {
        $oneMonthPlan = Plan::where('product_id', $this->product_id)
            ->where('plan_type', $this->plan_type)
            ->where('package_months', 1)
            ->first();

        if (!$oneMonthPlan || $oneMonthPlan->id === $this->id) {
            return 0;
        }

        $savings = (($oneMonthPlan->price_per_month - $this->price_per_month) / $oneMonthPlan->price_per_month) * 100;
        return max(0, $savings);
    }
}
