<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Plan;
use App\Models\Feature;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    /**
     * Display a listing of products.
     */
    public function index()
    {
        $products = Product::with(['plans', 'features'])
            ->withCount(['plans', 'features'])
            ->latest()
            ->paginate(20);

        return Inertia::render('Admin/Products/Index', [
            'products' => $products,
        ]);
    }

    /**
     * Show the form for creating a new product.
     */
    public function create()
    {
        return Inertia::render('Admin/Products/Create');
    }

    /**
     * Store a newly created product.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'location' => 'nullable|string|max:255',
            'product_type' => 'required|in:shared-hosting,vps,dedicated-hosting,email,ssl',
            'description' => 'nullable|string',
            'currency' => 'required|string|size:3',
            'resellerclub_key' => 'nullable|string|max:255|unique:products,resellerclub_key',
            'is_active' => 'boolean',
            'sort_order' => 'integer|min:0',
        ]);

        $product = Product::create($validated);

        return redirect()->route('admin.products.show', $product)
            ->with('success', 'Product created successfully.');
    }

    /**
     * Display the specified product.
     */
    public function show(Product $product)
    {
        $product->load(['plans' => function ($query) {
            $query->orderBy('plan_type')->orderBy('package_months');
        }, 'features' => function ($query) {
            $query->orderBy('sort_order');
        }]);

        return Inertia::render('Admin/Products/Show', [
            'product' => $product,
        ]);
    }

    /**
     * Show the form for editing the product.
     */
    public function edit(Product $product)
    {
        return Inertia::render('Admin/Products/Edit', [
            'product' => $product,
        ]);
    }

    /**
     * Update the specified product.
     */
    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'location' => 'nullable|string|max:255',
            'product_type' => 'required|in:shared-hosting,vps,dedicated-hosting,email,ssl',
            'description' => 'nullable|string',
            'currency' => 'required|string|size:3',
            'resellerclub_key' => 'nullable|string|max:255|unique:products,resellerclub_key,' . $product->id,
            'is_active' => 'boolean',
            'sort_order' => 'integer|min:0',
        ]);

        $product->update($validated);

        return redirect()->route('admin.products.show', $product)
            ->with('success', 'Product updated successfully.');
    }

    /**
     * Remove the specified product.
     */
    public function destroy(Product $product)
    {
        $product->delete();

        return redirect()->route('admin.products.index')
            ->with('success', 'Product deleted successfully.');
    }

    /**
     * Store a new plan for the product.
     */
    public function storePlan(Request $request, Product $product)
    {
        $validated = $request->validate([
            'resellerclub_plan_id' => 'nullable|integer',
            'plan_type' => 'required|in:add,renew,restore,transfer',
            'package_months' => 'required|integer|min:1',
            'price_per_month' => 'required|numeric|min:0',
            'setup_fee' => 'nullable|numeric|min:0',
            'is_active' => 'boolean',
        ]);

        $validated['product_id'] = $product->id;
        Plan::create($validated);

        return redirect()->route('admin.products.show', $product)
            ->with('success', 'Plan created successfully.');
    }

    /**
     * Update a plan.
     */
    public function updatePlan(Request $request, Product $product, Plan $plan)
    {
        if ($plan->product_id !== $product->id) {
            return back()->with('error', 'Plan does not belong to this product.');
        }

        $validated = $request->validate([
            'resellerclub_plan_id' => 'nullable|integer',
            'plan_type' => 'required|in:add,renew,restore,transfer',
            'package_months' => 'required|integer|min:1',
            'price_per_month' => 'required|numeric|min:0',
            'setup_fee' => 'nullable|numeric|min:0',
            'is_active' => 'boolean',
        ]);

        $plan->update($validated);

        return redirect()->route('admin.products.show', $product)
            ->with('success', 'Plan updated successfully.');
    }

    /**
     * Delete a plan.
     */
    public function destroyPlan(Product $product, Plan $plan)
    {
        if ($plan->product_id !== $product->id) {
            return back()->with('error', 'Plan does not belong to this product.');
        }

        $plan->delete();

        return redirect()->route('admin.products.show', $product)
            ->with('success', 'Plan deleted successfully.');
    }

    /**
     * Store a new feature for the product.
     */
    public function storeFeature(Request $request, Product $product)
    {
        $validated = $request->validate([
            'feature' => 'required|string|max:255',
            'sort_order' => 'integer|min:0',
            'is_highlighted' => 'boolean',
            'icon' => 'nullable|string|max:255',
        ]);

        $validated['product_id'] = $product->id;
        Feature::create($validated);

        return redirect()->route('admin.products.show', $product)
            ->with('success', 'Feature created successfully.');
    }

    /**
     * Update a feature.
     */
    public function updateFeature(Request $request, Product $product, Feature $feature)
    {
        if ($feature->product_id !== $product->id) {
            return back()->with('error', 'Feature does not belong to this product.');
        }

        $validated = $request->validate([
            'feature' => 'required|string|max:255',
            'sort_order' => 'integer|min:0',
            'is_highlighted' => 'boolean',
            'icon' => 'nullable|string|max:255',
        ]);

        $feature->update($validated);

        return redirect()->route('admin.products.show', $product)
            ->with('success', 'Feature updated successfully.');
    }

    /**
     * Delete a feature.
     */
    public function destroyFeature(Product $product, Feature $feature)
    {
        if ($feature->product_id !== $product->id) {
            return back()->with('error', 'Feature does not belong to this product.');
        }

        $feature->delete();

        return redirect()->route('admin.products.show', $product)
            ->with('success', 'Feature deleted successfully.');
    }
}
