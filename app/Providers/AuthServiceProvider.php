<?php

namespace App\Providers;

use App\Models\Customer;
use App\Models\DomainOrder;
use App\Models\Order;
use App\Policies\CustomerPolicy;
use App\Policies\DomainOrderPolicy;
use App\Policies\OrderPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Order::class => OrderPolicy::class,
        DomainOrder::class => DomainOrderPolicy::class,
        Customer::class => CustomerPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();

        // Define gates for common authorization checks
        \Gate::define('admin-only', function ($user) {
            return $user->isAdmin();
        });

        \Gate::define('admin-or-staff', function ($user) {
            return $user->isAdminOrStaff();
        });

        \Gate::define('customer-only', function ($user) {
            return $user->isCustomer();
        });

        \Gate::define('manage-orders', function ($user) {
            return $user->isAdminOrStaff();
        });

        \Gate::define('manage-domains', function ($user) {
            return $user->isAdminOrStaff();
        });

        \Gate::define('manage-customers', function ($user) {
            return $user->isAdminOrStaff();
        });
    }
}
