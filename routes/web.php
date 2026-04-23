<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\HomeController;

Route::get('/', [HomeController::class, 'index'])->name('home');

// Public domain search results page
Route::get('/domains/results', [App\Http\Controllers\PublicDomainController::class, 'results'])->name('domains.results');

// Public product pages
Route::get('/hosting', [App\Http\Controllers\PublicProductController::class, 'sharedHosting'])->name('hosting');
Route::get('/vps', [App\Http\Controllers\PublicProductController::class, 'vps'])->name('vps');
Route::get('/dedicated', [App\Http\Controllers\PublicProductController::class, 'dedicatedServers'])->name('dedicated');
Route::get('/ssl', [App\Http\Controllers\PublicProductController::class, 'ssl'])->name('ssl');

Route::get('/contact', function () {
    return Inertia::render('PublicContact', [
        'contactEmail' => config('mail.from.address', 'support@lionzhost.com'),
    ]);
})->name('contact');

Route::get('/about', fn () => Inertia::render('PublicAbout'))->name('about');

Route::get('/privacy', function () {
    return Inertia::render('PublicPrivacyPolicy', [
        'contactEmail' => config('mail.from.address', 'support@lionzhost.com'),
    ]);
})->name('privacy');

Route::get('/terms', function () {
    return Inertia::render('PublicTermsOfService', [
        'contactEmail' => config('mail.from.address', 'support@lionzhost.com'),
    ]);
})->name('terms');

Route::get('/welcome', function () {
    return Inertia::render('welcome');
})->name('welcome');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {

        if (Auth::user()->isAdmin() || Auth::user()->isStaff()) {
            return redirect()->route('admin.tlds.index');
        }

        return redirect()->route('domains.search');
        // return Inertia::render('dashboard');
    })->name('dashboard');
});

// Domain search and cart routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard/domains/search', [App\Http\Controllers\DomainSearchController::class, 'index'])->name('domains.search');
});

Route::post('/domains/search', [App\Http\Controllers\DomainSearchController::class, 'search'])->name('domains.search.api');

// Cart routes (public - works for both guests and authenticated users)
Route::post('/cart/add', [App\Http\Controllers\DomainSearchController::class, 'addToCart'])->name('cart.add');
Route::get('/cart', [App\Http\Controllers\CartController::class, 'index'])->name('cart.index');
Route::get('/api/cart/count', [App\Http\Controllers\CartController::class, 'getCount'])->name('cart.count');
Route::delete('/cart/items/{itemId}', [App\Http\Controllers\CartController::class, 'removeItem'])->name('cart.remove');
Route::delete('/cart/clear', [App\Http\Controllers\CartController::class, 'clear'])->name('cart.clear');
Route::post('/cart/coupon', [App\Http\Controllers\CartController::class, 'applyCoupon'])->name('cart.coupon');

// Checkout and payment routes (requires authentication)
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/checkout', [App\Http\Controllers\CartController::class, 'checkout'])->name('checkout');
    Route::post('/payment/initiate', [App\Http\Controllers\PaymentController::class, 'initiatePayment'])->name('payment.initiate');
    Route::get('/payment/success', [App\Http\Controllers\PaymentController::class, 'success'])->name('payment.success');
    Route::get('/payment/afs/callback', [App\Http\Controllers\PaymentController::class, 'afsCallback'])->name('payment.afs.callback');
});

// Payment webhook routes (no auth middleware)
Route::post('/webhooks/razorpay', [App\Http\Controllers\PaymentWebhookController::class, 'razorpay'])->name('webhooks.razorpay');
Route::post('/webhooks/stripe', [App\Http\Controllers\PaymentWebhookController::class, 'stripe'])->name('webhooks.stripe');

