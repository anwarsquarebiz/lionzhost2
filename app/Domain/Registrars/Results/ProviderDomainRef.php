<?php

namespace App\Domain\Registrars\Results;

class ProviderDomainRef
{
    public function __construct(
        public readonly string $provider,
        public readonly string $domain,
        public readonly string $orderId,
        public readonly string $status,
        public readonly ?string $externalId = null,
        public readonly ?string $authCode = null,
        public readonly ?\DateTimeInterface $expiresAt = null,
        public readonly array $metadata = []
    ) {}

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isRegistered(): bool
    {
        return $this->status === 'registered';
    }

    public function isFailed(): bool
    {
        return $this->status === 'failed';
    }

    public function isCancelled(): bool
    {
        return $this->status === 'cancelled';
    }

    public function toArray(): array
    {
        return [
            'provider' => $this->provider,
            'domain' => $this->domain,
            'order_id' => $this->orderId,
            'status' => $this->status,
            'external_id' => $this->externalId,
            'auth_code' => $this->authCode,
            'expires_at' => $this->expiresAt?->format('Y-m-d H:i:s'),
            'metadata' => $this->metadata,
        ];
    }
}








