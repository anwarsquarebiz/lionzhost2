<?php

namespace App\Domain\Registrars\Results;

class DomainInfo
{
    public function __construct(
        public readonly string $domain,
        public readonly string $status,
        public readonly ?\DateTimeInterface $createdAt = null,
        public readonly ?\DateTimeInterface $expiresAt = null,
        public readonly ?\DateTimeInterface $updatedAt = null,
        public readonly array $nameservers = [],
        public readonly ?string $authCode = null,
        public readonly bool $privacyEnabled = false,
        public readonly bool $locked = false,
        public readonly bool $autoRenew = false,
        public readonly array $metadata = []
    ) {}

    public function isActive(): bool
    {
        return in_array($this->status, ['active', 'registered', 'ok']);
    }

    public function isExpired(): bool
    {
        return $this->expiresAt && $this->expiresAt < new \DateTime();
    }

    public function isExpiringSoon(int $days = 30): bool
    {
        if (!$this->expiresAt) {
            return false;
        }

        $threshold = new \DateTime("+{$days} days");
        return $this->expiresAt < $threshold;
    }

    public function getDaysUntilExpiry(): ?int
    {
        if (!$this->expiresAt) {
            return null;
        }

        $now = new \DateTime();
        $diff = $now->diff($this->expiresAt);
        return $diff->invert ? -$diff->days : $diff->days;
    }

    public function toArray(): array
    {
        return [
            'domain' => $this->domain,
            'status' => $this->status,
            'created_at' => $this->createdAt?->format('Y-m-d H:i:s'),
            'expires_at' => $this->expiresAt?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updatedAt?->format('Y-m-d H:i:s'),
            'nameservers' => $this->nameservers,
            'auth_code' => $this->authCode,
            'privacy_enabled' => $this->privacyEnabled,
            'locked' => $this->locked,
            'auto_renew' => $this->autoRenew,
            'metadata' => $this->metadata,
        ];
    }
}








