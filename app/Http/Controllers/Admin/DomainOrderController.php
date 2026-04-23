<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DomainOrder;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DomainOrderController extends Controller
{
    /**
     * Display a listing of domain orders.
     */
    public function index(Request $request)
    {
        $query = DomainOrder::with(['tld', 'orderable.customer.user'])
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

        $domainOrders = $query->paginate(15)->through(function ($domainOrder) {
            return [
                'id' => $domainOrder->id,
                'domain' => $domainOrder->domain,
                'tld' => $domainOrder->tld ? [
                    'id' => $domainOrder->tld->id,
                    'extension' => $domainOrder->tld->extension,
                ] : null,
                'full_domain' => $domainOrder->domain . ($domainOrder->tld ? '.' . $domainOrder->tld->extension : ''),
                'years' => $domainOrder->years,
                'status' => $domainOrder->status,
                'provider' => $domainOrder->provider,
                'privacy_protection' => $domainOrder->privacy_protection,
                'auto_renewal' => $domainOrder->auto_renewal,
                'registered_at' => $domainOrder->registered_at?->format('Y-m-d H:i:s'),
                'expires_at' => $domainOrder->expires_at?->format('Y-m-d H:i:s'),
                'is_expired' => $domainOrder->isExpired(),
                'is_expiring_soon' => $domainOrder->isExpiringSoon(),
                'customer' => $domainOrder->orderable && $domainOrder->orderable->customer ? [
                    'id' => $domainOrder->orderable->customer->id,
                    'name' => $domainOrder->orderable->customer->user->name ?? 'N/A',
                    'email' => $domainOrder->orderable->customer->user->email ?? 'N/A',
                ] : null,
                'order_id' => $domainOrder->orderable_id,
                'created_at' => $domainOrder->created_at->format('Y-m-d H:i:s'),
            ];
        });

        return Inertia::render('Admin/DomainOrders/Index', [
            'domainOrders' => $domainOrders,
            'filters' => $request->only(['status', 'search', 'provider']),
            'statuses' => [
                'pending' => 'Pending',
                'processing' => 'Processing',
                'active' => 'Active',
                'expired' => 'Expired',
                'cancelled' => 'Cancelled',
                'failed' => 'Failed',
            ],
            'providers' => [
                'resellerclub' => 'ResellerClub',
                'enom' => 'eNom',
                'godaddy' => 'GoDaddy',
                'namecheap' => 'Namecheap',
            ],
        ]);
    }

    /**
     * Display the specified domain order.
     */
    public function show(DomainOrder $domainOrder)
    {
        $domainOrder->load(['tld', 'orderable.customer.user', 'orderable.orderItems']);

        return Inertia::render('Admin/DomainOrders/Show', [
            'domainOrder' => [
                'id' => $domainOrder->id,
                'domain' => $domainOrder->domain,
                'tld' => $domainOrder->tld ? [
                    'id' => $domainOrder->tld->id,
                    'extension' => $domainOrder->tld->extension,
                ] : null,
                'full_domain' => $domainOrder->domain . ($domainOrder->tld ? '.' . $domainOrder->tld->extension : ''),
                'years' => $domainOrder->years,
                'nameservers' => $domainOrder->nameservers,
                'privacy_protection' => $domainOrder->privacy_protection,
                'auth_code' => $domainOrder->auth_code,
                'provider' => $domainOrder->provider,
                'status' => $domainOrder->status,
                'registered_at' => $domainOrder->registered_at?->format('Y-m-d H:i:s'),
                'expires_at' => $domainOrder->expires_at?->format('Y-m-d H:i:s'),
                'auto_renewal' => $domainOrder->auto_renewal,
                'is_expired' => $domainOrder->isExpired(),
                'is_expiring_soon' => $domainOrder->isExpiringSoon(),
                'customer' => $domainOrder->orderable && $domainOrder->orderable->customer ? [
                    'id' => $domainOrder->orderable->customer->id,
                    'name' => $domainOrder->orderable->customer->user->name ?? 'N/A',
                    'email' => $domainOrder->orderable->customer->user->email ?? 'N/A',
                    'company_name' => $domainOrder->orderable->customer->company_name,
                    'phone' => $domainOrder->orderable->customer->phone,
                ] : null,
                'order' => $domainOrder->orderable ? [
                    'id' => $domainOrder->orderable->id,
                    'order_number' => $domainOrder->orderable->order_number,
                    'status' => $domainOrder->orderable->status,
                    'total_amount' => $domainOrder->orderable->total_amount,
                    'currency' => $domainOrder->orderable->currency,
                    'payment_status' => $domainOrder->orderable->payment_status,
                ] : null,
                'created_at' => $domainOrder->created_at->format('Y-m-d H:i:s'),
                'updated_at' => $domainOrder->updated_at->format('Y-m-d H:i:s'),
            ],
        ]);
    }

    /**
     * Update the specified domain order.
     */
    public function update(Request $request, DomainOrder $domainOrder)
    {
        $validated = $request->validate([
            'status' => 'sometimes|in:pending,processing,active,expired,cancelled,failed',
            'nameservers' => 'sometimes|array',
            'nameservers.*' => 'string',
            'privacy_protection' => 'sometimes|boolean',
            'auto_renewal' => 'sometimes|boolean',
            'auth_code' => 'sometimes|nullable|string',
            'expires_at' => 'sometimes|nullable|date',
        ]);

        $domainOrder->update($validated);

        return redirect()->back()->with('success', 'Domain order updated successfully.');
    }

    /**
     * Update the status of a domain order.
     */
    public function updateStatus(Request $request, DomainOrder $domainOrder)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,processing,active,expired,cancelled,failed',
        ]);

        $domainOrder->update([
            'status' => $validated['status'],
        ]);

        return redirect()->back()->with('success', 'Domain order status updated successfully.');
    }

    /**
     * Toggle auto-renewal for a domain order.
     */
    public function toggleAutoRenewal(DomainOrder $domainOrder)
    {
        $domainOrder->update([
            'auto_renewal' => !$domainOrder->auto_renewal,
        ]);

        return redirect()->back()->with('success', 'Auto-renewal toggled successfully.');
    }
}




