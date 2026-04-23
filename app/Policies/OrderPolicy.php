<?php

namespace App\Policies;

use App\Models\Order;
use App\Models\User;
use App\Role;
use Illuminate\Auth\Access\Response;

class OrderPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // Admin and staff can view all orders
        return $user->isAdminOrStaff();
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Order $order): bool
    {
        // Admin and staff can view any order
        if ($user->isAdminOrStaff()) {
            return true;
        }

        // Customers can only view their own orders
        if ($user->isCustomer()) {
            return $user->customer && $user->customer->id === $order->customer_id;
        }

        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // All authenticated users can create orders
        return true;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Order $order): bool
    {
        // Admin and staff can update any order
        if ($user->isAdminOrStaff()) {
            return true;
        }

        // Customers can only update their own pending orders
        if ($user->isCustomer()) {
            return $user->customer && 
                   $user->customer->id === $order->customer_id && 
                   $order->status === 'pending';
        }

        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Order $order): bool
    {
        // Only admin can delete orders
        if ($user->isAdmin()) {
            return true;
        }

        // Customers can only delete their own pending orders
        if ($user->isCustomer()) {
            return $user->customer && 
                   $user->customer->id === $order->customer_id && 
                   $order->status === 'pending';
        }

        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Order $order): bool
    {
        // Only admin can restore orders
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Order $order): bool
    {
        // Only admin can permanently delete orders
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can process the order.
     */
    public function process(User $user, Order $order): bool
    {
        // Only admin and staff can process orders
        return $user->isAdminOrStaff();
    }

    /**
     * Determine whether the user can cancel the order.
     */
    public function cancel(User $user, Order $order): bool
    {
        // Admin and staff can cancel any order
        if ($user->isAdminOrStaff()) {
            return true;
        }

        // Customers can only cancel their own pending orders
        if ($user->isCustomer()) {
            return $user->customer && 
                   $user->customer->id === $order->customer_id && 
                   $order->status === 'pending';
        }

        return false;
    }
}
