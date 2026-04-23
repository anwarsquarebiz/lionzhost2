<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderController extends Controller
{
    /**
     * Display a listing of orders.
     */
    public function index(Request $request)
    {
        $query = Order::with(['customer.user', 'orderItems'])
            ->latest();

        // Filter by status
        if ($request->has('status') && $request->status !== '') {
            $query->where('status', $request->status);
        }

        // Filter by payment status
        if ($request->has('payment_status') && $request->payment_status !== '') {
            $query->where('payment_status', $request->payment_status);
        }

        // Search by order number or customer
        if ($request->has('search') && $request->search !== '') {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', '%' . $search . '%')
                    ->orWhereHas('customer.user', function ($q) use ($search) {
                        $q->where('name', 'like', '%' . $search . '%')
                            ->orWhere('email', 'like', '%' . $search . '%');
                    });
            });
        }

        $orders = $query->paginate(15)->through(function ($order) {
            return [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'status' => $order->status,
                'payment_status' => $order->payment_status,
                'payment_method' => $order->payment_method,
                'total_amount' => $order->total_amount,
                'currency' => $order->currency,
                'customer' => $order->customer ? [
                    'id' => $order->customer->id,
                    'name' => $order->customer->user->name ?? 'N/A',
                    'email' => $order->customer->user->email ?? 'N/A',
                    'company_name' => $order->customer->company_name,
                ] : null,
                'items_count' => $order->orderItems->count(),
                'processed_at' => $order->processed_at?->format('Y-m-d H:i:s'),
                'created_at' => $order->created_at->format('Y-m-d H:i:s'),
            ];
        });

        return Inertia::render('Admin/Orders/Index', [
            'orders' => $orders,
            'filters' => $request->only(['status', 'payment_status', 'search']),
            'statuses' => [
                'pending' => 'Pending',
                'processing' => 'Processing',
                'completed' => 'Completed',
                'cancelled' => 'Cancelled',
                'failed' => 'Failed',
                'refunded' => 'Refunded',
            ],
            'paymentStatuses' => [
                'pending' => 'Pending',
                'paid' => 'Paid',
                'failed' => 'Failed',
                'refunded' => 'Refunded',
                'partially_refunded' => 'Partially Refunded',
            ],
        ]);
    }

    /**
     * Display the specified order.
     */
    public function show(Order $order)
    {
        $order->load([
            'customer.user',
            'orderItems.product',
            'domainOrders.tld',
            'hostingOrders.product'
        ]);

        return Inertia::render('Admin/Orders/Show', [
            'order' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'status' => $order->status,
                'payment_status' => $order->payment_status,
                'payment_method' => $order->payment_method,
                'total_amount' => $order->total_amount,
                'currency' => $order->currency,
                'notes' => $order->notes,
                'customer' => $order->customer ? [
                    'id' => $order->customer->id,
                    'name' => $order->customer->user->name ?? 'N/A',
                    'email' => $order->customer->user->email ?? 'N/A',
                    'company_name' => $order->customer->company_name,
                    'phone' => $order->customer->phone,
                    'address' => $order->customer->address,
                    'city' => $order->customer->city,
                    'state' => $order->customer->state,
                    'postal_code' => $order->customer->postal_code,
                    'country' => $order->customer->country,
                ] : null,
                'items' => $order->orderItems->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'description' => $item->description,
                        'quantity' => $item->quantity,
                        'unit_price' => $item->unit_price,
                        'total_price' => $item->total_price,
                        'product' => $item->product ? [
                            'id' => $item->product->id,
                            'name' => $item->product->name,
                            'product_type' => $item->product->product_type,
                        ] : null,
                    ];
                }),
                'domain_orders' => $order->domainOrders->map(function ($domainOrder) {
                    return [
                        'id' => $domainOrder->id,
                        'domain' => $domainOrder->domain,
                        'tld' => $domainOrder->tld ? $domainOrder->tld->extension : '',
                        'full_domain' => $domainOrder->domain . ($domainOrder->tld ? '.' . $domainOrder->tld->extension : ''),
                        'years' => $domainOrder->years,
                        'status' => $domainOrder->status,
                        'registered_at' => $domainOrder->registered_at?->format('Y-m-d H:i:s'),
                        'expires_at' => $domainOrder->expires_at?->format('Y-m-d H:i:s'),
                    ];
                }),
                'hosting_orders' => $order->hostingOrders->map(function ($hostingOrder) {
                    return [
                        'id' => $hostingOrder->id,
                        'domain' => $hostingOrder->domain,
                        'package_name' => $hostingOrder->package_name,
                        'status' => $hostingOrder->status,
                        'product' => $hostingOrder->product ? [
                            'id' => $hostingOrder->product->id,
                            'name' => $hostingOrder->product->name,
                        ] : null,
                        'activated_at' => $hostingOrder->activated_at?->format('Y-m-d H:i:s'),
                        'expires_at' => $hostingOrder->expires_at?->format('Y-m-d H:i:s'),
                    ];
                }),
                'processed_at' => $order->processed_at?->format('Y-m-d H:i:s'),
                'created_at' => $order->created_at->format('Y-m-d H:i:s'),
                'updated_at' => $order->updated_at->format('Y-m-d H:i:s'),
            ],
        ]);
    }

    /**
     * Update the specified order.
     */
    public function update(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => 'sometimes|in:pending,processing,completed,cancelled,failed,refunded',
            'payment_status' => 'sometimes|in:pending,paid,failed,refunded,partially_refunded',
            'notes' => 'sometimes|nullable|string',
        ]);

        $order->update($validated);

        return redirect()->back()->with('success', 'Order updated successfully.');
    }

    /**
     * Update the order status.
     */
    public function updateStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,processing,completed,cancelled,failed,refunded',
        ]);

        $order->update([
            'status' => $validated['status'],
            'processed_at' => in_array($validated['status'], ['completed', 'cancelled', 'failed', 'refunded']) 
                ? now() 
                : $order->processed_at,
        ]);

        return redirect()->back()->with('success', 'Order status updated successfully.');
    }

    /**
     * Remove the specified order from storage.
     */
    public function destroy(Order $order)
    {
        // Only allow deletion of pending or failed orders
        if (!in_array($order->status, ['pending', 'failed'])) {
            return redirect()->back()->with('error', 'Only pending or failed orders can be deleted.');
        }

        $order->delete();

        return redirect()->route('admin.orders.index')->with('success', 'Order deleted successfully.');
    }
}
