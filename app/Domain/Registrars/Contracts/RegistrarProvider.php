<?php

namespace App\Domain\Registrars\Contracts;

use App\Domain\Registrars\Results\AvailabilityResult;
use App\Domain\Registrars\Results\DomainInfo;
use App\Domain\Registrars\Results\ProviderContactBundle;
use App\Domain\Registrars\Results\ProviderContactRef;
use App\Domain\Registrars\Results\ProviderDomainRef;
use App\Models\Contact;
use App\Models\DomainOrder;

interface RegistrarProvider
{
    /**
     * Check if a domain is available for registration.
     */
    public function checkAvailability(string $domain): AvailabilityResult;

    /**
     * Create or sync a contact with the provider.
     */
    public function createOrSyncContact(Contact $contact): ProviderContactRef;

    /**
     * Register a domain with the provider.
     */
    public function registerDomain(DomainOrder $order, ProviderContactBundle $contacts): ProviderDomainRef;

    /**
     * Get domain information from the provider.
     */
    public function getDomainInfo(string $domain): DomainInfo;

    /**
     * Renew a domain for the specified number of years.
     */
    public function renew(string $domain, int $years): void;

    /**
     * Initiate a domain transfer request.
     */
    public function transferRequest(string $domain, string $authCode): void;

    /**
     * Update nameservers for a domain.
     */
    public function updateNameservers(string $domain, array $nameservers): void;

    /**
     * Toggle privacy protection for a domain.
     */
    public function togglePrivacy(string $domain, bool $enable): void;

    /**
     * Lock a domain to prevent transfers.
     */
    public function lock(string $domain): void;

    /**
     * Unlock a domain to allow transfers.
     */
    public function unlock(string $domain): void;

    /**
     * Get the provider name.
     */
    public function getProviderName(): string;

    /**
     * Check if the provider is available/configured.
     */
    public function isAvailable(): bool;

    /**
     * Test the connection to the provider.
     */
    public function testConnection(): bool;
}



