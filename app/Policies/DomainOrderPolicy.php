<?php

namespace App\Policies;

use App\Models\DomainOrder;
use App\Models\User;
use App\Role;
use Illuminate\Auth\Access\Response;

class DomainOrderPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // Admin and staff can view all domain orders
        return $user->isAdminOrStaff();
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, DomainOrder $domainOrder): bool
    {
        // Admin and staff can view any domain order
        if ($user->isAdminOrStaff()) {
            return true;
        }

        // Customers can only view their own domain orders
        if ($user->isCustomer()) {
            return $user->customer && $this->isDomainOrderOwnedByCustomer($user, $domainOrder);
        }

        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // All authenticated users can create domain orders
        return true;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, DomainOrder $domainOrder): bool
    {
        // Admin and staff can update any domain order
        if ($user->isAdminOrStaff()) {
            return true;
        }

        // Customers can only update their own pending domain orders
        if ($user->isCustomer()) {
            return $user->customer && 
                   $this->isDomainOrderOwnedByCustomer($user, $domainOrder) && 
                   $domainOrder->status === 'pending';
        }

        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, DomainOrder $domainOrder): bool
    {
        // Only admin can delete domain orders
        if ($user->isAdmin()) {
            return true;
        }

        // Customers can only delete their own pending domain orders
        if ($user->isCustomer()) {
            return $user->customer && 
                   $this->isDomainOrderOwnedByCustomer($user, $domainOrder) && 
                   $domainOrder->status === 'pending';
        }

        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, DomainOrder $domainOrder): bool
    {
        // Only admin can restore domain orders
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, DomainOrder $domainOrder): bool
    {
        // Only admin can permanently delete domain orders
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can register the domain.
     */
    public function register(User $user, DomainOrder $domainOrder): bool
    {
        // Only admin and staff can register domains
        return $user->isAdminOrStaff();
    }

    /**
     * Determine whether the user can transfer the domain.
     */
    public function transfer(User $user, DomainOrder $domainOrder): bool
    {
        // Only admin and staff can transfer domains
        return $user->isAdminOrStaff();
    }

    /**
     * Determine whether the user can renew the domain.
     */
    public function renew(User $user, DomainOrder $domainOrder): bool
    {
        // Admin and staff can renew any domain
        if ($user->isAdminOrStaff()) {
            return true;
        }

        // Customers can only renew their own domains
        if ($user->isCustomer()) {
            return $user->customer && $this->isDomainOrderOwnedByCustomer($user, $domainOrder);
        }

        return false;
    }

    /**
     * Determine whether the user can manage DNS for the domain.
     */
    public function manageDns(User $user, DomainOrder $domainOrder): bool
    {
        // Admin and staff can manage DNS for any domain
        if ($user->isAdminOrStaff()) {
            return true;
        }

        // Customers can only manage DNS for their own domains
        if ($user->isCustomer()) {
            return $user->customer && $this->isDomainOrderOwnedByCustomer($user, $domainOrder);
        }

        return false;
    }

    /**
     * Check if the domain order is owned by the customer.
     */
    private function isDomainOrderOwnedByCustomer(User $user, DomainOrder $domainOrder): bool
    {
        if (!$user->customer) {
            return false;
        }

        // Check if the domain order belongs to the customer's orders
        return $user->customer->orders()
            ->whereHas('domainOrders', function ($query) use ($domainOrder) {
                $query->where('id', $domainOrder->id);
            })
            ->exists();
    }
}
