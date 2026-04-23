import PublicLayout from '@/layouts/public-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Server, Shield, Lock, Globe, CheckCircle } from 'lucide-react';
import { useState } from 'react';

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

export default function PublicSSL({ products }: Props) {
    const [selectedBillingPeriod, setSelectedBillingPeriod] = useState<number>(12);

    // Get unique billing periods from all products
    const billingPeriods = Array.from(
        new Set(
            products.flatMap(p => 
                p.plans.map(plan => plan.package_months)
            )
        )
    ).sort((a, b) => a - b);

    const getDisplayName = (months: number) => {
        if (months === 1) return '1 Year';
        return `${months} Years`;
    };

    const getPlanForProduct = (product: Product) => {
        return product.plans.find(plan => plan.package_months === selectedBillingPeriod);
    };

    return (
        <PublicLayout title="SSL Certificates - Secure Your Website">
            {/* Hero Section */}
            <div className="bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800">
                <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl dark:text-white">
                            SSL Certificates
                        </h1>
                        <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                            Protect your website and build trust with your visitors. Industry-standard SSL certificates with 256-bit encryption.
                        </p>
                    </div>

                    {/* Features Grid */}
                    <div className="mt-16 grid gap-8 md:grid-cols-4">
                        <div className="text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                                <Lock className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="mt-4 text-lg font-semibold">256-bit Encryption</h3>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                Industry-standard encryption
                            </p>
                        </div>
                        
                        <div className="text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                                <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="mt-4 text-lg font-semibold">Trusted Seal</h3>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                Build visitor confidence
                            </p>
                        </div>
                        
                        <div className="text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="mt-4 text-lg font-semibold">Easy Installation</h3>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                Simple setup process
                            </p>
                        </div>
                        
                        <div className="text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                                <Globe className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="mt-4 text-lg font-semibold">SEO Boost</h3>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                Improve search rankings
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
                            Choose Your SSL Certificate
                        </h2>
                        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                            Protection for every need and budget
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
                            const plan = getPlanForProduct(product);
                            
                            if (!plan) return null;

                            return (
                                <Card key={product.id} className="flex flex-col border-green-200">
                                    <CardHeader>
                                        <CardTitle className="text-xl">{product.name}</CardTitle>
                                        <CardDescription>{product.description}</CardDescription>
                                    </CardHeader>
                                    
                                    <CardContent className="flex-1">
                                        {/* Pricing */}
                                        <div className="mb-6 text-center">
                                            <div className="text-4xl font-bold text-green-600">
                                                ${plan.price_per_month}
                                                <span className="text-lg font-normal text-gray-600">/year</span>
                                            </div>
                                            {plan.setup_fee > 0 && (
                                                <div className="mt-1 text-sm text-gray-500">
                                                    + ${plan.setup_fee} setup fee
                                                </div>
                                            )}
                                        </div>

                                        {/* Features */}
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
                                            <ul className="space-y-3">
                                                <li className="flex items-start gap-2">
                                                    <Check className="h-5 w-5 flex-shrink-0 text-gray-400" />
                                                    <span className="text-sm">256-bit encryption</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <Check className="h-5 w-5 flex-shrink-0 text-gray-400" />
                                                    <span className="text-sm">Trust seal included</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <Check className="h-5 w-5 flex-shrink-0 text-gray-400" />
                                                    <span className="text-sm">Browser compatibility</span>
                                                </li>
                                            </ul>
                                        )}
                                    </CardContent>
                                    
                                    <CardFooter>
                                        <Button className="w-full bg-green-600 hover:bg-green-700" size="lg">
                                            Purchase SSL
                                        </Button>
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>

                    {products.length === 0 && (
                        <div className="text-center py-12">
                            <Shield className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                                No SSL certificates available
                            </h3>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                Please check back later for available SSL certificate options.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Why SSL Section */}
            <div className="bg-gray-50 dark:bg-gray-900 py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <h2 className="mb-12 text-center text-3xl font-bold text-gray-900 dark:text-white">
                        Why Do You Need SSL?
                    </h2>
                    <div className="grid gap-8 md:grid-cols-3">
                        <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                            <Lock className="h-10 w-10 text-green-600" />
                            <h3 className="mt-4 text-xl font-semibold">Data Protection</h3>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">
                                Encrypt sensitive information like passwords, credit cards, and personal data transmitted between your server and visitors.
                            </p>
                        </div>
                        
                        <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                            <Shield className="h-10 w-10 text-green-600" />
                            <h3 className="mt-4 text-xl font-semibold">Build Trust</h3>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">
                                Display the padlock icon and HTTPS in your URL to show visitors that your site is secure and legitimate.
                            </p>
                        </div>
                        
                        <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                            <Globe className="h-10 w-10 text-green-600" />
                            <h3 className="mt-4 text-xl font-semibold">Better Rankings</h3>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">
                                Google gives ranking preference to HTTPS websites, helping you improve your search engine visibility.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}

