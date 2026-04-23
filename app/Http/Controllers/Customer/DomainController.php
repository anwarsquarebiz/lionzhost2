<?php

namespace App\Http\Controllers\Customer;

use App\Domain\Registrars\ProviderRouter;
use App\Http\Controllers\Controller;
use App\Models\DomainOrder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class DomainController extends Controller
{
	/**
	 * List domains for the authenticated customer.
	 */
	public function index(Request $request): Response
	{
		$user = $request->user();
		$customer = $user?->customer;

		$domainsQuery = DomainOrder::with(['tld'])->latest();

		// If the authenticated user doesn't have a customer record, return an empty result set safely.
		if ($customer) {
			$domainsQuery->whereHas('orderable', function ($q) use ($customer) {
				$q->whereBelongsTo($customer);
			});
		} else {
			$domainsQuery->whereRaw('0 = 1');
		}

		$domains = $domainsQuery
			->paginate(15)
			->through(fn(DomainOrder $d) => [
				'id' => $d->id,
				'domain' => $d->getFullDomainAttribute(),
				'status' => $d->status,
				'expires_at' => $d->expires_at,
				'auto_renewal' => $d->auto_renewal,
				'privacy_protection' => $d->privacy_protection,
				'nameservers' => $d->nameservers,
			]);

		return Inertia::render('Customer/MyDomains', [
			'domains' => $domains,
		]);
	}

	/**
	 * Show a single domain.
	 */
	public function show(Request $request, DomainOrder $domainOrder): Response
	{
		Gate::authorize('view', $domainOrder);

		return Inertia::render('Customer/DomainDetails', [
			'domain' => [
				'id' => $domainOrder->id,
				'domain' => $domainOrder->getFullDomainAttribute(),
				'status' => $domainOrder->status,
				'expires_at' => $domainOrder->expires_at,
				'auto_renewal' => $domainOrder->auto_renewal,
				'privacy_protection' => $domainOrder->privacy_protection,
				'nameservers' => $domainOrder->nameservers,
			],
		]);
	}

	/**
	 * Update nameservers.
	 */
	public function updateNameservers(Request $request, DomainOrder $domainOrder)
	{

		Gate::authorize('manageDns', $domainOrder);

		$data = $request->validate([
			'nameservers' => ['required', 'array', 'min:2', 'max:6'],
			'nameservers.*' => ['string', 'distinct', 'max:255'],
		]);

		$provider = app(ProviderRouter::class)->getProviderForTld($domainOrder->tld);
		$provider->updateNameservers($domainOrder->getFullDomainAttribute(), $data['nameservers']);

		$domainOrder->update(['nameservers' => $data['nameservers']]);

		return response()->json([
			'message' => 'Nameservers updated',
			'nameservers' => $domainOrder->nameservers,
		]);
	}

	/**
	 * Toggle privacy protection.
	 */
	public function togglePrivacy(Request $request, DomainOrder $domainOrder)
	{
		Gate::authorize('manageDns', $domainOrder);

		$data = $request->validate([
			'enable' => ['required', 'boolean'],
		]);

		$provider = app(ProviderRouter::class)->getProviderForTld($domainOrder->tld);
		$provider->togglePrivacy($domainOrder->getFullDomainAttribute(), $data['enable']);

		$domainOrder->update(['privacy_protection' => $data['enable']]);

		return response()->json([
			'message' => 'Privacy updated',
			'privacy_protection' => $domainOrder->privacy_protection,
		]);
	}

	/**
	 * Lock domain.
	 */
	public function lock(Request $request, DomainOrder $domainOrder)
	{
		Gate::authorize('manageDns', $domainOrder);

		$provider = app(ProviderRouter::class)->getProviderForTld($domainOrder->tld);
		$provider->lock($domainOrder->getFullDomainAttribute());

		return response()->json(['message' => 'Domain locked']);
	}

	/**
	 * Unlock domain.
	 */
	public function unlock(Request $request, DomainOrder $domainOrder)
	{
		Gate::authorize('manageDns', $domainOrder);

		$provider = app(ProviderRouter::class)->getProviderForTld($domainOrder->tld);
		$provider->unlock($domainOrder->getFullDomainAttribute());

		return response()->json(['message' => 'Domain unlocked']);
	}

	/**
	 * Get EPP/Auth code (if available).
	 */
	public function eppCode(Request $request, DomainOrder $domainOrder)
	{
		Gate::authorize('manageDns', $domainOrder);

		$provider = app(ProviderRouter::class)->getProviderForTld($domainOrder->tld);
		$info = $provider->getDomainInfo($domainOrder->getFullDomainAttribute());

		return response()->json([
			'auth_code' => $info->authCode ?? null,
		]);
	}

	/**
	 * Renew domain.
	 */
	public function renew(Request $request, DomainOrder $domainOrder)
	{
		Gate::authorize('renew', $domainOrder);

		$data = $request->validate([
			'years' => ['required', 'integer', 'min:1', 'max:9'],
		]);

		$provider = app(ProviderRouter::class)->getProviderForTld($domainOrder->tld);
		$provider->renew($domainOrder->getFullDomainAttribute(), $data['years']);

		return response()->json([
			'message' => 'Renewal initiated',
			'years' => $data['years'],
		]);
	}
}
