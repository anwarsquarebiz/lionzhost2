<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Feature extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'feature',
        'sort_order',
        'is_highlighted',
        'icon',
    ];

    protected function casts(): array
    {
        return [
            'is_highlighted' => 'boolean',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /**
     * Get the product that owns the feature.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
