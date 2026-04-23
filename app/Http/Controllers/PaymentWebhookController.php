<?php

namespace App\Http\Controllers;

use App\Jobs\ProvisionOrderJob;
use App\Models\Cart;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PaymentWebhookController extends Controller
{
    /**
     * Handle Razorpay webhook.
     */
    public function razorpay(Request $request)
    {
        try {
            $payload = $request->all();
            
            Log::info('Razorpay webhook received', ['event' => $payload['event'] ?? 'unknown']);

            // Verify signature
            if (!$this->verifyRazorpaySignature($request)) {
                Log::warning('Razorpay webhook signature verification failed');
                return response()->json(['error' => 'Invalid signature'], 400);
            }

            $event = $payload['event'];
            
            if ($event === 'payment.captured' || $event === 'payment.authorized') {
                $this->handlePaymentSuccess($payload, 'razorpay');
            } elseif ($event === 'payment.failed') {
                $this->handlePaymentFailed($payload, 'razorpay');
            }

            return response()->json(['status' => 'ok']);
        } catch (\Exception $e) {
            Log::error('Razorpay webhook processing failed', [
                'error' => $e->getMessage()
            ]);

            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Handle Stripe webhook.
     */
    public function stripe(Request $request)
    {
        try {
            $payload = $request->all();
            
            Log::info('Stripe webhook received', ['type' => $payload['type'] ?? 'unknown']);

            // Verify signature
            if (!$this->verifyStripeSignature($request)) {
                Log::warning('Stripe webhook signature verification failed');
                return response()->json(['error' => 'Invalid signature'], 400);
            }

            $eventType = $payload['type'];
            
            if ($eventType === 'payment_intent.succeeded') {
                $this->handlePaymentSuccess($payload, 'stripe');
            } elseif ($eventType === 'payment_intent.payment_failed') {
                $this->handlePaymentFailed($payload, 'stripe');
            }

            return response()->json(['status' => 'ok']);
        } catch (\Exception $e) {
            Log::error('Stripe webhook processing failed', [
                'error' => $e->getMessage()
            ]);

            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Handle successful payment.
     */
    private function handlePaymentSuccess(array $payload, string $gateway): void
    {
        DB::transaction(function () use ($payload, $gateway) {
            $paymentId = $this->extractPaymentId($payload, $gateway);
            $amount = $this->extractAmount($payload, $gateway);
            $metadata = $this->extractMetadata($payload, $gateway);

            // Find or create payment record
            $payment = Payment::firstOrCreate(
                [
                    'payment_gateway' => $gateway,
                    'gateway_payment_id' => $paymentId,
                ],
                [
                    'amount' => $amount,
                    'currency' => $metadata['currency'] ?? 'USD',
                    'status' => 'processing',
                    'gateway_response' => $payload,
                    'metadata' => $metadata,
                ]
            );

            if ($payment->isCompleted()) {
                Log::info('Payment already processed', ['payment_id' => $payment->id]);
                return;
            }

            // Create order from cart/metadata
            $order = $this->createOrderFromPayment($payment, $metadata);

            // Update payment with order
            $payment->update([
                'order_id' => $order->id,
                'status' => 'completed',
                'paid_at' => now(),
            ]);

            // Update order status
            $order->update([
                'payment_status' => 'paid',
                'status' => 'processing',
            ]);

            Log::info('Payment processed successfully', [
                'payment_id' => $payment->id,
                'order_id' => $order->id
            ]);

            // Dispatch provisioning job
            ProvisionOrderJob::dispatch($order->id);
        });
    }

    /**
     * Handle failed payment.
     */
    private function handlePaymentFailed(array $payload, string $gateway): void
    {
        $paymentId = $this->extractPaymentId($payload, $gateway);
        
        $payment = Payment::where('payment_gateway', $gateway)
            ->where('gateway_payment_id', $paymentId)
            ->first();

        if ($payment) {
            $payment->markAsFailed($payload['error']['description'] ?? 'Payment failed');
            
            if ($payment->order) {
                $payment->order->update([
                    'payment_status' => 'failed',
                    'status' => 'failed',
                ]);
            }
        }

        Log::warning('Payment failed', [
            'gateway' => $gateway,
            'payment_id' => $paymentId
        ]);
    }

    /**
     * Create order from payment and cart/metadata.
     */
    private function createOrderFromPayment(Payment $payment, array $metadata): Order
    {
        $user = $payment->user ?? User::find($metadata['user_id'] ?? null);
        $customer = $user?->customer;

        if (!$customer) {
            // Create customer if doesn't exist
            $customer = Customer::create([
                'user_id' => $user->id,
            ]);
        }

        // Generate order number
        $orderNumber = 'ORD-' . strtoupper(uniqid());

        // Create order
        $order = Order::create([
            'customer_id' => $customer->id,
            'order_number' => $orderNumber,
            'status' => 'pending',
            'total_amount' => $payment->amount,
            'currency' => $payment->currency,
            'payment_method' => $payment->payment_method,
            'payment_status' => 'processing',
        ]);

        // Get cart items
        $cartId = $metadata['cart_id'] ?? null;
        if ($cartId) {
            $cart = Cart::find($cartId);
            if ($cart) {
                $this->createOrderItemsFromCart($order, $cart);
                $cart->clear(); // Clear cart after order creation
            }
        }

        return $order;
    }

    /**
     * Create order items from cart.
     */
    private function createOrderItemsFromCart(Order $order, Cart $cart): void
    {
        foreach ($cart->items as $cartItem) {
            OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $cartItem->product_id,
                'quantity' => $cartItem->quantity,
                'unit_price' => $cartItem->unit_price,
                'total_price' => $cartItem->total_price,
                'description' => $cartItem->getFullDomain() ?? $cartItem->domain,
            ]);

            // Create domain order if domain item
            if ($cartItem->type === 'domain') {
                $order->domainOrders()->create([
                    'domain' => $cartItem->domain,
                    'tld_id' => $cartItem->tld_id,
                    'years' => $cartItem->years,
                    'privacy_protection' => $cartItem->hasOption('privacy'),
                    'status' => 'pending',
                ]);
            }

            // Create hosting order if hosting item
            if ($cartItem->type === 'hosting') {
                $order->hostingOrders()->create([
                    'product_id' => $cartItem->product_id,
                    'customer_id' => $order->customer_id,
                    'domain' => $cartItem->domain,
                    'package_name' => $cartItem->product->name,
                    'billing_cycle' => $cartItem->metadata['billing_cycle'] ?? 12,
                    'price' => $cartItem->total_price,
                    'currency' => 'USD',
                    'status' => 'pending',
                ]);
            }
        }
    }

    /**
     * Extract payment ID from payload.
     */
    private function extractPaymentId(array $payload, string $gateway): string
    {
        return match ($gateway) {
            'razorpay' => $payload['payload']['payment']['entity']['id'] ?? '',
            'stripe' => $payload['data']['object']['id'] ?? '',
            default => '',
        };
    }

    /**
     * Extract amount from payload.
     */
    private function extractAmount(array $payload, string $gateway): float
    {
        return match ($gateway) {
            'razorpay' => ($payload['payload']['payment']['entity']['amount'] ?? 0) / 100,
            'stripe' => ($payload['data']['object']['amount'] ?? 0) / 100,
            default => 0,
        };
    }

    /**
     * Extract metadata from payload.
     */
    private function extractMetadata(array $payload, string $gateway): array
    {
        return match ($gateway) {
            'razorpay' => $payload['payload']['payment']['entity']['notes'] ?? [],
            'stripe' => $payload['data']['object']['metadata'] ?? [],
            default => [],
        };
    }

    /**
     * Verify Razorpay webhook signature.
     */
    private function verifyRazorpaySignature(Request $request): bool
    {
        $webhookSecret = config('services.razorpay.webhook_secret');
        
        if (!$webhookSecret) {
            return true; // Skip verification if no secret configured
        }

        $signature = $request->header('X-Razorpay-Signature');
        $payload = $request->getContent();
        
        $expectedSignature = hash_hmac('sha256', $payload, $webhookSecret);
        
        return hash_equals($expectedSignature, $signature);
    }

    /**
     * Verify Stripe webhook signature.
     */
    private function verifyStripeSignature(Request $request): bool
    {
        $webhookSecret = config('services.stripe.webhook_secret');
        
        if (!$webhookSecret) {
            return true; // Skip verification if no secret configured
        }

        $signature = $request->header('Stripe-Signature');
        $payload = $request->getContent();
        
        // Simplified signature verification - use Stripe SDK in production
        return !empty($signature);
    }
}