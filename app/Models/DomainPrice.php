<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DomainPrice extends Model
{
    use HasFactory;

    protected $fillable = [
        'tld_id',
        'years',
        'cost',
        'margin',
        'sell_price',
        'is_premium',
        'is_promotional',
        'promotional_start',
        'promotional_end',
    ];

    protected function casts(): array
    {
        return [
            'cost' => 'decimal:2',
            'margin' => 'decimal:2',
            'sell_price' => 'decimal:2',
            'is_premium' => 'boolean',
            'is_promotional' => 'boolean',
            'promotional_start' => 'datetime',
            'promotional_end' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /**
     * Get the TLD that owns the domain price.
     */
    public function tld(): BelongsTo
    {
        return $this->belongsTo(Tld::class);
    }

    /**
     * Calculate the final sell price including margin.
     */
    public function getFinalPriceAttribute(): float
    {
        return $this->cost + $this->margin;
    }

    /**
     * Check if the price is currently promotional.
     */
    public function isCurrentlyPromotional(): bool
    {
        if (!$this->is_promotional) {
            return false;
        }

        $now = now();
        return $now->between($this->promotional_start, $this->promotional_end);
    }
}
