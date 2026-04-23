<?php

namespace App\Http\Controllers;

use App\Domain\Registrars\ProviderRouter;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\DomainPrice;
use App\Models\Tld;
use App\Models\Product;
use App\Models\Plan;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class DomainSearchController extends Controller
{
    public function __construct(
        private ProviderRouter $providerRouter
    ) {}

    /**
     * Show domain search page.
     */
    public function index()
    {
        $popularTlds = Tld::where('is_active', true)
            ->with('domainPrices')
            ->orderBy('extension')
            ->get();

        return Inertia::render('DomainSearch', [
            'popularTlds' => $popularTlds,
        ]);
    }

    /**
     * Search for domain availability.
     */
    public function search(Request $request)
    {
        $request->validate([
            'domain' => 'required|string|min:1|max:63',
            'tlds' => 'array',
            'tlds.*' => 'string',
        ]);

        Log::info('Domain search requested for domain: ' . $request->domain . ' with TLDs: ' . implode(', ', $request->tlds));

        $domain = strtolower(trim($request->domain));
        
        // Use provided TLDs or get all active TLDs from database
        if ($request->has('tlds') && !empty($request->tlds)) {
            $tlds = $request->tlds;
        } else {
            // Get all active TLDs if none specified
            $tlds = Tld::where('is_active', true)
                ->pluck('extension')
                ->toArray();
        }

        $results = [];

        foreach ($tlds as $tldExtension) {
            $tld = Tld::where('extension', $tldExtension)->first();
            
            if (!$tld) {
                continue;
            }

            try {
                $provider = $this->providerRouter->getProviderForTld($tld);
                $fullDomain = $domain . '.' . $tldExtension;
                $availability = $provider->checkAvailability($fullDomain);

                // Get pricing from provider response (realtime) or database (fallback)
                $price = $availability->price; // Realtime price from provider
                $currency = $availability->currency ?? 'USD';

                // Fallback to database pricing if provider doesn't return price
                if ($price === null) {
                    $pricing = DomainPrice::where('tld_id', $tld->id)
                        ->where('years', 1)
                        ->first();
                    $price = $pricing?->sell_price ?? 0;
                }

                $results[] = [
                    'domain' => $domain,
                    'tld' => $tldExtension,
                    'tld_id' => $tld->id,
                    'full_domain' => $fullDomain,
                    'available' => $availability->isAvailable(),
                    'price' => $price,
                    'currency' => $currency,
                    'realtime_price' => $availability->price !== null, // Indicates if price is from provider
                    'tld_data' => $tld,
                ];
            } catch (\Exception $e) {
                $results[] = [
                    'domain' => $domain,
                    'tld' => $tldExtension,
                    'full_domain' => $domain . '.' . $tldExtension,
                    'available' => false,
                    'error' => $e->getMessage(),
                ];
            }
        }

        return response()->json([
            'results' => $results,
        ]);
    }

    /**
     * Add domain or hosting product to cart.
     */
    public function addToCart(Request $request)
    {
        // Check if this is a hosting product or domain
        if ($request->has('product_id') && $request->has('plan_id')) {
            // Handle hosting product
            return $this->addHostingToCart($request);
        }

        // Handle domain (existing logic)
        $request->validate([
            'domain' => 'required|string',
            'tld_id' => 'required|exists:tlds,id',
            'years' => 'required|integer|min:1|max:10',
            'options' => 'array',
            'options.privacy' => 'boolean',
            'options.dns_management' => 'boolean',
            'options.email_forwarding' => 'boolean',
            'options.dnssec' => 'boolean',
        ]);

        $tld = Tld::findOrFail($request->tld_id);
        $pricing = DomainPrice::where('tld_id', $tld->id)
            ->where('years', $request->years)
            ->firstOrFail();

        // Check if domain already has an active order
        $existingDomainOrder = \App\Models\DomainOrder::where('domain', $request->domain)
            ->where('tld_id', $tld->id)
            ->whereIn('status', ['processing', 'registered'])
            ->first();

        if ($existingDomainOrder) {
            return response()->json([
                'success' => false,
                'message' => "The domain {$request->domain}.{$tld->extension} is already registered or has a pending order.",
                'error' => 'domain_already_ordered',
            ], 422);
        }

        // Get or create cart
        $cart = $this->getOrCreateCart($request);

        // Check if domain already in cart
        $domainInCart = $cart->items()
            ->where('type', 'domain')
            ->where('domain', $request->domain)
            ->where('tld_id', $tld->id)
            ->exists();

        if ($domainInCart) {
            return response()->json([
                'success' => false,
                'message' => "This domain is already in your cart.",
                'error' => 'domain_in_cart',
            ], 422);
        }

        // Add item to cart
        $cartItem = $cart->addItem([
            'type' => 'domain',
            'domain' => $request->domain,
            'tld_id' => $tld->id,
            'years' => $request->years,
            'quantity' => 1,
            'unit_price' => $pricing->sell_price,
            'total_price' => $pricing->sell_price * $request->years,
            'options' => $request->options ?? [],
        ]);

        return response()->json([
            'success' => true,
            'cart' => $cart->load('items.tld'),
            'item' => $cartItem,
        ]);
    }

    /**
     * Add hosting product to cart.
     */
    private function addHostingToCart(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'plan_id' => 'required|exists:plans,id',
            'domain' => 'required|string|max:255',
        ]);

        $product = Product::findOrFail($request->product_id);
        $plan = Plan::findOrFail($request->plan_id);

        // Verify plan belongs to product
        if ($plan->product_id !== $product->id) {
            return response()->json([
                'success' => false,
                'message' => 'The selected plan does not belong to this product.',
                'error' => 'invalid_plan',
            ], 422);
        }

        // Verify plan is active
        if (!$plan->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'The selected plan is not available.',
                'error' => 'plan_inactive',
            ], 422);
        }

        // Get or create cart
        $cart = $this->getOrCreateCart($request);

        // Check if hosting for this domain and product is already in cart
        $hostingInCart = $cart->items()
            ->where('type', $product->product_type)
            ->where('domain', $request->domain)
            ->where('product_id', $product->id)
            ->exists();

        if ($hostingInCart) {
            return response()->json([
                'success' => false,
                'message' => "Hosting for {$request->domain} is already in your cart.",
                'error' => 'hosting_in_cart',
            ], 422);
        }

        // Calculate total price (price_per_month * package_months + setup_fee)
        $totalPrice = ($plan->price_per_month * $plan->package_months) + $plan->setup_fee;

        // Add item to cart
        // For hosting, we use package_months as "years" for consistency with cart structure
        $cartItem = $cart->addItem([
            'type' => $product->product_type, // 'shared-hosting', 'vps', etc.
            'domain' => $request->domain,
            'product_id' => $product->id,
            'years' => $plan->package_months, // Store billing period in months
            'quantity' => 1,
            'unit_price' => $plan->price_per_month,
            'total_price' => $totalPrice,
            'options' => [
                'plan_id' => $plan->id,
                'billing_cycle' => $plan->package_months,
                'setup_fee' => $plan->setup_fee,
            ],
            'metadata' => [
                'resellerclub_plan_id' => $plan->resellerclub_plan_id,
                'plan_type' => $plan->plan_type,
            ],
        ]);

        return response()->json([
            'success' => true,
            'cart' => $cart->load('items.product'),
            'item' => $cartItem,
        ]);
    }

    /**
     * Get cart contents.
     */
    public function getCart(Request $request)
    {
        $cart = $this->getOrCreateCart($request);

        return response()->json([
            'cart' => $cart->load('items.tld', 'items.product'),
        ]);
    }

    /**
     * Remove item from cart.
     */
    public function removeFromCart(Request $request, int $itemId)
    {
        $cart = $this->getOrCreateCart($request);
        $cart->removeItem($itemId);

        return response()->json([
            'success' => true,
            'cart' => $cart->load('items.tld', 'items.product'),
        ]);
    }

    /**
     * Clear cart.
     */
    public function clearCart(Request $request)
    {
        $cart = $this->getOrCreateCart($request);
        $cart->clear();

        return response()->json([
            'success' => true,
            'cart' => $cart,
        ]);
    }

    /**
     * Get or create cart for user/session.
     * Merges session cart with user cart after login.
     */
    private function getOrCreateCart(Request $request): Cart
    {
        if ($request->user()) {
            // Check if user already has a cart
            $userCart = Cart::where('user_id', $request->user()->id)->first();
            
            // Check if there's a session cart from before login
            $sessionId = $request->session()->getId();
            $sessionCart = Cart::where('session_id', $sessionId)
                ->whereNull('user_id')
                ->first();
            
            if ($sessionCart && !$userCart) {
                // Migrate session cart to user cart
                $sessionCart->update([
                    'user_id' => $request->user()->id,
                    'session_id' => null,
                ]);
                return $sessionCart;
            }
            
            if ($sessionCart && $userCart) {
                // Merge session cart items into user cart
                foreach ($sessionCart->items as $item) {
                    $userCart->items()->create([
                        'type' => $item->type,
                        'domain' => $item->domain,
                        'tld_id' => $item->tld_id,
                        'product_id' => $item->product_id,
                        'years' => $item->years,
                        'quantity' => $item->quantity,
                        'unit_price' => $item->unit_price,
                        'total_price' => $item->total_price,
                        'options' => $item->options,
                    ]);
                }
                $userCart->calculateTotals();
                
                // Delete the old session cart
                $sessionCart->items()->delete();
                $sessionCart->delete();
                
                return $userCart;
            }
            
            // Return existing user cart or create new one
            return $userCart ?? Cart::create([
                'user_id' => $request->user()->id,
                'expires_at' => now()->addDays(7),
            ]);
        }

        $sessionId = $request->session()->getId();
        return Cart::firstOrCreate(
            ['session_id' => $sessionId],
            ['expires_at' => now()->addDays(7)]
        );
    }
}
