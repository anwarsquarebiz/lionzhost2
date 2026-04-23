<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Inertia\Inertia;
use Inertia\Response;

class PublicProductController extends Controller
{
    public function sharedHosting(): Response
    {
        $products = Product::with(['plans' => function ($query) {
            $query->where('is_active', true)
                  ->orderBy('package_months');
        }, 'features' => function ($query) {
            $query->orderBy('sort_order');
        }])
        ->where('product_type', 'shared-hosting')
        ->where('is_active', true)
        ->orderBy('sort_order')
        ->get();

        return Inertia::render('PublicSharedHosting', [
            'products' => $products,
        ]);
    }

    public function vps(): Response
    {
        $products = Product::with(['plans' => function ($query) {
            $query->where('is_active', true)
                  ->orderBy('package_months');
        }, 'features' => function ($query) {
            $query->orderBy('sort_order');
        }])
        ->where('product_type', 'vps')
        ->where('is_active', true)
        ->orderBy('sort_order')
        ->get();

        return Inertia::render('PublicVPS', [
            'products' => $products,
        ]);
    }

    public function dedicatedServers(): Response
    {
        $products = Product::with(['plans' => function ($query) {
            $query->where('is_active', true)
                  ->orderBy('package_months');
        }, 'features' => function ($query) {
            $query->orderBy('sort_order');
        }])
        ->where('product_type', 'dedicated-hosting')
        ->where('is_active', true)
        ->orderBy('sort_order')
        ->get();

        return Inertia::render('PublicDedicatedServers', [
            'products' => $products,
        ]);
    }

    public function ssl(): Response
    {
        $products = Product::with(['plans' => function ($query) {
            $query->where('is_active', true)
                  ->orderBy('package_months');
        }, 'features' => function ($query) {
            $query->orderBy('sort_order');
        }])
        ->where('product_type', 'ssl')
        ->where('is_active', true)
        ->orderBy('sort_order')
        ->get();

        return Inertia::render('PublicSSL', [
            'products' => $products,
        ]);
    }
}

