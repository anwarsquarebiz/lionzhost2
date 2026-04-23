<?php

namespace App\Jobs;

use App\Domain\Registrars\ProviderRouter;
use App\Domain\Registrars\Results\ProviderContactBundle;
use App\Models\Contact;
use App\Models\ContactId;
use App\Models\DomainOrder;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class ProvisionDomainOrderJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;
    public int $backoff = 120;
    public string $uniqueId;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public int $domainOrderId
    ) {
        // Generate unique ID for idempotency
        $this->uniqueId = 'provision-domain-' . $this->domainOrderId;
    }

    /**
     * Get the unique ID for the job.
     */
    public function uniqueId(): string
    {
        return $this->uniqueId;
    }

    /**
     * Execute the job.
     */
    public function handle(ProviderRouter $providerRouter): void
    {
        Log::info('Provisioning domain order started', ['domain_order_id' => $this->domainOrderId]);

        try {
            $domainOrder = DomainOrder::with(['tld', 'orderable'])->findOrFail($this->domainOrderId);

            // Check if already provisioned
            if (in_array($domainOrder->status, ['registered', 'active'])) {
                Log::info('Domain order already provisioned', ['domain_order_id' => $this->domainOrderId]);
                return;
            }

            // Get provider for this TLD
            $provider = $providerRouter->getProviderForTld($domainOrder->tld);
            $providerName = $provider->getProviderName();

            // Update status to processing
            $domainOrder->update(['status' => 'processing']);

            // Get or create contacts for this provider
            $contacts = $this->resolveContacts($domainOrder, $providerName);

            // Register domain
            $result = $provider->registerDomain($domainOrder, $contacts);

            // Update domain order with provider info
            $domainOrder->update([
                'provider' => $providerName,
                'status' => 'registered',
                'registered_at' => now(),
                'expires_at' => $result->expiresAt,
                'auth_code' => $result->authCode,
            ]);

            Log::info('Domain provisioned successfully', [
                'domain_order_id' => $this->domainOrderId,
                'domain' => $domainOrder->getFullDomainAttribute(),
                'provider' => $providerName
            ]);
        } catch (\Exception $e) {
            Log::error('Domain provisioning failed', [
                'domain_order_id' => $this->domainOrderId,
                'error' => $e->getMessage()
            ]);

            // Update domain order status
            DomainOrder::where('id', $this->domainOrderId)
                ->update(['status' => 'failed']);

            throw $e;
        }
    }

    /**
     * Resolve contacts for the provider (Step 5.4).
     */
    private function resolveContacts(DomainOrder $domainOrder, string $provider): ProviderContactBundle
    {
        // Get customer contacts
        $order = $domainOrder->orderable;
        $customer = $order?->customer ?? $domainOrder->orderable->customer;

        // Get or create registrant contact
        $registrantContact = $customer->contacts()
            ->where('type', 'registrant')
            ->where('is_default', true)
            ->first();

        if (!$registrantContact) {
            // Create default contact from customer data
            $registrantContact = $this->createDefaultContact($customer, 'registrant');
        }

        // Get or sync contact with provider
        $registrantRef = $this->getOrCreateProviderContact($registrantContact, $provider);

        // Get admin contact (reuse registrant if not specified)
        $adminContact = $customer->contacts()
            ->where('type', 'admin')
            ->where('is_default', true)
            ->first() ?? $registrantContact;
        $adminRef = $this->getOrCreateProviderContact($adminContact, $provider);

        // Get tech contact (reuse registrant if not specified)
        $techContact = $customer->contacts()
            ->where('type', 'tech')
            ->where('is_default', true)
            ->first() ?? $registrantContact;
        $techRef = $this->getOrCreateProviderContact($techContact, $provider);

        // Get billing contact (reuse registrant if not specified)
        $billingContact = $customer->contacts()
            ->where('type', 'billing')
            ->where('is_default', true)
            ->first() ?? $registrantContact;
        $billingRef = $this->getOrCreateProviderContact($billingContact, $provider);

        return new ProviderContactBundle(
            registrant: $registrantRef,
            admin: $adminRef,
            tech: $techRef,
            billing: $billingRef
        );
    }

    /**
     * Get or create provider-specific contact ID (reuse if exists).
     */
    private function getOrCreateProviderContact(Contact $contact, string $provider)
    {
        // Check if we already have a ContactId for this provider
        $contactId = $contact->contactIds()
            ->where('provider', $provider)
            ->first();

        if ($contactId) {
            Log::info('Reusing existing provider contact', [
                'contact_id' => $contact->id,
                'provider' => $provider,
                'provider_contact_id' => $contactId->provider_contact_id
            ]);

            return new \App\Domain\Registrars\Results\ProviderContactRef(
                provider: $provider,
                contactId: $contactId->provider_contact_id,
                type: $contact->type
            );
        }

        // Create new contact with provider
        $providerRouter = app(ProviderRouter::class);
        $providerInstance = $providerRouter->getProvider($provider);
        $providerContactRef = $providerInstance->createOrSyncContact($contact);

        // Store provider contact ID for reuse
        ContactId::create([
            'contact_id' => $contact->id,
            'provider' => $provider,
            'provider_contact_id' => $providerContactRef->contactId,
        ]);

        Log::info('Created new provider contact', [
            'contact_id' => $contact->id,
            'provider' => $provider,
            'provider_contact_id' => $providerContactRef->contactId
        ]);

        return $providerContactRef;
    }

    /**
     * Create default contact from customer data.
     */
    private function createDefaultContact($customer, string $type): Contact
    {
        return Contact::create([
            'customer_id' => $customer->id,
            'type' => $type,
            'first_name' => explode(' ', $customer->user->name)[0] ?? 'User',
            'last_name' => explode(' ', $customer->user->name, 2)[1] ?? 'Name',
            'email' => $customer->user->email,
            'phone' => $customer->phone ?? '+1.0000000000',
            'organization' => $customer->company_name,
            'address_line_1' => $customer->address ?? 'Address',
            'city' => $customer->city ?? 'City',
            'state' => $customer->state ?? 'State',
            'postal_code' => $customer->postal_code ?? '00000',
            'country' => $customer->country ?? 'US',
            'is_default' => true,
        ]);
    }

    /**
     * Calculate the number of seconds to wait before retrying the job.
     */
    public function backoff(): array
    {
        return [120, 300, 900]; // 2 min, 5 min, 15 min
    }
}