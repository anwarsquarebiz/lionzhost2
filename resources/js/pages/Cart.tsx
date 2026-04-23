import PublicLayout, { useCart } from '@/layouts/public-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { router } from '@inertiajs/react';
import { ShoppingCart, Trash2, Globe, Server, Shield, Tag, ArrowRight, X } from 'lucide-react';
import { useState } from 'react';

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

export default function Cart({ cart }: Props) {
    const [couponCode, setCouponCode] = useState('');
    const [removingItem, setRemovingItem] = useState<number | null>(null);
    const { decrementCart, updateCartCount } = useCart();

    const handleRemoveItem = (itemId: number) => {
        setRemovingItem(itemId);
        decrementCart(); // Update count immediately
        router.delete(`/cart/items/${itemId}`, {
            preserveScroll: true,
            onFinish: () => setRemovingItem(null),
        });
    };

    const handleClearCart = () => {
        if (confirm('Are you sure you want to clear your cart?')) {
            updateCartCount(0); // Clear count immediately
            router.delete('/cart/clear');
        }
    };

    const handleApplyCoupon = (e: React.FormEvent) => {
        e.preventDefault();
        if (couponCode.trim()) {
            router.post('/cart/coupon', { coupon_code: couponCode }, {
                preserveScroll: true,
            });
        }
    };

    const handleCheckout = () => {
        router.get('/checkout');
    };

    const getItemIcon = (type: string) => {
        switch (type) {
            case 'domain':
                return <Globe className="h-5 w-5 text-blue-600" />;
            case 'hosting':
            case 'vps':
            case 'dedicated':
                return <Server className="h-5 w-5 text-purple-600" />;
            case 'ssl':
                return <Shield className="h-5 w-5 text-green-600" />;
            default:
                return <ShoppingCart className="h-5 w-5 text-gray-600" />;
        }
    };

    const getItemTitle = (item: CartItem) => {
        if (item.type === 'domain') {
            return item.full_domain || item.domain;
        }
        // For hosting products, show product name with domain if available
        if (item.product && item.domain) {
            return `${item.product.name} - ${item.domain}`;
        }
        return item.product?.name || 'Product';
    };

    const getItemDescription = (item: CartItem) => {
        const parts = [];
        
        // For hosting products, years contains months
        if (item.type === 'shared-hosting' || item.type === 'vps' || item.type === 'dedicated-hosting') {
            const months = item.years;
            if (months === 1) {
                parts.push('1 Month');
            } else if (months < 12) {
                parts.push(`${months} Months`);
            } else if (months === 12) {
                parts.push('1 Year');
            } else if (months === 24) {
                parts.push('2 Years');
            } else if (months === 36) {
                parts.push('3 Years');
            } else {
                parts.push(`${months} Months`);
            }
            if (item.domain) {
                parts.push(`for ${item.domain}`);
            }
        } else if (item.years > 0) {
            // For domains
            parts.push(`${item.years} ${item.years === 1 ? 'year' : 'years'}`);
        }
        
        if (item.type === 'domain' && item.tld) {
            parts.push(item.tld.name);
        }
        
        if (item.product && item.type !== 'domain') {
            parts.push(item.product.type);
        }

        return parts.join(' • ');
    };

    const getItemOptions = (item: CartItem) => {
        const options = [];
        
        if (item.options?.privacy) {
            options.push('Privacy Protection');
        }
        if (item.options?.dns_management) {
            options.push('DNS Management');
        }
        if (item.options?.email_forwarding) {
            options.push('Email Forwarding');
        }
        if (item.options?.dnssec) {
            options.push('DNSSEC');
        }
        
        return options;
    };

    return (
        <PublicLayout title="Shopping Cart">
            <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
                <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                            Shopping Cart
                        </h1>
                        <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
                            {cart.items.length === 0 
                                ? 'Your cart is empty'
                                : `${cart.items.length} ${cart.items.length === 1 ? 'item' : 'items'} in your cart`
                            }
                        </p>
                    </div>

                    {cart.items.length === 0 ? (
                        /* Empty Cart State */
                        <Card className="text-center py-16">
                            <CardContent>
                                <ShoppingCart className="mx-auto h-16 w-16 text-gray-400" />
                                <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
                                    Your cart is empty
                                </h3>
                                <p className="mt-2 text-gray-600 dark:text-gray-400">
                                    Start shopping for domains and hosting services!
                                </p>
                                <div className="mt-6 flex justify-center gap-4">
                                    <Button onClick={() => router.get('/domains/results')}>
                                        <Globe className="mr-2 h-4 w-4" />
                                        Search Domains
                                    </Button>
                                    <Button variant="outline" onClick={() => router.get('/hosting')}>
                                        <Server className="mr-2 h-4 w-4" />
                                        Browse Hosting
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        /* Cart with Items */
                        <div className="grid gap-8 lg:grid-cols-3">
                            {/* Cart Items */}
                            <div className="lg:col-span-2 space-y-4">
                                {cart.items.map((item) => (
                                    <Card key={item.id}>
                                        <CardContent className="p-6">
                                            <div className="flex items-start gap-4">
                                                {/* Icon */}
                                                <div className="flex-shrink-0">
                                                    {getItemIcon(item.type)}
                                                </div>

                                                {/* Item Details */}
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                                                        {getItemTitle(item)}
                                                    </h3>
                                                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                                        {getItemDescription(item)}
                                                    </p>

                                                    {/* Item Options */}
                                                    {getItemOptions(item).length > 0 && (
                                                        <div className="mt-2 flex flex-wrap gap-2">
                                                            {getItemOptions(item).map((option) => (
                                                                <Badge key={option} variant="outline" className="text-xs">
                                                                    {option}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Price and Remove */}
                                                <div className="flex-shrink-0 text-right">
                                                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                                                        ${typeof item.total_price === 'number' ? item.total_price.toFixed(2) : Number(item.total_price || 0).toFixed(2)}
                                                    </div>
                                                    <div className="mt-1 text-sm text-gray-500">
                                                        ${typeof item.unit_price === 'number' ? item.unit_price.toFixed(2) : Number(item.unit_price || 0).toFixed(2)}/year
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="mt-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => handleRemoveItem(item.id)}
                                                        disabled={removingItem === item.id}
                                                    >
                                                        <Trash2 className="mr-1 h-4 w-4" />
                                                        {removingItem === item.id ? 'Removing...' : 'Remove'}
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}

                                {/* Clear Cart Button */}
                                <Button
                                    variant="outline"
                                    className="text-red-600 border-red-200 hover:bg-red-50"
                                    onClick={handleClearCart}
                                >
                                    <X className="mr-2 h-4 w-4" />
                                    Clear Cart
                                </Button>
                            </div>

                            {/* Order Summary */}
                            <div className="lg:col-span-1">
                                <Card className="sticky top-4">
                                    <CardHeader>
                                        <CardTitle>Order Summary</CardTitle>
                                    </CardHeader>
                                    
                                    <CardContent className="space-y-4">
                                        {/* Coupon Code */}
                                        <form onSubmit={handleApplyCoupon} className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Have a coupon?
                                            </label>
                                            <div className="flex gap-2">
                                                <Input
                                                    type="text"
                                                    placeholder="Coupon code"
                                                    value={couponCode}
                                                    onChange={(e) => setCouponCode(e.target.value)}
                                                    className="flex-1"
                                                />
                                                <Button type="submit" variant="outline" size="sm">
                                                    <Tag className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </form>

                                        {cart.coupon_code && (
                                            <div className="flex items-center justify-between rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
                                                <div className="flex items-center gap-2">
                                                    <Tag className="h-4 w-4 text-green-600" />
                                                    <span className="text-sm font-medium text-green-900 dark:text-green-300">
                                                        {cart.coupon_code}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Price Breakdown */}
                                        <div className="space-y-2 border-t pt-4">
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
                                    </CardContent>
                                    
                                    <CardFooter className="flex flex-col gap-2">
                                        <Button 
                                            className="w-full" 
                                            size="lg"
                                            onClick={handleCheckout}
                                        >
                                            Proceed to Checkout
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            className="w-full"
                                            onClick={() => router.get('/hosting')}
                                        >
                                            Continue Shopping
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </PublicLayout>
    );
}