// Admin routes (protected by admin-or-staff gate)
Route::middleware(['auth', 'verified'])->prefix('admin')->name('admin.')->group(function () {
    // TLDs management
    Route::resource('tlds', App\Http\Controllers\Admin\TldController::class);
    
    // Domain prices management (nested under TLDs)
    Route::post('tlds/{tld}/prices', [App\Http\Controllers\Admin\TldController::class, 'storePrice'])->name('tlds.prices.store');
    Route::put('tlds/{tld}/prices/{domainPrice}', [App\Http\Controllers\Admin\TldController::class, 'updatePrice'])->name('tlds.prices.update');
    Route::delete('tlds/{tld}/prices/{domainPrice}', [App\Http\Controllers\Admin\TldController::class, 'destroyPrice'])->name('tlds.prices.destroy');
    
    // Domain pricing management
    Route::resource('domain-prices', App\Http\Controllers\Admin\DomainPriceController::class);
    
    // Products management
    Route::resource('products', App\Http\Controllers\Admin\ProductController::class);
    Route::post('products/{product}/plans', [App\Http\Controllers\Admin\ProductController::class, 'storePlan'])->name('products.plans.store');
    Route::put('products/{product}/plans/{plan}', [App\Http\Controllers\Admin\ProductController::class, 'updatePlan'])->name('products.plans.update');
    Route::delete('products/{product}/plans/{plan}', [App\Http\Controllers\Admin\ProductController::class, 'destroyPlan'])->name('products.plans.destroy');
    Route::post('products/{product}/features', [App\Http\Controllers\Admin\ProductController::class, 'storeFeature'])->name('products.features.store');
    Route::put('products/{product}/features/{feature}', [App\Http\Controllers\Admin\ProductController::class, 'updateFeature'])->name('products.features.update');
    Route::delete('products/{product}/features/{feature}', [App\Http\Controllers\Admin\ProductController::class, 'destroyFeature'])->name('products.features.destroy');
    
    // Orders management
    Route::resource('orders', App\Http\Controllers\Admin\OrderController::class)->except(['create', 'store', 'edit']);
    Route::put('orders/{order}/status', [App\Http\Controllers\Admin\OrderController::class, 'updateStatus'])->name('orders.status');
    
    // Domain orders
    Route::get('/domain-orders', [App\Http\Controllers\Admin\DomainOrderController::class, 'index'])->name('domain-orders.index');
    Route::get('/domain-orders/{domainOrder}', [App\Http\Controllers\Admin\DomainOrderController::class, 'show'])->name('domain-orders.show');
    Route::put('/domain-orders/{domainOrder}', [App\Http\Controllers\Admin\DomainOrderController::class, 'update'])->name('domain-orders.update');
    Route::put('/domain-orders/{domainOrder}/status', [App\Http\Controllers\Admin\DomainOrderController::class, 'updateStatus'])->name('domain-orders.status');
    Route::put('/domain-orders/{domainOrder}/auto-renewal', [App\Http\Controllers\Admin\DomainOrderController::class, 'toggleAutoRenewal'])->name('domain-orders.toggle-renewal');
    
    // Hosting orders
    Route::get('/hosting-orders', [App\Http\Controllers\Admin\HostingOrderController::class, 'index'])->name('hosting-orders.index');
    Route::get('/hosting-orders/{hostingOrder}', [App\Http\Controllers\Admin\HostingOrderController::class, 'show'])->name('hosting-orders.show');
    Route::put('/hosting-orders/{hostingOrder}', [App\Http\Controllers\Admin\HostingOrderController::class, 'update'])->name('hosting-orders.update');
    Route::put('/hosting-orders/{hostingOrder}/activate', [App\Http\Controllers\Admin\HostingOrderController::class, 'activate'])->name('hosting-orders.activate');
    Route::put('/hosting-orders/{hostingOrder}/suspend', [App\Http\Controllers\Admin\HostingOrderController::class, 'suspend'])->name('hosting-orders.suspend');
    Route::put('/hosting-orders/{hostingOrder}/cancel', [App\Http\Controllers\Admin\HostingOrderController::class, 'cancel'])->name('hosting-orders.cancel');
    Route::put('/hosting-orders/{hostingOrder}/auto-renewal', [App\Http\Controllers\Admin\HostingOrderController::class, 'toggleAutoRenewal'])->name('hosting-orders.toggle-renewal');
    
    // Registry accounts
    Route::get('/registry-accounts', function () {
        return Inertia::render('Admin/RegistryAccounts');
    })->name('registry-accounts');
    
    // EPP poll inbox
    Route::get('/epp-poll', function () {
        return Inertia::render('Admin/EppPoll');
    })->name('epp-poll');
    
    // Audit logs
    Route::get('/audit-logs', function () {
        return Inertia::render('Admin/AuditLogs');
    })->name('audit-logs');
});

// Customer routes (protected by auth)
Route::middleware(['auth', 'verified'])->prefix('my')->name('my.')->group(function () {
    // My domains
    Route::get('/domains', [App\Http\Controllers\Customer\DomainController::class, 'index'])->name('domains');
    Route::get('/domains/{domainOrder}', [App\Http\Controllers\Customer\DomainController::class, 'show'])->name('domains.show');
    Route::put('/domains/{domainOrder}/nameservers', [App\Http\Controllers\Customer\DomainController::class, 'updateNameservers'])->name('domains.nameservers');
    Route::put('/domains/{domainOrder}/privacy', [App\Http\Controllers\Customer\DomainController::class, 'togglePrivacy'])->name('domains.privacy');
    Route::put('/domains/{domainOrder}/lock', [App\Http\Controllers\Customer\DomainController::class, 'lock'])->name('domains.lock');
    Route::put('/domains/{domainOrder}/unlock', [App\Http\Controllers\Customer\DomainController::class, 'unlock'])->name('domains.unlock');
    Route::get('/domains/{domainOrder}/epp', [App\Http\Controllers\Customer\DomainController::class, 'eppCode'])->name('domains.epp');
    Route::post('/domains/{domainOrder}/renew', [App\Http\Controllers\Customer\DomainController::class, 'renew'])->name('domains.renew');

    // My hosting
    Route::get('/hosting', [App\Http\Controllers\Customer\HostingController::class, 'index'])->name('hosting');
    Route::get('/hosting/{hostingOrder}', [App\Http\Controllers\Customer\HostingController::class, 'show'])->name('hosting.show');
    Route::put('/hosting/{hostingOrder}/auto-renewal', [App\Http\Controllers\Customer\HostingController::class, 'toggleAutoRenewal'])->name('hosting.toggle-renewal');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
