<?php

namespace App\Http\Controllers;

use App\Domain\Registrars\ProviderRouter;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\DomainPrice;
use App\Models\Tld;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function __construct(
        private ProviderRouter $providerRouter
    ) {}

    public function index()
    {
        $popularTlds = Tld::where('is_active', true)
            ->with(['domainPrices' => function ($query) {
                $query->where('years', 1);
            }])
            ->orderByRaw("FIELD(extension, 'com', 'net', 'org', 'in', 'co', 'biz') DESC")
            ->limit(8)
            ->get()
            ->map(function ($tld) {
                $pricing = $tld->domainPrices->first();
                return [
                    'id' => $tld->id,
                    'extension' => $tld->extension,
                    'name' => $tld->name,
                    'price' => $pricing?->sell_price ?? 0,
                ];
            });

        return Inertia::render('landing', [
            'popularTlds' => $popularTlds,
        ]);
    }
}
