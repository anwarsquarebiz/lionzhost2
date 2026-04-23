<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DomainSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create common TLDs
        $tlds = [
            ['extension' => 'com', 'name' => 'Commercial', 'registry_operator' => 'centralnic'],
            ['extension' => 'net', 'name' => 'Network', 'registry_operator' => 'centralnic'],
            ['extension' => 'org', 'name' => 'Organization', 'registry_operator' => 'centralnic'],
            ['extension' => 'info', 'name' => 'Information', 'registry_operator' => 'centralnic'],
            ['extension' => 'biz', 'name' => 'Business', 'registry_operator' => 'centralnic'],
            ['extension' => 'co', 'name' => 'Colombia', 'registry_operator' => 'resellerclub'],
            ['extension' => 'in', 'name' => 'India', 'registry_operator' => 'resellerclub'],
            ['extension' => 'uk', 'name' => 'United Kingdom', 'registry_operator' => 'resellerclub'],
            ['extension' => 'de', 'name' => 'Germany', 'registry_operator' => 'resellerclub'],
            ['extension' => 'fr', 'name' => 'France', 'registry_operator' => 'resellerclub'],
        ];

        foreach ($tlds as $tldData) {
            \App\Models\Tld::firstOrCreate(
                ['extension' => $tldData['extension']],
                array_merge($tldData, [
                    'is_active' => true,
                    'min_years' => 1,
                    'max_years' => 10,
                    'auto_renewal' => true,
                    'privacy_protection' => true,
                    'dns_management' => true,
                    'email_forwarding' => true,
                    'id_protection' => true,
                ])
            );
        }

        // Create domain prices for each TLD
        $tlds = \App\Models\Tld::all();
        foreach ($tlds as $tld) {
            for ($years = 1; $years <= 5; $years++) {
                \App\Models\DomainPrice::firstOrCreate([
                    'tld_id' => $tld->id,
                    'years' => $years,
                ], [
                    'cost' => rand(8, 15) + ($years * 2),
                    'margin' => rand(2, 5),
                    'sell_price' => rand(10, 20) + ($years * 2),
                    'is_premium' => rand(1, 100) <= 10,
                    'is_promotional' => rand(1, 100) <= 20,
                ]);
            }
        }

        // Create sample products
        $products = [
            [
                'name' => 'Basic Web Hosting',
                'description' => 'Perfect for small websites',
                'type' => 'hosting',
                'category' => 'web-hosting',
                'price' => 9.99,
                'billing_cycle' => 'monthly',
                'features' => ['5GB Storage', '50GB Bandwidth', '1 Domain'],
            ],
            [
                'name' => 'SSL Certificate',
                'description' => 'Secure your website with SSL',
                'type' => 'ssl',
                'category' => 'security',
                'price' => 29.99,
                'billing_cycle' => 'yearly',
                'features' => ['256-bit Encryption', 'Trust Seal', '1 Year Validity'],
            ],
            [
                'name' => 'Email Hosting',
                'description' => 'Professional email hosting',
                'type' => 'email',
                'category' => 'email-hosting',
                'price' => 4.99,
                'billing_cycle' => 'monthly',
                'features' => ['5GB Mailbox', 'Webmail Access', 'Spam Protection'],
            ],
        ];

        foreach ($products as $productData) {
            \App\Models\Product::firstOrCreate(
                ['name' => $productData['name']],
                $productData
            );
        }

        // Create registry accounts
        \App\Models\RegistryAccount::firstOrCreate([
            'provider' => 'centralnic',
        ], [
            'username' => 'test_centralnic',
            'password' => 'test_password',
            'api_key' => 'test_api_key',
            'mode' => 'test',
            'is_active' => true,
        ]);

        \App\Models\RegistryAccount::firstOrCreate([
            'provider' => 'resellerclub',
        ], [
            'username' => 'test_resellerclub',
            'password' => 'test_password',
            'api_key' => 'test_api_key',
            'mode' => 'test',
            'is_active' => true,
        ]);
    }
}
