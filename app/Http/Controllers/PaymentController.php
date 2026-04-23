<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Services\AFSPaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Razorpay\Api\Api as RazorpayApi;
use Stripe\Stripe;
use Stripe\Checkout\Session as StripeSession;

class PaymentController extends Controller
{
    /**
     * Initiate payment for checkout.
     */
    public function initiatePayment(Request $request)
    {
        $request->validate([
            'payment_method' => 'required|in:razorpay,stripe,afs',
            'billing_address' => 'required|array',
            'billing_address.first_name' => 'required|string',
            'billing_address.last_name' => 'required|string',
            'billing_address.email' => 'required|email',
            'billing_address.phone' => 'required|string',
            'billing_address.address_line_1' => 'required|string',
            'billing_address.city' => 'required|string',
            'billing_address.state' => 'required|string',
            'billing_address.postal_code' => 'required|string',
            'billing_address.country' => 'required|string',
            'terms_accepted' => 'required|accepted',
        ]);

        // Get cart or create cart
        $cart = $this->getOrCreateCart($request);

        if ($cart->isEmpty()) {
            return back()->with('error', 'Your cart is empty');
        }

        // Get or create customer
        $customer = $this->getOrCreateCustomer($request);

        // Create order
        $order = $this->createOrderFromCart($cart, $customer, $request->billing_address);

        // Create payment record
        $payment = Payment::create([
            'user_id' => $request->user()?->id,
            'order_id' => $order->id,
            'amount' => $cart->total,
            'currency' => $cart->currency,
            'payment_method' => $request->payment_method,
            'payment_gateway' => $request->payment_method,
            'gateway_payment_id' => null, // Will be set after payment completion
            'status' => 'pending',
            'metadata' => [
                'cart_id' => $cart->id,
                'billing_address' => $request->billing_address,
            ],
        ]);

        // Initiate payment based on gateway
        if ($request->payment_method === 'razorpay') {
            return $this->initiateRazorpay($payment, $order);
        } elseif ($request->payment_method === 'stripe') {
            return $this->initiateStripe($payment, $order);
        } elseif ($request->payment_method === 'afs') {
            Log::info('Initiating AFS payment');
            return $this->initiateAFS($payment, $order);
        }

        return back()->with('error', 'Invalid payment method');
    }

