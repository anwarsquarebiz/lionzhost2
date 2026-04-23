<?php

namespace App\Http\Controllers;

use App\Domain\Registrars\ProviderRouter;
use App\Models\DomainPrice;
use App\Models\Tld;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class PublicDomainController extends Controller
{
    public function __construct(
        private ProviderRouter $providerRouter
    ) {}

    /**
     * Show public domain search page (home).
     */
    public function index()
    {
        $popularTlds = Tld::where('is_active', true)
            ->with(['domainPrices' => function ($query) {
                $query->where('years', 1);
            }])
            ->orderByRaw("FIELD(extension, 'com', 'net', 'org', 'in', 'co', 'biz', 'info') DESC")
            ->orderBy('extension')
            ->limit(8)
            ->get()
            ->map(function ($tld) {
                $pricing = $tld->domainPrices->first();
                return [
                    'id' => $tld->id,
                    'extension' => $tld->extension,
                    'name' => $tld->name,
                    'price' => $pricing?->sell_price ?? 0,
                    'is_promotional' => $pricing?->is_promotional ?? false,
                ];
            });

        return Inertia::render('PublicDomainSearch', [
            'popularTlds' => $popularTlds,
        ]);
    }

    /**
     * Show domain search results page.
     */
    public function results(Request $request)
    {
        // Make domain parameter optional for direct access
        $request->validate([
            'domain' => 'nullable|string|min:1|max:63',
        ]);

        // If no domain is provided, show empty search page
        if (!$request->has('domain') || !$request->domain) {
            $popularTlds = Tld::where('is_active', true)
                ->with(['domainPrices' => function ($query) {
                    $query->where('years', 1);
                }])
                ->orderByRaw("FIELD(extension, 'com', 'net', 'org', 'in', 'co', 'biz', 'info') DESC")
                ->orderBy('extension')
                ->limit(8)
                ->get()
                ->map(function ($tld) {
                    $pricing = $tld->domainPrices->first();
                    return [
                        'id' => $tld->id,
                        'extension' => $tld->extension,
                        'name' => $tld->name,
                        'price' => $pricing?->sell_price ?? 0,
                        'is_promotional' => $pricing?->is_promotional ?? false,
                    ];
                });

            return Inertia::render('DomainSearchResults', [
                'searchTerm' => '',
                'results' => [],
                'popularTlds' => $popularTlds,
                'allTlds' => Tld::where('is_active', true)
                    ->orderBy('extension')
                    ->get()
                    ->map(fn($tld) => [
                        'id' => $tld->id,
                        'extension' => $tld->extension,
                        'name' => $tld->name,
                    ]),
            ]);
        }

        $input = strtolower(trim($request->domain));
        Log::info('Domain search results requested for input: ' . $input);

        // Parse the input to determine if it includes a TLD
        $domainParts = explode('.', $input);
        $isExactDomain = count($domainParts) > 1;
        
        if ($isExactDomain) {
            // User entered domain.tld (e.g., "lionzhost.com")
            $domainName = $domainParts[0];
            $inputTld = $domainParts[1];
            $exactDomain = $input;
        } else {
            // User entered just domain name (e.g., "lionzhost")
            $domainName = $input;
            $inputTld = null;
            $exactDomain = null;
        }

        // Get all active TLDs
        $allTlds = Tld::where('is_active', true)
            ->with(['domainPrices' => function ($query) {
                $query->where('years', 1);
            }])
            ->orderBy('extension')
            ->get();

        $results = [];
        $exactMatchResult = null;

        foreach ($allTlds as $tld) {
            try {
                $provider = $this->providerRouter->getProviderForTld($tld);                
                $fullDomain = $domainName . '.' . $tld->extension;
                $availability = $provider->checkAvailability($fullDomain);

                // Get pricing (realtime from provider or database)
                $price = $availability->price;
                $currency = $availability->currency ?? 'USD';

                if ($price === null) {
                    $pricing = $tld->domainPrices->first();
                    $price = $pricing?->sell_price ?? 0;
                }

                $result = [
                    'domain' => $domainName,
                    'tld' => $tld->extension,
                    'tld_id' => $tld->id,
                    'full_domain' => $fullDomain,
                    'available' => $availability->isAvailable(),
                    'price' => $price,
                    'currency' => $currency,
                    'tld_name' => $tld->name,
                    'is_exact_match' => $isExactDomain && $tld->extension === $inputTld,
                ];

                // If this is the exact match, store it separately
                if ($result['is_exact_match']) {
                    $exactMatchResult = $result;
                } else {
                    $results[] = $result;
                }
            } catch (\Exception $e) {
                // Skip errors silently in public view
                continue;
            }
        }

        // Sort: available first, then by price
        usort($results, function ($a, $b) {
            if ($a['available'] !== $b['available']) {
                return $b['available'] - $a['available'];
            }
            return $a['price'] <=> $b['price'];
        });

        // Combine results: exact match first, then other results
        $finalResults = [];
        if ($exactMatchResult) {
            $finalResults[] = $exactMatchResult;
        }
        $finalResults = array_merge($finalResults, $results);

        // Get popular TLDs for display when no results or for suggestions
        $popularTlds = Tld::where('is_active', true)
            ->with(['domainPrices' => function ($query) {
                $query->where('years', 1);
            }])
            ->orderByRaw("FIELD(extension, 'com', 'net', 'org', 'in', 'co', 'biz', 'info') DESC")
            ->orderBy('extension')
            ->limit(8)
            ->get()
            ->map(function ($tld) {
                $pricing = $tld->domainPrices->first();
                return [
                    'id' => $tld->id,
                    'extension' => $tld->extension,
                    'name' => $tld->name,
                    'price' => $pricing?->sell_price ?? 0,
                    'is_promotional' => $pricing?->is_promotional ?? false,
                ];
            });

        return Inertia::render('DomainSearchResults', [
            'searchTerm' => $input,
            'results' => $finalResults,
            'popularTlds' => $popularTlds,
            'allTlds' => $allTlds->map(fn($tld) => [
                'id' => $tld->id,
                'extension' => $tld->extension,
                'name' => $tld->name,
            ]),
        ]);
    }
}