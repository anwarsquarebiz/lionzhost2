<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\HostingOrder;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HostingOrderController extends Controller
{
    /**
     * Display a listing of hosting orders.
     */
    public function index(Request $request)
    {
        $query = HostingOrder::with(['product', 'customer.user', 'orderable'])
            ->latest();

        // Filter by status
        if ($request->has('status') && $request->status !== '') {
            $query->where('status', $request->status);
        }

        // Filter by domain search
        if ($request->has('search') && $request->search !== '') {
            $query->where('domain', 'like', '%' . $request->search . '%');
        }

        // Filter by provider
        if ($request->has('provider') && $request->provider !== '') {
            $query->where('provider', $request->provider);
        }

        // Filter by product
        if ($request->has('product_id') && $request->product_id !== '') {
            $query->where('product_id', $request->product_id);
        }

        $hostingOrders = $query->paginate(15)->through(function ($hostingOrder) {
            return [
                'id' => $hostingOrder->id,
                'domain' => $hostingOrder->domain,
                'package_name' => $hostingOrder->package_name,
                'status' => $hostingOrder->status,
                'provider' => $hostingOrder->provider,
                'billing_cycle' => $hostingOrder->billing_cycle,
                'price' => $hostingOrder->price,
                'currency' => $hostingOrder->currency,
                'auto_renewal' => $hostingOrder->auto_renewal,
                'activated_at' => $hostingOrder->activated_at?->format('Y-m-d H:i:s'),
                'expires_at' => $hostingOrder->expires_at?->format('Y-m-d H:i:s'),
                'is_active' => $hostingOrder->isActive(),
                'is_expired' => $hostingOrder->isExpired(),
                'is_expiring_soon' => $hostingOrder->isExpiringSoon(),
                'is_suspended' => $hostingOrder->isSuspended(),
                'product' => $hostingOrder->product ? [
                    'id' => $hostingOrder->product->id,
                    'name' => $hostingOrder->product->name,
                    'product_type' => $hostingOrder->product->product_type,
                ] : null,
                'customer' => $hostingOrder->customer ? [
                    'id' => $hostingOrder->customer->id,
                    'name' => $hostingOrder->customer->user->name ?? 'N/A',
                    'email' => $hostingOrder->customer->user->email ?? 'N/A',
                ] : null,
                'order_id' => $hostingOrder->orderable_id,
                'created_at' => $hostingOrder->created_at->format('Y-m-d H:i:s'),
            ];
        });

        return Inertia::render('Admin/HostingOrders/Index', [
            'hostingOrders' => $hostingOrders,
            'filters' => $request->only(['status', 'search', 'provider', 'product_id']),
            'statuses' => [
                'pending' => 'Pending',
                'processing' => 'Processing',
                'active' => 'Active',
                'suspended' => 'Suspended',
                'cancelled' => 'Cancelled',
                'expired' => 'Expired',
                'failed' => 'Failed',
            ],
            'providers' => [
                'cpanel' => 'cPanel',
                'plesk' => 'Plesk',
                'directadmin' => 'DirectAdmin',
                'custom' => 'Custom',
            ],
        ]);
    }

    /**
     * Display the specified hosting order.
     */
    public function show(HostingOrder $hostingOrder)
    {
        $hostingOrder->load(['product', 'customer.user', 'orderable']);

        return Inertia::render('Admin/HostingOrders/Show', [
            'hostingOrder' => [
                'id' => $hostingOrder->id,
                'domain' => $hostingOrder->domain,
                'package_name' => $hostingOrder->package_name,
                'status' => $hostingOrder->status,
                'provider' => $hostingOrder->provider,
                'provider_order_id' => $hostingOrder->provider_order_id,
                'billing_cycle' => $hostingOrder->billing_cycle,
                'price' => $hostingOrder->price,
                'currency' => $hostingOrder->currency,
                'features' => $hostingOrder->features,
                'provider_data' => $hostingOrder->provider_data,
                'auto_renewal' => $hostingOrder->auto_renewal,
                'notes' => $hostingOrder->notes,
                'activated_at' => $hostingOrder->activated_at?->format('Y-m-d H:i:s'),
                'expires_at' => $hostingOrder->expires_at?->format('Y-m-d H:i:s'),
                'suspended_at' => $hostingOrder->suspended_at?->format('Y-m-d H:i:s'),
                'cancelled_at' => $hostingOrder->cancelled_at?->format('Y-m-d H:i:s'),
                'is_active' => $hostingOrder->isActive(),
                'is_expired' => $hostingOrder->isExpired(),
                'is_expiring_soon' => $hostingOrder->isExpiringSoon(),
                'is_suspended' => $hostingOrder->isSuspended(),
                'is_cancelled' => $hostingOrder->isCancelled(),
                'product' => $hostingOrder->product ? [
                    'id' => $hostingOrder->product->id,
                    'name' => $hostingOrder->product->name,
                    'product_type' => $hostingOrder->product->product_type,
                    'location' => $hostingOrder->product->location,
                ] : null,
                'customer' => $hostingOrder->customer ? [
                    'id' => $hostingOrder->customer->id,
                    'name' => $hostingOrder->customer->user->name ?? 'N/A',
                    'email' => $hostingOrder->customer->user->email ?? 'N/A',
                    'company_name' => $hostingOrder->customer->company_name,
                    'phone' => $hostingOrder->customer->phone,
                ] : null,
                'order' => $hostingOrder->orderable ? [
                    'id' => $hostingOrder->orderable->id,
                    'order_number' => $hostingOrder->orderable->order_number,
                    'status' => $hostingOrder->orderable->status,
                    'total_amount' => $hostingOrder->orderable->total_amount,
                    'currency' => $hostingOrder->orderable->currency,
                    'payment_status' => $hostingOrder->orderable->payment_status,
                ] : null,
                'created_at' => $hostingOrder->created_at->format('Y-m-d H:i:s'),
                'updated_at' => $hostingOrder->updated_at->format('Y-m-d H:i:s'),
            ],
        ]);
    }

    /**
     * Update the specified hosting order.
     */
    public function update(Request $request, HostingOrder $hostingOrder)
    {
        $validated = $request->validate([
            'status' => 'sometimes|in:pending,processing,active,suspended,cancelled,expired,failed',
            'auto_renewal' => 'sometimes|boolean',
            'notes' => 'sometimes|nullable|string',
            'expires_at' => 'sometimes|nullable|date',
        ]);

        $hostingOrder->update($validated);

        return redirect()->back()->with('success', 'Hosting order updated successfully.');
    }

    /**
     * Activate a hosting order.
     */
    public function activate(HostingOrder $hostingOrder)
    {
        $hostingOrder->activate();

        return redirect()->back()->with('success', 'Hosting order activated successfully.');
    }

    /**
     * Suspend a hosting order.
     */
    public function suspend(HostingOrder $hostingOrder)
    {
        $hostingOrder->suspend();

        return redirect()->back()->with('success', 'Hosting order suspended successfully.');
    }

    /**
     * Cancel a hosting order.
     */
    public function cancel(HostingOrder $hostingOrder)
    {
        $hostingOrder->cancel();

        return redirect()->back()->with('success', 'Hosting order cancelled successfully.');
    }

    /**
     * Toggle auto-renewal for a hosting order.
     */
    public function toggleAutoRenewal(HostingOrder $hostingOrder)
    {
        $hostingOrder->update([
            'auto_renewal' => !$hostingOrder->auto_renewal,
        ]);

        return redirect()->back()->with('success', 'Auto-renewal toggled successfully.');
    }
}




