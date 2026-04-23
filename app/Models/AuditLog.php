<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class AuditLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'auditable_type',
        'auditable_id',
        'user_id',
        'action',
        'provider',
        'method',
        'endpoint',
        'request_data',
        'response_data',
        'response_code',
        'status',
        'duration_ms',
        'error_message',
        'transaction_id',
        'ip_address',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /**
     * Get the auditable model.
     */
    public function auditable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Get the user.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Mask sensitive data in request/response.
     */
    public static function maskSensitiveData(array $data): array
    {
        $sensitiveKeys = [
            'password',
            'api-key',
            'api_key',
            'auth-password',
            'auth_password',
            'secret',
            'token',
            'pw',
            'auth_code',
            'authInfo',
        ];

        array_walk_recursive($data, function (&$value, $key) use ($sensitiveKeys) {
            if (in_array(strtolower($key), array_map('strtolower', $sensitiveKeys))) {
                $value = '***MASKED***';
            }
        });

        return $data;
    }

    /**
     * Log a provider request/response.
     */
    public static function logProviderRequest(array $params): self
    {
        return self::create([
            'auditable_type' => $params['auditable_type'] ?? null,
            'auditable_id' => $params['auditable_id'] ?? null,
            'user_id' => $params['user_id'] ?? auth()->id(),
            'action' => $params['action'],
            'provider' => $params['provider'],
            'method' => $params['method'],
            'endpoint' => $params['endpoint'] ?? null,
            'request_data' => isset($params['request']) ? json_encode(self::maskSensitiveData($params['request'])) : null,
            'response_data' => isset($params['response']) ? json_encode(self::maskSensitiveData($params['response'])) : null,
            'response_code' => $params['response_code'] ?? null,
            'status' => $params['status'],
            'duration_ms' => $params['duration_ms'] ?? null,
            'error_message' => $params['error_message'] ?? null,
            'transaction_id' => $params['transaction_id'] ?? null,
            'ip_address' => $params['ip_address'] ?? request()->ip(),
        ]);
    }

    /**
     * Scope to get logs for a specific provider.
     */
    public function scopeForProvider($query, string $provider)
    {
        return $query->where('provider', $provider);
    }

    /**
     * Scope to get logs for a specific action.
     */
    public function scopeForAction($query, string $action)
    {
        return $query->where('action', $action);
    }

    /**
     * Scope to get failed logs.
     */
    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    /**
     * Scope to get successful logs.
     */
    public function scopeSuccessful($query)
    {
        return $query->where('status', 'success');
    }
}
