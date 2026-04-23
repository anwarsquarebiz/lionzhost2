<?php

namespace App\Domain\Registrars\Results;

class ProviderContactRef
{
    public function __construct(
        public readonly string $provider,
        public readonly string $contactId,
        public readonly string $type, // registrant, admin, tech, billing
        public readonly ?string $externalId = null,
        public readonly array $metadata = []
    ) {}

    public function isRegistrant(): bool
    {
        return $this->type === 'registrant';
    }

    public function isAdmin(): bool
    {
        return $this->type === 'admin';
    }

    public function isTech(): bool
    {
        return $this->type === 'tech';
    }

    public function isBilling(): bool
    {
        return $this->type === 'billing';
    }

    public function toArray(): array
    {
        return [
            'provider' => $this->provider,
            'contact_id' => $this->contactId,
            'type' => $this->type,
            'external_id' => $this->externalId,
            'metadata' => $this->metadata,
        ];
    }
}








