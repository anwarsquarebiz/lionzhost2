<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\Cart;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Features;

class AuthenticatedSessionController extends Controller
{
    /**
     * Show the login page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $user = $request->validateCredentials();

        if (Features::enabled(Features::twoFactorAuthentication()) && $user->hasEnabledTwoFactorAuthentication()) {
            $request->session()->put([
                'login.id' => $user->getKey(),
                'login.remember' => $request->boolean('remember'),
            ]);

            return to_route('two-factor.login');
        }

        // Get the old session ID before regeneration to migrate cart
        $oldSessionId = $request->session()->getId();

        Auth::login($user, $request->boolean('remember'));

        // Migrate cart from old session to user before session regeneration
        $this->migrateCart($oldSessionId, $request->user()->id);

        $request->session()->regenerate();

        if ($request->user()->isAdmin()) {
            return redirect()->intended(route('admin.tlds.index', absolute: false));
        } else {
            return redirect()->intended(route('domains.search', absolute: false));
        }
    }

    /**
     * Migrate session cart to user cart after login.
     */
    private function migrateCart(string $oldSessionId, int $userId): void
    {
        // Find cart with old session ID
        $sessionCart = Cart::where('session_id', $oldSessionId)
            ->whereNull('user_id')
            ->first();

        if (!$sessionCart) {
            return; // No session cart to migrate
        }

        // Check if user already has a cart
        $userCart = Cart::where('user_id', $userId)->first();

        if (!$userCart) {
            // Simply assign the session cart to the user
            $sessionCart->update([
                'user_id' => $userId,
                'session_id' => null,
            ]);
        } else {
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
        }
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
