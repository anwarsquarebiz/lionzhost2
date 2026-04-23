import PublicLayout from '@/layouts/public-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { router, useForm } from '@inertiajs/react';
import { CreditCard, Lock, Globe, Server, Shield, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';

interface CartItem {
    id: number;
    type: string;
    domain: string | null;
    full_domain: string | null;
    tld: {
        id: number;
        extension: string;
        name: string;
    } | null;
    product: {
        id: number;
        name: string;
        type: string;
    } | null;
    years: number;
    quantity: number;
    unit_price: number;
    total_price: number;
    options: {
        privacy?: boolean;
        dns_management?: boolean;
        email_forwarding?: boolean;
        dnssec?: boolean;
    };
}

interface Cart {
    id: number;
    subtotal: number | string;
    tax: number | string;
    total: number | string;
    currency: string;
    discount: number | string;
    coupon_code: string | null;
    items: CartItem[];
}

interface Props {
    cart: Cart;
}

// Helper functions
function getItemIcon(type: string) {
    switch (type) {
        case 'domain':
            return <Globe className="h-4 w-4 text-blue-600" />;
        case 'hosting':
        case 'vps':
        case 'dedicated':
            return <Server className="h-4 w-4 text-purple-600" />;
        case 'ssl':
            return <Shield className="h-4 w-4 text-green-600" />;
        default:
            return null;
    }
}

function getItemTitle(item: CartItem) {
    if (item.type === 'domain') {
        return item.full_domain || item.domain;
    }
    return item.product?.name || 'Product';
}

function getItemOptions(item: CartItem) {
    const options = [];
    
    if (item.options?.privacy) {
        options.push('Privacy');
    }
    if (item.options?.dns_management) {
        options.push('DNS');
    }
    if (item.options?.email_forwarding) {
        options.push('Email');
    }
    if (item.options?.dnssec) {
        options.push('DNSSEC');
    }
    
    return options;
}

export default function Checkout({ cart }: Props) {
    const [isProcessing, setIsProcessing] = useState(false);
    const { data, setData, post, processing } = useForm({
        payment_method: 'afs',
        billing_address: {
            first_name: '',
            last_name: '',
            email: '',
            phone: '',
            address_line_1: '',
            address_line_2: '',
            city: '',
            state: '',
            postal_code: '',
            country: 'IN',
        },
        terms_accepted: false,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!data.terms_accepted) {
            toast.error('Please accept the terms and conditions');
            return;
        }

        setIsProcessing(true);

        try {
            // Initiate payment
            const response = await fetch('/payment/initiate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!result.success) {
                toast.error('Payment initiation failed: ' + (result.message || 'Unknown error'));
                setIsProcessing(false);
                return;
            }

            // Configure AFS Checkout
            const afsCheckout = (window as any).Checkout;
            
            if (!afsCheckout) {
                toast.error('AFS checkout script not loaded. Please refresh the page.');
                setIsProcessing(false);
                return;
            }

            // Configure checkout with ONLY session ID (v67+ requirement)
            afsCheckout.configure({
                session: {
                    id: result.session_id,
                },
            });

            // Show payment page
            afsCheckout.showPaymentPage();
            
            // The callback will be handled by the return URL
            setIsProcessing(false);
        } catch (error) {
            console.error('Payment error:', error);
            toast.error('Payment failed. Please try again.');
            setIsProcessing(false);
        }
    };

    const getItemIcon = (type: string) => {
        switch (type) {
            case 'domain':
                return <Globe className="h-4 w-4 text-blue-600" />;
            case 'hosting':
            case 'vps':
            case 'dedicated':
                return <Server className="h-4 w-4 text-purple-600" />;
            case 'ssl':
                return <Shield className="h-4 w-4 text-green-600" />;
            default:
                return null;
        }
    };

    const getItemTitle = (item: CartItem) => {
        if (item.type === 'domain') {
            return item.full_domain || item.domain;
        }
        return item.product?.name || 'Product';
    };

    return (
        <PublicLayout title="Checkout">
            <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
                <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                            Checkout
                        </h1>
                        <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
                            Complete your order securely
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-8 lg:grid-cols-3">
                            {/* Checkout Form */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Billing Information */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Billing Information</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="first_name">First Name *</Label>
                                                <Input
                                                    id="first_name"
                                                    type="text"
                                                    required
                                                    value={data.billing_address.first_name}
                                                    onChange={(e) => setData('billing_address', {
                                                        ...data.billing_address,
                                                        first_name: e.target.value,
                                                    })}
                                                />
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <Label htmlFor="last_name">Last Name *</Label>
                                                <Input
                                                    id="last_name"
                                                    type="text"
                                                    required
                                                    value={data.billing_address.last_name}
                                                    onChange={(e) => setData('billing_address', {
                                                        ...data.billing_address,
                                                        last_name: e.target.value,
                                                    })}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="email">Email *</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    required
                                                    value={data.billing_address.email}
                                                    onChange={(e) => setData('billing_address', {
                                                        ...data.billing_address,
                                                        email: e.target.value,
                                                    })}
                                                />
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <Label htmlFor="phone">Phone *</Label>
                                                <Input
                                                    id="phone"
                                                    type="tel"
                                                    required
                                                    value={data.billing_address.phone}
                                                    onChange={(e) => setData('billing_address', {
                                                        ...data.billing_address,
                                                        phone: e.target.value,
                                                    })}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="address_line_1">Address Line 1 *</Label>
                                            <Input
                                                id="address_line_1"
                                                type="text"
                                                required
                                                value={data.billing_address.address_line_1}
                                                onChange={(e) => setData('billing_address', {
                                                    ...data.billing_address,
                                                    address_line_1: e.target.value,
                                                })}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="address_line_2">Address Line 2</Label>
                                            <Input
                                                id="address_line_2"
                                                type="text"
                                                value={data.billing_address.address_line_2}
                                                onChange={(e) => setData('billing_address', {
                                                    ...data.billing_address,
                                                    address_line_2: e.target.value,
                                                })}
                                            />
                                        </div>

                                        <div className="grid gap-4 md:grid-cols-3">
                                            <div className="space-y-2">
                                                <Label htmlFor="city">City *</Label>
                                                <Input
                                                    id="city"
                                                    type="text"
                                                    required
                                                    value={data.billing_address.city}
                                                    onChange={(e) => setData('billing_address', {
                                                        ...data.billing_address,
                                                        city: e.target.value,
                                                    })}
                                                />
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <Label htmlFor="state">State *</Label>
                                                <Input
                                                    id="state"
                                                    type="text"
                                                    required
                                                    value={data.billing_address.state}
                                                    onChange={(e) => setData('billing_address', {
                                                        ...data.billing_address,
                                                        state: e.target.value,
                                                    })}
                                                />
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <Label htmlFor="postal_code">Postal Code *</Label>
                                                <Input
                                                    id="postal_code"
                                                    type="text"
                                                    required
                                                    value={data.billing_address.postal_code}
                                                    onChange={(e) => setData('billing_address', {
                                                        ...data.billing_address,
                                                        postal_code: e.target.value,
                                                    })}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="country">Country *</Label>
                                            <select
                                                id="country"
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                required
                                                value={data.billing_address.country}
                                                onChange={(e) => setData('billing_address', {
                                                    ...data.billing_address,
                                                    country: e.target.value,
                                                })}
                                            >
                                                <option value="IN">India</option>
                                                <option value="US">United States</option>
                                                <option value="GB">United Kingdom</option>
                                                <option value="CA">Canada</option>
                                                <option value="AU">Australia</option>
                                            </select>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Payment Method */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Payment Method</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex justify-center">
                                            <div className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-blue-600 bg-blue-50 dark:bg-blue-950 p-6 w-full max-w-sm">
                                                <CreditCard className="h-8 w-8 text-blue-600" />
                                                <span className="font-medium text-lg">Mastercard</span>
                                                <span className="text-sm text-gray-600 dark:text-gray-400">Secure Payment Gateway</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-900 dark:bg-blue-900/20 dark:text-blue-300">
                                            <Lock className="h-4 w-4" />
                                            <span>Your payment information is secure and encrypted</span>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Terms & Conditions */}
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="flex items-center gap-3">
                                            <Checkbox
                                                id="terms"
                                                checked={data.terms_accepted}
                                                onCheckedChange={(checked) => setData('terms_accepted', checked as boolean)}
                                            />
                                            <div className="space-y-1">
                                                <label
                                                    htmlFor="terms"
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    I agree to the terms and conditions
                                                </label>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    By checking this box, you agree to our{' '}
                                                    <a href="#" className="text-blue-600 hover:underline">
                                                        Terms of Service
                                                    </a>{' '}
                                                    and{' '}
                                                    <a href="#" className="text-blue-600 hover:underline">
                                                        Privacy Policy
                                                    </a>
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Order Summary */}
                            <div className="lg:col-span-1">
                                <Card className="sticky top-4">
                                    <CardHeader>
                                        <CardTitle>Order Summary</CardTitle>
                                    </CardHeader>
                                    
                                    <CardContent className="space-y-4">
                                        {/* Cart Items */}
                                        <div className="space-y-3 border-b pb-4">
                                            {cart.items.map((item) => (
                                                <div key={item.id} className="flex items-center gap-3">
                                                    {getItemIcon(item.type)}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm font-medium truncate">
                                                            {getItemTitle(item)}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {item.years} {item.years === 1 ? 'year' : 'years'}
                                                        </div>
                                                        {getItemOptions(item).length > 0 && (
                                                            <div className="mt-1 flex flex-wrap gap-1">
                                                                {getItemOptions(item).map((option) => (
                                                                    <Badge key={option} variant="outline" className="text-xs">
                                                                        {option}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="text-sm font-medium">
                                                        ${typeof item.total_price === 'number' ? item.total_price.toFixed(2) : Number(item.total_price || 0).toFixed(2)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Price Breakdown */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                                                <span className="font-medium">${Number(cart.subtotal || 0).toFixed(2)}</span>
                                            </div>
                                            
                                            {Number(cart.discount || 0) > 0 && (
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600 dark:text-gray-400">Discount</span>
                                                    <span className="font-medium text-green-600">-${Number(cart.discount || 0).toFixed(2)}</span>
                                                </div>
                                            )}
                                            
                                            {Number(cart.tax || 0) > 0 && (
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600 dark:text-gray-400">Tax</span>
                                                    <span className="font-medium">${Number(cart.tax || 0).toFixed(2)}</span>
                                                </div>
                                            )}
                                            
                                            <div className="flex justify-between border-t pt-2 text-lg font-bold">
                                                <span>Total</span>
                                                <span className="text-blue-600">${Number(cart.total || 0).toFixed(2)} {cart.currency}</span>
                                            </div>
                                        </div>

                                        {/* Security Badge */}
                                        <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-900 dark:bg-green-900/20 dark:text-green-300">
                                            <Lock className="h-4 w-4" />
                                            <span>Secure SSL encrypted payment</span>
                                        </div>
                                    </CardContent>
                                    
                                    <CardFooter className="flex flex-col gap-2">
                                        <Button 
                                            type="submit"
                                            className="w-full" 
                                            size="lg"
                                            disabled={isProcessing || !data.terms_accepted}
                                        >
                                            <Lock className="mr-2 h-4 w-4" />
                                            {isProcessing ? 'Processing...' : `Pay $${Number(cart.total || 0).toFixed(2)}`}
                                        </Button>
                                        <Button 
                                            type="button"
                                            variant="outline" 
                                            className="w-full"
                                            onClick={() => router.get('/cart')}
                                        >
                                            Back to Cart
                                        </Button>
                                    </CardFooter>
                                {/* Trust Badges */}
                                <div className="flex items-center justify-center gap-8 rounded-lg bg-white p-6 dark:bg-gray-800">
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        <Lock className="h-5 w-5 text-green-600" />
                                        <span>Secure Payment</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        <Shield className="h-5 w-5 text-blue-600" />
                                        <span>Data Protected</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        <Check className="h-5 w-5 text-purple-600" />
                                        <span>Instant Delivery</span>
                                    </div>
                                </div>
                                </Card>

                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </PublicLayout>
    );
}

