import PublicLayout, { useCart } from '@/layouts/public-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Check, Server, Zap, Shield, Globe, Cpu, HardDrive, Network } from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { router } from '@inertiajs/react';

interface Plan {
    id: number;
    resellerclub_plan_id: string;
    plan_type: string;
    package_months: number;
    price_per_month: number;
    setup_fee: number;
    is_active: boolean;
    total_price: number;
    billing_period_display: string;
}

interface Feature {
    id: number;
    product_id: number;
    feature: string;
    sort_order: number;
    is_highlighted: boolean;
    icon: string | null;
}

interface Product {
    id: number;
    name: string;
    location: string | null;
    product_type: string;
    description: string | null;
    currency: string;
    resellerclub_key: string;
    is_active: boolean;
    plans: Plan[];
    features: Feature[];
}

interface Props {
    products: Product[];
}

export default function PublicVPS({ products }: Props) {
    const [selectedBillingPeriod, setSelectedBillingPeriod] = useState<number>(12);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
    const [domain, setDomain] = useState('');
    const [addingToCart, setAddingToCart] = useState(false);
    const { incrementCart } = useCart();

    // Get unique billing periods from all products (only from 'add' plans)
    const billingPeriods = Array.from(
        new Set(
            products.flatMap(p => 
                p.plans
                    .filter(plan => plan.plan_type === 'add')
                    .map(plan => plan.package_months)
            )
        )
    ).sort((a, b) => a - b);

    const getDisplayName = (months: number) => {
        if (months === 1) return '1 Month';
        if (months === 12) return '1 Year';
        if (months === 24) return '2 Years';
        if (months === 36) return '3 Years';
        if (months % 12 === 0) return `${months / 12} Years`;
        return `${months} Months`;
    };

    const getPlanForProduct = (product: Product, planType: 'add' | 'renew') => {
        return product.plans.find(
            plan => plan.package_months === selectedBillingPeriod && plan.plan_type === planType
        );
    };

    const getLocationIcon = (location: string | null) => {
        if (!location) return <Globe className="h-4 w-4" />;
        if (location.toLowerCase().includes('india')) return '🇮🇳';
        if (location.toLowerCase().includes('united states') || location.toLowerCase().includes('us')) return '🇺🇸';
        return <Globe className="h-4 w-4" />;
    };

    const handleAddToCart = (product: Product, plan: Plan) => {
        setSelectedProduct(product);
        setSelectedPlan(plan);
        setDomain('');
        setDialogOpen(true);
    };

    const handleConfirmAddToCart = async () => {
        if (!selectedProduct || !selectedPlan || !domain.trim()) {
            toast.error('Please enter a domain name');
            return;
        }

        setAddingToCart(true);
        try {
            const response = await axios.post('/cart/add', {
                product_id: selectedProduct.id,
                plan_id: selectedPlan.id,
                domain: domain.trim(),
            });

            if (response.data.success) {
                incrementCart();
                toast.success('VPS plan added to cart!');
                setDialogOpen(false);
                setDomain('');
                setSelectedProduct(null);
                setSelectedPlan(null);
                // Optionally redirect to cart
                // router.get('/cart');
            } else {
                toast.error(response.data.message || 'Failed to add VPS to cart');
            }
        } catch (error: any) {
            console.error('Add to cart failed:', error);
            const errorMessage = error.response?.data?.message || 'Failed to add VPS to cart';
            toast.error(errorMessage);
        } finally {
            setAddingToCart(false);
        }
    };

    return (
        <PublicLayout title="VPS Hosting - Powerful & Scalable Virtual Servers">
            {/* Hero Section */}
            <div className="bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800">
                <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl dark:text-white">
                            VPS Hosting Plans
                        </h1>
                        <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                            Powerful virtual private servers with full root access. Perfect for developers, agencies, and growing businesses.
                        </p>
                    </div>

                    {/* Features Grid */}
                    <div className="mt-16 grid gap-8 md:grid-cols-4">
                        <div className="text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                                <Cpu className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h3 className="mt-4 text-lg font-semibold">Dedicated Resources</h3>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                Guaranteed CPU, RAM, and storage
                            </p>
                        </div>
                        
                        <div className="text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                                <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h3 className="mt-4 text-lg font-semibold">Full Root Access</h3>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                Complete control over your server
                            </p>
                        </div>
                        
                        <div className="text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                                <Zap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h3 className="mt-4 text-lg font-semibold">SSD Storage</h3>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                Lightning-fast NVMe SSD drives
                            </p>
                        </div>
                        
                        <div className="text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                                <Network className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h3 className="mt-4 text-lg font-semibold">High Bandwidth</h3>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                Unlimited bandwidth on all plans
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pricing Section */}
            <div className="bg-white dark:bg-gray-800 py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-12 text-center">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Choose Your VPS Configuration
                        </h2>
                        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                            Scalable resources for your growing needs
                        </p>
                    </div>

                    {/* Billing Period Selector */}
                    {billingPeriods.length > 0 && (
                        <div className="mb-8 flex flex-wrap justify-center gap-2">
                            {billingPeriods.map((months) => (
                                <Button
                                    key={months}
                                    variant={selectedBillingPeriod === months ? 'default' : 'outline'}
                                    onClick={() => setSelectedBillingPeriod(months)}
                                    size="sm"
                                >
                                    {getDisplayName(months)}
                                </Button>
                            ))}
                        </div>
                    )}

                    {/* Products Grid */}
                    <div className="grid gap-8 lg:grid-cols-3 md:grid-cols-2">
                        {products.map((product) => {
                            const addPlan = getPlanForProduct(product, 'add');
                            const renewPlan = getPlanForProduct(product, 'renew');
                            
                            if (!addPlan) return null;

                            return (
                                <Card key={product.id} className="flex flex-col border-purple-200">
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-xl">{product.name}</CardTitle>
                                            {product.location && (
                                                <Badge variant="outline" className="flex items-center gap-1 bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800">
                                                    {getLocationIcon(product.location)}
                                                    <span className="ml-1 text-xs">{product.location}</span>
                                                </Badge>
                                            )}
                                        </div>
                                        <CardDescription>{product.description}</CardDescription>
                                    </CardHeader>
                                    
                                    <CardContent className="flex-1">
                                        {/* Pricing */}
                                        <div className="mb-6 text-center">
                                            <div className="text-4xl font-bold text-purple-600">
                                                ${addPlan.price_per_month}
                                                <span className="text-lg font-normal text-gray-600">/month</span>
                                            </div>
                                            <div className="mt-2 text-sm text-gray-500">
                                                ${addPlan.total_price.toFixed(2)} total for {getDisplayName(selectedBillingPeriod)}
                                            </div>
                                            {renewPlan && (
                                                <div className="mt-1 text-xs text-gray-400">
                                                    Renews at ${renewPlan.price_per_month}/month
                                                </div>
                                            )}
                                            {addPlan.setup_fee > 0 && (
                                                <div className="mt-1 text-sm text-gray-500">
                                                    + ${addPlan.setup_fee} setup fee
                                                </div>
                                            )}
                                        </div>

                                        {/* Features/Specs */}
                                        {product.features.length > 0 ? (
                                            <ul className="space-y-3">
                                                {product.features.map((feature) => (
                                                    <li key={feature.id} className="flex items-start gap-2">
                                                        <Check className={`h-5 w-5 flex-shrink-0 ${feature.is_highlighted ? 'text-green-500' : 'text-gray-400'}`} />
                                                        <span className={`text-sm ${feature.is_highlighted ? 'font-semibold' : ''}`}>
                                                            {feature.feature}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    <Cpu className="h-4 w-4" />
                                                    <span>Specifications to be added</span>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                    
                                    <CardFooter>
                                        <Button 
                                            className="w-full bg-purple-600 hover:bg-purple-700" 
                                            size="lg"
                                            onClick={() => handleAddToCart(product, addPlan)}
                                        >
                                            Add to Cart
                                        </Button>
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>

                    {products.length === 0 && (
                        <div className="text-center py-12">
                            <Server className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                                No VPS plans available
                            </h3>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                Please check back later for available VPS hosting plans.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Why Choose VPS Section */}
            <div className="bg-gray-50 dark:bg-gray-900 py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <h2 className="mb-12 text-center text-3xl font-bold text-gray-900 dark:text-white">
                        Why Choose VPS Hosting?
                    </h2>
                    <div className="grid gap-8 md:grid-cols-3">
                        <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                            <Server className="h-10 w-10 text-purple-600" />
                            <h3 className="mt-4 text-xl font-semibold">Dedicated Resources</h3>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">
                                Get guaranteed CPU, RAM, and storage resources that aren't shared with other users.
                            </p>
                        </div>
                        
                        <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                            <Zap className="h-10 w-10 text-purple-600" />
                            <h3 className="mt-4 text-xl font-semibold">Scalable Performance</h3>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">
                                Easily upgrade your resources as your application grows without any downtime.
                            </p>
                        </div>
                        
                        <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                            <Shield className="h-10 w-10 text-purple-600" />
                            <h3 className="mt-4 text-xl font-semibold">Enhanced Security</h3>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">
                                Isolated environment with full control over security configurations and firewall rules.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add to Cart Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add VPS to Cart</DialogTitle>
                        <DialogDescription>
                            {selectedProduct && selectedPlan && (
                                <>
                                    Enter the domain name for <strong>{selectedProduct.name}</strong> VPS plan 
                                    ({getDisplayName(selectedPlan.package_months)} - ${selectedPlan.total_price.toFixed(2)})
                                </>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Input
                            type="text"
                            placeholder="example.com"
                            value={domain}
                            onChange={(e) => setDomain(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !addingToCart) {
                                    handleConfirmAddToCart();
                                }
                            }}
                            disabled={addingToCart}
                            autoFocus
                        />
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            Enter the domain name you want to use for this VPS plan.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setDialogOpen(false);
                                setDomain('');
                            }}
                            disabled={addingToCart}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirmAddToCart}
                            disabled={addingToCart || !domain.trim()}
                            className="bg-purple-600 hover:bg-purple-700"
                        >
                            {addingToCart ? 'Adding...' : 'Add to Cart'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </PublicLayout>
    );
}

