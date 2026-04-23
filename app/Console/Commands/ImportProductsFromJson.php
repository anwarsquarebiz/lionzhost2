<?php

namespace App\Console\Commands;

use App\Models\Product;
use App\Models\Plan;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class ImportProductsFromJson extends Command
{
    protected $signature = 'products:import-from-json {--fresh : Clear existing products before import}';
    protected $description = 'Import products and plans from products.json file';

    // Product key mappings to human-readable names and types
    protected array $productMapping = [
        // Shared Hosting - Linux India
        'singledomainhostinglinuxin' => [
            'name' => 'Single Domain Hosting (Linux)',
            'location' => 'India',
            'type' => 'shared-hosting',
            'description' => 'Perfect for getting started with a single website',
        ],
        // Shared Hosting - Linux US
        'singledomainhostinglinuxus' => [
            'name' => 'Single Domain Hosting (Linux)',
            'location' => 'United States',
            'type' => 'shared-hosting',
            'description' => 'Perfect for getting started with a single website',
        ],
        // Shared Hosting - Windows India
        'singledomainhostingwindowsin' => [
            'name' => 'Single Domain Hosting (Windows)',
            'location' => 'India',
            'type' => 'shared-hosting',
            'description' => 'Windows hosting for ASP.NET and .NET applications',
        ],
        // Shared Hosting - Windows US
        'singledomainhostingwindowsus' => [
            'name' => 'Single Domain Hosting (Windows)',
            'location' => 'United States',
            'type' => 'shared-hosting',
            'description' => 'Windows hosting for ASP.NET and .NET applications',
        ],
        // Multi Domain Hosting
        'multidomainhosting' => [
            'name' => 'Multi Domain Hosting (Linux)',
            'location' => 'United States',
            'type' => 'shared-hosting',
            'description' => 'Host unlimited domains on a single account',
        ],
        'multidomainhostinglinuxin' => [
            'name' => 'Multi Domain Hosting (Linux)',
            'location' => 'India',
            'type' => 'shared-hosting',
            'description' => 'Host unlimited domains on a single account',
        ],
        'multidomainwindowshostingin' => [
            'name' => 'Multi Domain Hosting (Windows)',
            'location' => 'India',
            'type' => 'shared-hosting',
            'description' => 'Host unlimited domains with Windows support',
        ],
        'multidomainwindowshosting' => [
            'name' => 'Multi Domain Hosting (Windows)',
            'location' => 'United States',
            'type' => 'shared-hosting',
            'description' => 'Host unlimited domains with Windows support',
        ],
        // Reseller Hosting
        'resellerhostinglinuxin' => [
            'name' => 'Reseller Hosting (Linux)',
            'location' => 'India',
            'type' => 'shared-hosting',
            'description' => 'Start your own web hosting business',
        ],
        'resellerhosting' => [
            'name' => 'Reseller Hosting (Linux)',
            'location' => 'United States',
            'type' => 'shared-hosting',
            'description' => 'Start your own web hosting business',
        ],
        'resellerwindowshosting' => [
            'name' => 'Reseller Hosting (Windows)',
            'location' => 'United States',
            'type' => 'shared-hosting',
            'description' => 'Start your own Windows hosting business',
        ],
        'resellerwindowshostingin' => [
            'name' => 'Reseller Hosting (Windows)',
            'location' => 'India',
            'type' => 'shared-hosting',
            'description' => 'Start your own Windows hosting business',
        ],
        // WordPress Hosting
        'wordpresshostingusa' => [
            'name' => 'WordPress Hosting',
            'location' => 'United States',
            'type' => 'shared-hosting',
            'description' => 'Optimized hosting for WordPress websites',
        ],
        // Cloud Sites
        'cloudsiteslinuxin' => [
            'name' => 'Cloud Sites (Linux)',
            'location' => 'India',
            'type' => 'shared-hosting',
            'description' => 'Scalable cloud-based website hosting',
        ],
        'cloudsiteslinuxus' => [
            'name' => 'Cloud Sites (Linux)',
            'location' => 'United States',
            'type' => 'shared-hosting',
            'description' => 'Scalable cloud-based website hosting',
        ],
        // VPS
        'virtualserverlinuxin' => [
            'name' => 'Virtual Private Server (Linux)',
            'location' => 'India',
            'type' => 'vps',
            'description' => 'Powerful VPS with full root access',
        ],
        // Dedicated Servers
        'dedicatedserverlinuxus' => [
            'name' => 'Dedicated Server (Linux)',
            'location' => 'United States',
            'type' => 'dedicated-hosting',
            'description' => 'Enterprise-grade dedicated server hosting',
        ],
        'dedicatedserverwindowsin' => [
            'name' => 'Dedicated Server (Windows)',
            'location' => 'India',
            'type' => 'dedicated-hosting',
            'description' => 'Enterprise-grade Windows dedicated server',
        ],
    ];

    public function handle()
    {
        $this->info('Starting product import from products.json...');

        // Check if products.json exists
        $jsonPath = base_path('products.json');
        if (!File::exists($jsonPath)) {
            $this->error('products.json file not found in root directory!');
            return 1;
        }

        // Load JSON data
        $this->info('Loading products.json...');
        $jsonData = json_decode(File::get($jsonPath), true);
        
        if (!$jsonData) {
            $this->error('Failed to parse products.json!');
            return 1;
        }

        // Clear existing products if --fresh flag is used
        if ($this->option('fresh')) {
            $this->warn('⚠ Clearing existing products and plans...');
            DB::statement('SET FOREIGN_KEY_CHECKS=0;');
            DB::table('features')->truncate();
            DB::table('plans')->truncate();
            DB::table('products')->truncate();
            DB::statement('SET FOREIGN_KEY_CHECKS=1;');
            $this->info('✓ Existing data cleared');
        }

        $this->info('Importing products...');
        $importedCount = 0;
        $skippedCount = 0;
        $plansImported = 0;

        DB::beginTransaction();

        try {
            foreach ($this->productMapping as $resellerclubKey => $productData) {
                // Check if product exists in JSON
                if (!isset($jsonData[$resellerclubKey])) {
                    $this->warn("⚠ Product key '{$resellerclubKey}' not found in products.json");
                    $skippedCount++;
                    continue;
                }

                $productJsonData = $jsonData[$resellerclubKey];
                
                // Create or update product
                $product = Product::updateOrCreate(
                    ['resellerclub_key' => $resellerclubKey],
                    [
                        'name' => $productData['name'],
                        'location' => $productData['location'],
                        'product_type' => $productData['type'],
                        'description' => $productData['description'],
                        'currency' => 'USD',
                        'is_active' => true,
                        'sort_order' => $importedCount,
                    ]
                );

                $this->info("✓ {$productData['name']} ({$productData['location']})");

                // Import plans
                $planCount = $this->importPlans($product, $productJsonData, $resellerclubKey);
                $plansImported += $planCount;
                
                $this->line("  → {$planCount} plans imported");
                $importedCount++;
            }

            DB::commit();

            $this->newLine();
            $this->info('═══════════════════════════════════════');
            $this->info("✓ Import completed successfully!");
            $this->info("  Products imported: {$importedCount}");
            $this->info("  Products skipped: {$skippedCount}");
            $this->info("  Plans imported: {$plansImported}");
            $this->info('═══════════════════════════════════════');

            return 0;

        } catch (\Exception $e) {
            DB::rollBack();
            $this->error('Import failed: ' . $e->getMessage());
            $this->error($e->getTraceAsString());
            return 1;
        }
    }

    protected function importPlans(Product $product, array $productJsonData, string $resellerclubKey): int
    {
        $planCount = 0;

        // Handle different JSON structures
        // For hosting products: direct structure with plan_id as key
        // For VPS/Dedicated: nested under "plans"
        
        $plansData = $productJsonData['plans'] ?? $productJsonData;
        
        // For VPS and Dedicated servers, each plan ID represents a different configuration
        // We'll only import the first plan ID for now, and user can manually create products for other configs
        $isVpsOrDedicated = in_array($product->product_type, ['vps', 'dedicated-hosting']);
        $processedPlanIds = 0;
        
        foreach ($plansData as $planId => $planData) {
            // Skip non-plan keys like 'addons', 'ssl'
            if (!is_array($planData) || is_string($planId) && in_array($planId, ['addons', 'ssl'])) {
                continue;
            }

            // For VPS/Dedicated, only process the first plan ID
            if ($isVpsOrDedicated && $processedPlanIds > 0) {
                $this->warn("  ⚠ Skipping additional plan configurations (Plan ID: {$planId})");
                $this->warn("    You can manually create separate products for different server configs");
                continue;
            }

            // Process 'add' plans
            if (isset($planData['add']) && is_array($planData['add'])) {
                foreach ($planData['add'] as $months => $pricePerMonth) {
                    $this->createPlan($product, $planId, 'add', (int)$months, (float)$pricePerMonth);
                    $planCount++;
                }
            }

            // Process 'renew' plans
            if (isset($planData['renew']) && is_array($planData['renew'])) {
                foreach ($planData['renew'] as $months => $pricePerMonth) {
                    $this->createPlan($product, $planId, 'renew', (int)$months, (float)$pricePerMonth);
                    $planCount++;
                }
            }

            // Process 'restore' plans (if exists)
            if (isset($planData['restore']) && is_array($planData['restore'])) {
                foreach ($planData['restore'] as $months => $pricePerMonth) {
                    $this->createPlan($product, $planId, 'restore', (int)$months, (float)$pricePerMonth);
                    $planCount++;
                }
            }
            
            $processedPlanIds++;
        }

        return $planCount;
    }

    protected function createPlan(Product $product, $resellerclubPlanId, string $planType, int $months, float $pricePerMonth): void
    {
        Plan::updateOrCreate(
            [
                'product_id' => $product->id,
                'plan_type' => $planType,
                'package_months' => $months,
            ],
            [
                'resellerclub_plan_id' => (string)$resellerclubPlanId,
                'price_per_month' => $pricePerMonth,
                'setup_fee' => 0.00,
                'is_active' => true,
            ]
        );
    }
}

