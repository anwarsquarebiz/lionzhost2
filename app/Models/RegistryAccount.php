<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RegistryAccount extends Model
{
    use HasFactory;

    protected $fillable = [
        'provider',
        'username',
        'password',
        'api_key',
        'api_secret',
        'mode',
        'is_active',
        'test_credentials',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'test_credentials' => 'boolean',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /**
     * Get the encrypted password.
     */
    public function getPasswordAttribute($value): string
    {
        return decrypt($value);
    }

    /**
     * Set the encrypted password.
     */
    public function setPasswordAttribute($value): void
    {
        $this->attributes['password'] = encrypt($value);
    }

    /**
     * Get the encrypted API secret.
     */
    public function getApiSecretAttribute($value): string
    {
        return decrypt($value);
    }

    /**
     * Set the encrypted API secret.
     */
    public function setApiSecretAttribute($value): void
    {
        $this->attributes['api_secret'] = encrypt($value);
    }

    /**
     * Check if the account is in live mode.
     */
    public function isLiveMode(): bool
    {
        return $this->mode === 'live';
    }

    /**
     * Check if the account is in test mode.
     */
    public function isTestMode(): bool
    {
        return $this->mode === 'test';
    }

    /**
     * Check if the account is in sandbox mode.
     */
    public function isSandboxMode(): bool
    {
        return $this->mode === 'sandbox';
    }
}
