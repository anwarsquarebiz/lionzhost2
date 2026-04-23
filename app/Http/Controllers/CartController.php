<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class CartController extends Controller
{
    /**
     * Display the cart page.
     */
    public function index(Request $request): Response
    {
        $cart = $this->getOrCreateCart($request);
        $cart->load(['items.tld', 'items.product']);

        return Inertia::render('Cart', [
            'cart' => [
                'id' => $cart->id,
                'subtotal' => $cart->subtotal,
                'tax' => $cart->tax,
                'total' => $cart->total,
                'currency' => $cart->currency,
                'discount' => $cart->discount,
                'coupon_code' => $cart->coupon_code,
                'items' => $cart->items->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'type' => $item->type,
                        'domain' => $item->domain,
                        'full_domain' => $item->domain && $item->tld 
                            ? $item->domain . '.' . $item->tld->extension 
                            : null,
                        'tld' => $item->tld ? [
                            'id' => $item->tld->id,
                            'extension' => $item->tld->extension,
                            'name' => $item->tld->name,
                        ] : null,
                        'product' => $item->product ? [
                            'id' => $item->product->id,
                            'name' => $item->product->name,
                            'type' => $item->product->product_type,
                        ] : null,
                        'years' => $item->years,
                        'quantity' => $item->quantity,
                        'unit_price' => $item->unit_price,
                        'total_price' => $item->total_price,
                        'options' => $item->options,
                    ];
                }),
            ],
        ]);
    }

    /**
     * Display the checkout page.
     */
    public function checkout(Request $request): Response | RedirectResponse
    {
        $cart = $this->getOrCreateCart($request);
        $cart->load(['items.tld', 'items.product']);

        if ($cart->isEmpty()) {
            return redirect()->route('cart.index')
                ->with('error', 'Your cart is empty');
        }

        return Inertia::render('Checkout', [
            'cart' => [
                'id' => $cart->id,
                'subtotal' => $cart->subtotal,
                'tax' => $cart->tax,
                'total' => $cart->total,
                'currency' => $cart->currency,
                'discount' => $cart->discount,
                'coupon_code' => $cart->coupon_code,
                'items' => $cart->items->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'type' => $item->type,
                        'domain' => $item->domain,
                        'full_domain' => $item->domain && $item->tld 
                            ? $item->domain . '.' . $item->tld->extension 
                            : null,
                        'tld' => $item->tld ? [
                            'id' => $item->tld->id,
                            'extension' => $item->tld->extension,
                            'name' => $item->tld->name,
                        ] : null,
                        'product' => $item->product ? [
                            'id' => $item->product->id,
                            'name' => $item->product->name,
                            'type' => $item->product->product_type,
                        ] : null,
                        'years' => $item->years,
                        'quantity' => $item->quantity,
                        'unit_price' => $item->unit_price,
                        'total_price' => $item->total_price,
                        'options' => $item->options,
                    ];
                }),
            ],
        ]);
    }

    /**
     * Remove item from cart.
     */
    public function removeItem(Request $request, int $itemId)
    {
        $cart = $this->getOrCreateCart($request);
        $cart->removeItem($itemId);

        return redirect()->back()->with('success', 'Item removed from cart');
    }

    /**
     * Clear entire cart.
     */
    public function clear(Request $request)
    {
        $cart = $this->getOrCreateCart($request);
        $cart->clear();

        return redirect()->route('cart.index')->with('success', 'Cart cleared');
    }

    /**
     * Apply coupon code.
     */
    public function applyCoupon(Request $request)
    {
        $request->validate([
            'coupon_code' => 'required|string',
        ]);

        $cart = $this->getOrCreateCart($request);

        // TODO: Implement coupon validation and discount calculation
        // For now, just save the coupon code
        $cart->update([
            'coupon_code' => $request->coupon_code,
            'discount' => 0, // Calculate based on coupon
        ]);

        return redirect()->back()->with('success', 'Coupon applied');
    }

    /**
     * Get cart count (API endpoint).
     */
    public function getCount(Request $request)
    {
        $cart = $this->getOrCreateCart($request);
        
        return response()->json([
            'count' => $cart->items()->count(),
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

