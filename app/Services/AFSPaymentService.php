<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AFSPaymentService
{
    private string $baseUrl;
    private string $merchantId;
    private string $apiPassword;
    private string $version;

    public function __construct()
    {
        $this->baseUrl = config('services.afs.base_url');
        $this->merchantId = config('services.afs.merchant_id');
        $this->apiPassword = config('services.afs.api_password');
        $this->version = config('services.afs.version');
    }

    /**
     * Initiate checkout session.
     * 
     * @see https://afs.gateway.mastercard.com/api/documentation/integrationGuidelines/hostedCheckout/integrationModelHostedCheckout.html
     */
    public function initiateCheckout(array $orderData): array
    {
        $url = "{$this->baseUrl}/version/{$this->version}/merchant/{$this->merchantId}/session";
        
        $payload = [
            'apiOperation' => 'INITIATE_CHECKOUT',
            'interaction' => [
                'operation' => 'PURCHASE',
                'returnUrl' => $orderData['return_url'] ?? route('payment.afs.callback'),
                'merchant' => [
                    'name' => config('app.name'),
                ],
            ],
            'order' => [
                'currency' => $orderData['currency'] ?? config('services.afs.currency', 'USD'),
                'amount' => number_format($orderData['amount'], 2, '.', ''),
                'id' => $orderData['order_id'],
                'description' => $orderData['description'] ?? "Order #{$orderData['order_id']}",
            ],
        ];

        Log::info('AFS: Initiating checkout session', [
            'order_id' => $orderData['order_id'],
            'amount' => $orderData['amount'],
        ]);

        try {
            $http = Http::withBasicAuth(
                "merchant.{$this->merchantId}",
                $this->apiPassword
            )
            ->withHeaders([
                'Content-Type' => 'application/json',
            ]);
            
            // Disable SSL verification in local development
            if (app()->environment('local')) {
                $http = $http->withOptions(['verify' => false]);
            }
            
            $response = $http->post($url, $payload);

            if ($response->successful()) {
                $data = $response->json();
                
                Log::info('AFS: Checkout session created', [
                    'session_id' => $data['session']['id'] ?? null,
                ]);

                return [
                    'success' => true,
                    'session_id' => $data['session']['id'] ?? null,
                    'success_indicator' => $data['successIndicator'] ?? null,
                    'response' => $data,
                ];
            }

            Log::error('AFS: Failed to create checkout session', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return [
                'success' => false,
                'error' => $response->body(),
            ];
        } catch (\Exception $e) {
            Log::error('AFS: Exception during checkout initiation', [
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Retrieve order details.
     */
    public function retrieveOrder(string $orderId): array
    {
        $url = "{$this->baseUrl}/version/{$this->version}/merchant/{$this->merchantId}/order/{$orderId}";

        try {

            // http without ssl verification
            $response = Http::withOptions(['verify' => false])->withBasicAuth(
                "merchant.{$this->merchantId}",
                $this->apiPassword
            )->get($url);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json(),
                ];
            }

            return [
                'success' => false,
                'error' => $response->body(),
            ];
        } catch (\Exception $e) {
            Log::error('AFS: Failed to retrieve order', [
                'order_id' => $orderId,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Verify payment result.
     */
    public function verifyPaymentResult(string $resultIndicator, string $successIndicator): bool
    {
        return $resultIndicator === $successIndicator;
    }

    /**
     * Get checkout script URL.
     */
    public function getCheckoutScriptUrl(): string
    {
        return 'https://afs.gateway.mastercard.com/static/checkout/checkout.min.js';
    }

    /**
     * Get merchant ID for frontend.
     */
    public function getMerchantId(): string
    {
        return $this->merchantId;
    }
}

