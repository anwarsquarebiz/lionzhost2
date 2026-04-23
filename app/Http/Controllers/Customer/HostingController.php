<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\HostingOrder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class HostingController extends Controller
{
	/**
	 * List hosting services for the authenticated customer.
	 */
	public function index(Request $request): Response
	{
		$user = $request->user();
		$customer = $user?->customer;

		$hostingQuery = HostingOrder::with(['product'])->orderByDesc('created_at');

		// If the authenticated user doesn't have a customer record, return an empty result set safely.
		if ($customer) {
			$hostingQuery->where('customer_id', $customer->id);
		} else {
			$hostingQuery->whereRaw('0 = 1');
		}

		$hosting = $hostingQuery
			->paginate(15)
			->through(function (HostingOrder $h) {
				return [
					'id' => $h->id,
					'domain' => $h->domain,
					'product' => $h->product?->name,
					'status' => $h->status,
					'expires_at' => $h->expires_at,
					'auto_renewal' => $h->auto_renewal,
					'provider' => $h->provider,
				];
			});

		return Inertia::render('Customer/MyHosting', [
			'hosting' => $hosting,
		]);
	}

	/**
	 * Show a single hosting service.
	 */
	public function show(Request $request, HostingOrder $hostingOrder): Response
	{
		// Customer can view only their own
		if (!$request->user()->isAdminOrStaff()) {
			abort_unless($hostingOrder->customer_id === $request->user()->customer?->id, 403);
		}

		return Inertia::render('Customer/HostingDetails', [
			'service' => [
				'id' => $hostingOrder->id,
				'domain' => $hostingOrder->domain,
				'product' => $hostingOrder->product?->name,
				'status' => $hostingOrder->status,
				'expires_at' => $hostingOrder->expires_at,
				'auto_renewal' => $hostingOrder->auto_renewal,
				'provider' => $hostingOrder->provider,
				'provider_order_id' => $hostingOrder->provider_order_id,
				'features' => $hostingOrder->features,
			],
		]);
	}

	/**
	 * Toggle auto renewal.
	 */
	public function toggleAutoRenewal(Request $request, HostingOrder $hostingOrder)
	{
		// Customer can toggle only their own
		if (!$request->user()->isAdminOrStaff()) {
			abort_unless($hostingOrder->customer_id === $request->user()->customer?->id, 403);
		}

		$data = $request->validate([
			'enable' => ['required', 'boolean'],
		]);

		$hostingOrder->update(['auto_renewal' => $data['enable']]);

		return response()->json([
			'message' => 'Auto renewal updated',
			'auto_renewal' => $hostingOrder->auto_renewal,
		]);
	}
}



