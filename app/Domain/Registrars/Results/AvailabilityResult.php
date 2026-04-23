<?php

namespace App\Domain\Registrars\Results;

class AvailabilityResult
{
    public function __construct(
        public readonly string $domain,
        public readonly bool $available,
        public readonly ?string $reason = null,
        public readonly ?float $price = null,
        public readonly ?string $currency = null,
        public readonly ?int $period = null,
        public readonly array $metadata = []
    ) {}

    public function isAvailable(): bool
    {
        return $this->available;
    }

    public function isUnavailable(): bool
    {
        return !$this->available;
    }

    public function getFormattedPrice(): ?string
    {
        if ($this->price === null || $this->currency === null) {
            return null;
        }

        return number_format($this->price, 2) . ' ' . $this->currency;
    }

    public function toArray(): array
    {
        return [
            'domain' => $this->domain,
            'available' => $this->available,
            'reason' => $this->reason,
            'price' => $this->price,
            'currency' => $this->currency,
            'period' => $this->period,
            'metadata' => $this->metadata,
        ];
    }
}