    /**
     * Initiate Razorpay payment.
     */
    private function initiateRazorpay(Payment $payment, Order $order)
    {
        try {
            $api = new RazorpayApi(
                config('services.razorpay.key'),
                config('services.razorpay.secret')
            );

            $razorpayOrder = $api->order->create([
                'amount' => $payment->amount * 100, // Amount in paise
                'currency' => $payment->currency,
                'receipt' => $order->order_number,
                'notes' => [
                    'order_id' => $order->id,
                    'payment_id' => $payment->id,
                ],
            ]);

            $payment->update([
                'gateway_order_id' => $razorpayOrder->id,
            ]);

            return response()->json([
                'success' => true,
                'gateway' => 'razorpay',
                'order_id' => $razorpayOrder->id,
                'amount' => $payment->amount * 100,
                'currency' => $payment->currency,
                'key' => config('services.razorpay.key'),
                'name' => config('app.name'),
                'description' => "Order #{$order->order_number}",
                'prefill' => [
                    'email' => $payment->metadata['billing_address']['email'] ?? '',
                    'contact' => $payment->metadata['billing_address']['phone'] ?? '',
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Razorpay order creation failed', [
                'error' => $e->getMessage(),
                'payment_id' => $payment->id,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to initiate payment: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Initiate Stripe payment.
     */
    private function initiateStripe(Payment $payment, Order $order)
    {
        try {
            Stripe::setApiKey(config('services.stripe.secret'));

            $session = StripeSession::create([
                'payment_method_types' => ['card'],
                'line_items' => [[
                    'price_data' => [
                        'currency' => strtolower($payment->currency),
                        'unit_amount' => $payment->amount * 100, // Amount in cents
                        'product_data' => [
                            'name' => "Order #{$order->order_number}",
                            'description' => "{$order->items->count()} items",
                        ],
                    ],
                    'quantity' => 1,
                ]],
                'mode' => 'payment',
                'success_url' => route('payment.success') . '?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => route('checkout'),
                'client_reference_id' => $order->order_number,
                'metadata' => [
                    'order_id' => $order->id,
                    'payment_id' => $payment->id,
                ],
            ]);

            $payment->update([
                'gateway_order_id' => $session->id,
            ]);

            return response()->json([
                'success' => true,
                'gateway' => 'stripe',
                'session_id' => $session->id,
                'url' => $session->url,
            ]);
        } catch (\Exception $e) {
            Log::error('Stripe session creation failed', [
                'error' => $e->getMessage(),
                'payment_id' => $payment->id,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to initiate payment: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Create order from cart.
     */
    private function createOrderFromCart(Cart $cart, Customer $customer, array $billingAddress): Order
    {
        return DB::transaction(function () use ($cart, $customer, $billingAddress) {
            $orderNumber = 'ORD-' . strtoupper(uniqid());

            $order = Order::create([
                'customer_id' => $customer->id,
                'order_number' => $orderNumber,
                'status' => 'pending',
                'total_amount' => $cart->total,
                'currency' => $cart->currency,
                'payment_status' => 'pending',
                'notes' => json_encode(['billing_address' => $billingAddress]),
            ]);

            // Create order items from cart
            foreach ($cart->items as $cartItem) {
                // Determine itemable based on type
                $itemableType = null;
                $itemableId = null;
                
                if ($cartItem->type === 'domain' && $cartItem->tld) {
                    // Check if domain already exists in domain_orders (to avoid duplicate)
                    $existingDomainOrder = \App\Models\DomainOrder::where('domain', $cartItem->domain)
                        ->where('tld_id', $cartItem->tld_id)
                        ->whereIn('status', ['pending', 'processing', 'registered'])
                        ->first();
                    
                    if ($existingDomainOrder) {
                        // Domain already has an active order, skip creating new one
                        // But still create the order item linking to existing domain order
                        $domainOrder = $existingDomainOrder;
                        Log::warning('Domain order already exists, using existing', [
                            'domain' => $cartItem->domain . '.' . $cartItem->tld->extension,
                            'existing_order_id' => $existingDomainOrder->id,
                        ]);
                    } else {
                        // Create new domain order
                        $domainOrder = $order->domainOrders()->create([
                            'domain' => $cartItem->domain,
                            'tld_id' => $cartItem->tld_id,
                            'years' => $cartItem->years,
                            'privacy_protection' => $cartItem->hasOption('privacy'),
                            'provider' => 'resellerclub', // Default provider
                            'status' => 'pending',
                        ]);
                    }
                    
                    $itemableType = get_class($domainOrder);
                    $itemableId = $domainOrder->id;
                } elseif (in_array($cartItem->type, ['hosting', 'vps', 'dedicated']) && $cartItem->product) {
                    // Create hosting order first
                    $hostingOrder = $order->hostingOrders()->create([
                        'product_id' => $cartItem->product_id,
                        'customer_id' => $customer->id,
                        'domain' => $cartItem->domain ?? 'temp-' . uniqid() . '.com',
                        'package_name' => $cartItem->product->name,
                        'billing_cycle' => $cartItem->years * 12,
                        'price' => $cartItem->total_price,
                        'currency' => $cart->currency,
                        'status' => 'pending',
                    ]);
                    $itemableType = get_class($hostingOrder);
                    $itemableId = $hostingOrder->id;
                }

                // Create order item with polymorphic relationship
                OrderItem::create([
                    'order_id' => $order->id,
                    'itemable_type' => $itemableType ?? 'App\\Models\\CartItem',
                    'itemable_id' => $itemableId ?? $cartItem->id,
                    'product_id' => $cartItem->product_id,
                    'quantity' => $cartItem->quantity,
                    'unit_price' => $cartItem->unit_price,
                    'total_price' => $cartItem->total_price,
                    'description' => $cartItem->type === 'domain' 
                        ? ($cartItem->domain . '.' . $cartItem->tld->extension)
                        : $cartItem->product?->name,
                ]);
            }

            return $order;
        });
    }

    /**
     * Get or create customer.
     */
    private function getOrCreateCustomer(Request $request): Customer
    {
        if ($request->user()) {
            return Customer::firstOrCreate(
                ['user_id' => $request->user()->id],
                []
            );
        }

        // For guest checkout, create customer with email
        return Customer::firstOrCreate(
            ['email' => $request->billing_address['email']],
            []
        );
    }

    /**
     * Get or create cart.
     */
    private function getOrCreateCart(Request $request): Cart
    {
        if ($request->user()) {
            return Cart::firstOrCreate(
                ['user_id' => $request->user()->id],
                ['expires_at' => now()->addDays(7)]
            );
        }

        $sessionId = $request->session()->getId();
        return Cart::firstOrCreate(
            ['session_id' => $sessionId],
            ['expires_at' => now()->addDays(7)]
        );
    }

    /**
     * Initiate AFS (Mastercard) payment.
     */
    private function initiateAFS(Payment $payment, Order $order)
    {
        try {
            $afsService = new AFSPaymentService();

            // Get item count from cart metadata or count domain/hosting orders
            $itemCount = 0;
            if (isset($payment->metadata['cart_id'])) {
                $cart = Cart::find($payment->metadata['cart_id']);
                $itemCount = $cart ? $cart->items()->count() : 0;
            }
            
            // Fallback: count from created orders
            if ($itemCount === 0) {
                $itemCount = $order->domainOrders()->count() + $order->hostingOrders()->count();
            }
            
            $result = $afsService->initiateCheckout([
                'order_id' => $order->order_number,
                'amount' => $payment->amount,
                'currency' => $payment->currency,
                'description' => "Order #{$order->order_number}" . ($itemCount > 0 ? " - {$itemCount} items" : ""),
            ]);

            if (!$result['success']) {
                Log::error('AFS: Checkout initiation failed', [
                    'payment_id' => $payment->id,
                    'error' => $result['error'] ?? 'Unknown error',
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Failed to initiate payment: ' . ($result['error'] ?? 'Unknown error'),
                ], 500);
            }

            $payment->update([
                'gateway_order_id' => $result['session_id'],
                'metadata' => array_merge($payment->metadata ?? [], [
                    'success_indicator' => $result['success_indicator'],
                    'session_id' => $result['session_id'],
                ]),
            ]);

            return response()->json([
                'success' => true,
                'gateway' => 'afs',
                'session_id' => $result['session_id'],
                'success_indicator' => $result['success_indicator'],
                'merchant_id' => $afsService->getMerchantId(),
                'order_id' => $order->order_number,
            ]);
        } catch (\Exception $e) {
            Log::error('AFS: Payment initiation exception', [
                'error' => $e->getMessage(),
                'payment_id' => $payment->id,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to initiate payment: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Handle AFS payment callback.
     */
    public function afsCallback(Request $request)
    {
        $resultIndicator = $request->input('resultIndicator');
        // $orderId = $request->input('orderId');
    
        // if (!$resultIndicator) {
        //     return redirect()->route('checkout')->with('error', 'Invalid payment response');
        // }

        // // orderId from the session
        // $orderId = $request->session()->get('order_number');

        // // Find the payment record
        // $order = Order::where('order_number', $orderId)->first();        
        
        // if (!$order) {
        //     return redirect()->route('checkout')->with('error', 'Order not found');
        // }

        // $payment = $order->payments()->latest()->first();
        
        // if (!$payment) {
        //     return redirect()->route('checkout')->with('error', 'Payment record not found');
        // }

        // Search the payment record by metadata where the key is success_indicator and the value is the resultIndicator
        $payment = Payment::where('metadata->success_indicator', $resultIndicator)->first();


        if (!$payment) {
            return redirect()->route('checkout')->with('error', 'Payment record not found');
        }
        

        // $successIndicator = $payment->metadata['success_indicator'] ?? null;

        // Verify payment result
        $afsService = new AFSPaymentService();
        $isSuccess = $afsService->verifyPaymentResult($resultIndicator, $payment->metadata['success_indicator']);
        
        if ($isSuccess) {
            // Retrieve order details from AFS
            $orderDetails = $afsService->retrieveOrder($payment->order->order_number);

            if ($orderDetails['success']) {
                // Update payment status
                $payment->update([
                    'status' => 'completed',
                    'paid_at' => now(),
                    'gateway_payment_id' => $orderDetails['data']['transaction'][0]['id'] ?? null,
                    'gateway_response' => $orderDetails['data'],
                ]);

                // Update order status
                $payment->order->update([
                    'payment_status' => 'paid',
                    'status' => 'processing',
                ]);

                // Clear cart
                if ($payment->metadata['cart_id'] ?? null) {
                    $cart = Cart::find($payment->metadata['cart_id']);
                    $cart?->clear();
                }

                return redirect()->route('payment.success', ['order' => $payment->order->order_number]);
            }
        }

        // Payment failed or verification failed
        $payment->update(['status' => 'failed']);
        // $order->update([
        //     'payment_status' => 'failed',
        //     'status' => 'failed',
        // ]);

        return redirect()->route('checkout')->with('error', 'Payment verification failed');
    }

    /**
     * Payment success page.
     */
    public function success(Request $request)
    {
        return Inertia::render('PaymentSuccess', [
            'order_number' => $request->order,
        ]);
    }
}


