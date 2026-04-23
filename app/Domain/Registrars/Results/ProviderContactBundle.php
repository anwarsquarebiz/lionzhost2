<?php

namespace App\Domain\Registrars\Results;

class ProviderContactBundle
{
    public function __construct(
        public readonly ProviderContactRef $registrant,
        public readonly ?ProviderContactRef $admin = null,
        public readonly ?ProviderContactRef $tech = null,
        public readonly ?ProviderContactRef $billing = null
    ) {}

    public function getAdmin(): ProviderContactRef
    {
        return $this->admin ?? $this->registrant;
    }

    public function getTech(): ProviderContactRef
    {
        return $this->tech ?? $this->registrant;
    }

    public function getBilling(): ProviderContactRef
    {
        return $this->billing ?? $this->registrant;
    }

    public function toArray(): array
    {
        return [
            'registrant' => $this->registrant->toArray(),
            'admin' => $this->admin?->toArray(),
            'tech' => $this->tech?->toArray(),
            'billing' => $this->billing?->toArray(),
        ];
    }
}








