<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tld;
use App\Models\DomainPrice;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TldController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $tlds = Tld::with('domainPrices')
            ->withCount('domainOrders')
            ->latest()
            ->paginate(20);

        return Inertia::render('Admin/Tlds/Index', [
            'tlds' => $tlds,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/Tlds/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'extension' => 'required|string|max:10|unique:tlds,extension',
            'name' => 'required|string|max:255',
            'registry_operator' => 'required|in:centralnic,resellerclub',
            'is_active' => 'boolean',
            'min_years' => 'integer|min:1|max:10',
            'max_years' => 'integer|min:1|max:10',
            'auto_renewal' => 'boolean',
            'privacy_protection' => 'boolean',
            'dns_management' => 'boolean',
            'email_forwarding' => 'boolean',
            'id_protection' => 'boolean',
        ]);

        $tld = Tld::create($validated);

        return redirect()->route('admin.tlds.index')
            ->with('success', 'TLD created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Tld $tld)
    {
        $tld->load(['domainPrices', 'domainOrders']);

        return Inertia::render('Admin/Tlds/Show', [
            'tld' => $tld,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Tld $tld)
    {
        return Inertia::render('Admin/Tlds/Edit', [
            'tld' => $tld,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Tld $tld)
    {
        $validated = $request->validate([
            'extension' => 'required|string|max:10|unique:tlds,extension,' . $tld->id,
            'name' => 'required|string|max:255',
            'registry_operator' => 'required|in:centralnic,resellerclub',
            'is_active' => 'boolean',
            'min_years' => 'integer|min:1|max:10',
            'max_years' => 'integer|min:1|max:10',
            'auto_renewal' => 'boolean',
            'privacy_protection' => 'boolean',
            'dns_management' => 'boolean',
            'email_forwarding' => 'boolean',
            'id_protection' => 'boolean',
        ]);

        $tld->update($validated);

        return redirect()->route('admin.tlds.index')
            ->with('success', 'TLD updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Tld $tld)
    {
        // Check if TLD has domain orders
        if ($tld->domainOrders()->count() > 0) {
            return back()->with('error', 'Cannot delete TLD with existing domain orders.');
        }

        $tld->delete();

        return redirect()->route('admin.tlds.index')
            ->with('success', 'TLD deleted successfully.');
    }

    /**
     * Store a newly created domain price for a TLD.
     */
    public function storePrice(Request $request, Tld $tld)
    {
        $validated = $request->validate([
            'years' => 'required|integer|min:1|max:10',
            'cost' => 'required|numeric|min:0',
            'margin' => 'required|numeric|min:0',
            'sell_price' => 'required|numeric|min:0',
            'is_premium' => 'boolean',
            'is_promotional' => 'boolean',
            'promotional_start' => 'nullable|date',
            'promotional_end' => 'nullable|date|after:promotional_start',
        ]);

        $validated['tld_id'] = $tld->id;
        $domainPrice = DomainPrice::create($validated);

        return redirect()->route('admin.tlds.show', $tld)
            ->with('success', 'Domain price created successfully.');
    }

    /**
     * Update the specified domain price.
     */
    public function updatePrice(Request $request, Tld $tld, DomainPrice $domainPrice)
    {
        // Ensure the domain price belongs to this TLD
        if ($domainPrice->tld_id !== $tld->id) {
            return back()->with('error', 'Domain price does not belong to this TLD.');
        }

        $validated = $request->validate([
            'years' => 'required|integer|min:1|max:10',
            'cost' => 'required|numeric|min:0',
            'margin' => 'required|numeric|min:0',
            'sell_price' => 'required|numeric|min:0',
            'is_premium' => 'boolean',
            'is_promotional' => 'boolean',
            'promotional_start' => 'nullable|date',
            'promotional_end' => 'nullable|date|after:promotional_start',
        ]);

        $domainPrice->update($validated);

        return redirect()->route('admin.tlds.show', $tld)
            ->with('success', 'Domain price updated successfully.');
    }

    /**
     * Remove the specified domain price.
     */
    public function destroyPrice(Tld $tld, DomainPrice $domainPrice)
    {
        // Ensure the domain price belongs to this TLD
        if ($domainPrice->tld_id !== $tld->id) {
            return back()->with('error', 'Domain price does not belong to this TLD.');
        }

        $domainPrice->delete();

        return redirect()->route('admin.tlds.show', $tld)
            ->with('success', 'Domain price deleted successfully.');
    }
}
