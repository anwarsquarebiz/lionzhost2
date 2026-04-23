<?php

namespace App\Policies;

use App\Models\Customer;
use App\Models\User;
use App\Role;
use Illuminate\Auth\Access\Response;

class CustomerPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // Admin and staff can view all customers
        return $user->isAdminOrStaff();
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Customer $customer): bool
    {
        // Admin and staff can view any customer
        if ($user->isAdminOrStaff()) {
            return true;
        }

        // Customers can only view their own profile
        if ($user->isCustomer()) {
            return $user->customer && $user->customer->id === $customer->id;
        }

        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // All authenticated users can create customer profiles
        return true;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Customer $customer): bool
    {
        // Admin and staff can update any customer
        if ($user->isAdminOrStaff()) {
            return true;
        }

        // Customers can only update their own profile
        if ($user->isCustomer()) {
            return $user->customer && $user->customer->id === $customer->id;
        }

        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Customer $customer): bool
    {
        // Only admin can delete customers
        if ($user->isAdmin()) {
            return true;
        }

        // Customers can only delete their own profile
        if ($user->isCustomer()) {
            return $user->customer && $user->customer->id === $customer->id;
        }

        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Customer $customer): bool
    {
        // Only admin can restore customers
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Customer $customer): bool
    {
        // Only admin can permanently delete customers
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can manage customer contacts.
     */
    public function manageContacts(User $user, Customer $customer): bool
    {
        // Admin and staff can manage contacts for any customer
        if ($user->isAdminOrStaff()) {
            return true;
        }

        // Customers can only manage their own contacts
        if ($user->isCustomer()) {
            return $user->customer && $user->customer->id === $customer->id;
        }

        return false;
    }

    /**
     * Determine whether the user can view customer orders.
     */
    public function viewOrders(User $user, Customer $customer): bool
    {
        // Admin and staff can view orders for any customer
        if ($user->isAdminOrStaff()) {
            return true;
        }

        // Customers can only view their own orders
        if ($user->isCustomer()) {
            return $user->customer && $user->customer->id === $customer->id;
        }

        return false;
    }
}
