<?php

namespace App\Domain\Registrars;

use App\Domain\Registrars\Contracts\RegistrarProvider;
use App\Models\RegistryAccount;
use App\Models\Tld;
use Illuminate\Support\Facades\App;

class ProviderRouter
{
    /**
     * Provider mappings for registry operators.
     */
    private array $providerMappings = [];

    public function __construct()
    {
        $this->loadProviderMappings();
    }

    /**
     * Load provider mappings from configuration.
     */
    private function loadProviderMappings(): void
    {
        $config = config('registrars.provider_selection.tld_mappings', []);
        
        // Build reverse mapping from TLD to provider
        foreach ($config as $provider => $tlds) {
            foreach ($tlds as $tld) {
                $this->providerMappings[ltrim($tld, '.')] = $provider;
            }
        }
        
        // Add direct provider mappings
        $this->providerMappings['centralnic'] = 'centralnic';
        $this->providerMappings['resellerclub'] = 'resellerclub';
    }

    /**
     * Get the appropriate provider for a TLD.
     */
    public function getProviderForTld(Tld $tld): RegistrarProvider
    {
        $registryOperator = $tld->registry_operator;
        $providerName = $this->providerMappings[$registryOperator] ?? $registryOperator;

        return $this->getProvider($providerName);
    }

    /**
     * Get the appropriate provider for a domain.
     */
    public function getProviderForDomain(string $domain): RegistrarProvider
    {
        $tld = $this->extractTldFromDomain($domain);
        $tldModel = Tld::where('extension', $tld)->first();

        if (!$tldModel) {
            throw new \InvalidArgumentException("TLD '{$tld}' not found in database");
        }

        return $this->getProviderForTld($tldModel);
    }

    /**
     * Get a specific provider by name.
     */
    public function getProvider(string $providerName): RegistrarProvider
    {
        $providerClass = $this->getProviderClass($providerName);
        
        if (!class_exists($providerClass)) {
            throw new \InvalidArgumentException("Provider '{$providerName}' not found");
        }

        $provider = App::make($providerClass);

        if (!$provider instanceof RegistrarProvider) {
            throw new \InvalidArgumentException("Provider '{$providerName}' does not implement RegistrarProvider interface");
        }

        return $provider;
    }

    /**
     * Get all available providers.
     */
    public function getAvailableProviders(): array
    {
        $providers = [];

        foreach ($this->providerMappings as $operator => $providerName) {
            try {
                $provider = $this->getProvider($providerName);
                if ($provider->isAvailable()) {
                    $providers[$operator] = $provider;
                }
            } catch (\Exception $e) {
                // Provider not available, skip
            }
        }

        return $providers;
    }

    /**
     * Check if a provider is available.
     */
    public function isProviderAvailable(string $providerName): bool
    {
        try {
            $provider = $this->getProvider($providerName);
            return $provider->isAvailable();
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Get the best available provider for a TLD.
     */
    public function getBestProviderForTld(Tld $tld): ?RegistrarProvider
    {
        try {
            return $this->getProviderForTld($tld);
        } catch (\Exception $e) {
            // Try fallback providers from config
            $fallbackProvider = config('registrars.provider_selection.fallback_provider', 'centralnic');
            $fallbackProviders = [$fallbackProvider, 'centralnic', 'resellerclub'];
            
            foreach ($fallbackProviders as $fallbackProvider) {
                try {
                    $provider = $this->getProvider($fallbackProvider);
                    if ($provider->isAvailable()) {
                        return $provider;
                    }
                } catch (\Exception $e) {
                    continue;
                }
            }
        }

        return null;
    }

    /**
     * Override provider for a specific TLD.
     */
    public function overrideProviderForTld(string $tldExtension, string $providerName): void
    {
        $this->providerMappings[$tldExtension] = $providerName;
    }

    /**
     * Get provider mappings.
     */
    public function getProviderMappings(): array
    {
        return $this->providerMappings;
    }

    /**
     * Extract TLD from domain name.
     */
    private function extractTldFromDomain(string $domain): string
    {
        $parts = explode('.', strtolower($domain));
        
        if (count($parts) < 2) {
            throw new \InvalidArgumentException("Invalid domain format: {$domain}");
        }

        return end($parts);
    }

    /**
     * Get the provider class name.
     */
    private function getProviderClass(string $providerName): string
    {
        // Map provider names to their implementation classes
        $providerMap = [
            'centralnic' => 'App\\Domain\\Registrars\\Providers\\CentralnicEppProvider',
            'resellerclub' => 'App\\Domain\\Registrars\\Providers\\ResellerClubHttpProvider',
        ];

        if (isset($providerMap[$providerName])) {
            return $providerMap[$providerName];
        }

        $className = ucfirst($providerName) . 'Provider';
        return "App\\Domain\\Registrars\\Providers\\{$className}";
    }

    /**
     * Get provider account for a specific provider.
     */
    public function getProviderAccount(string $providerName): ?RegistryAccount
    {
        return RegistryAccount::where('provider', $providerName)
            ->where('is_active', true)
            ->first();
    }

    /**
     * Get all active provider accounts.
     */
    public function getActiveProviderAccounts(): array
    {
        return RegistryAccount::where('is_active', true)
            ->get()
            ->keyBy('provider')
            ->toArray();
    }
}
