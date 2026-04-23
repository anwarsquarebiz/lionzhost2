import PublicLayout, { useCart } from '@/layouts/public-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { router } from '@inertiajs/react';
import { Search, ShoppingCart, Check, X, Globe, Zap, Shield, Clock } from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

interface DomainResult {
    domain: string;
    tld: string;
    tld_id: number;
    full_domain: string;
    available: boolean;
    price: number;
    currency: string;
    tld_name: string;
    is_exact_match?: boolean;
}

interface Tld {
    id: number;
    extension: string;
    name: string;
    price?: number;
    is_promotional?: boolean;
}

interface Props {
    searchTerm: string;
    results: DomainResult[];
    popularTlds: Tld[];
    allTlds: Tld[];
}

export default function DomainSearchResults({ searchTerm, results, popularTlds, allTlds }: Props) {
    const [newSearchTerm, setNewSearchTerm] = useState(searchTerm);
    const [addingToCart, setAddingToCart] = useState<number | null>(null);
    const { incrementCart } = useCart();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (newSearchTerm.trim()) {
            router.get('/domains/results', { domain: newSearchTerm });
        }
    };

    const addToCart = async (result: DomainResult) => {
        setAddingToCart(result.tld_id);
        
        try {
            const response = await axios.post('/cart/add', {
                domain: result.domain,
                tld_id: result.tld_id,
                years: 1,
                options: {
                    privacy: true,
                    dns_management: true,
                    email_forwarding: false,
                    dnssec: false,
                },
            });
            
            if (response.data.success) {
                incrementCart(); // Update cart count immediately
                toast.success('Domain added to cart! Continue shopping or proceed to checkout.');
                router.get('/cart');
            } else {
                // Handle error response                
                toast.error(response.data.message || 'Failed to add domain to cart');
            }
        } catch (error: any) {
            console.error('Add to cart failed:', error);
            
            // Check if it's a validation error with a message
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else if (error.response?.status === 401) {
                toast.error('Please login to add domains to cart');
                router.visit('/login');
            } else {
                toast.error('Failed to add domain to cart. Please try again.');
            }
        } finally {
            setAddingToCart(null);
        }
    };

    // Separate available and unavailable domains
    const availableDomains = results.filter(r => r.available);
    const unavailableDomains = results.filter(r => !r.available);

    return (
        <PublicLayout title="Domain Search - Find Your Perfect Domain">
            {/* Hero Section */}
            <div className="bg-gradient-to-b from-green-50 to-white">
                <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                            {searchTerm ? `Results for "${searchTerm}"` : 'Find Your Perfect Domain'}
                        </h1>
                        <p className="mt-6 text-lg leading-8 text-gray-600">
                            {searchTerm 
                                ? 'Check availability and register your domain today'
                                : 'Search for your ideal domain name and register it instantly'
                            }
                        </p>

                        {/* Search Bar */}
                        <div className="mx-auto mt-10 max-w-3xl">
                            <form onSubmit={handleSearch} className="flex gap-2">
                                <Input
                                    type="text"
                                    placeholder="Enter domain name (e.g., mybusiness)"
                                    value={newSearchTerm}
                                    onChange={(e) => setNewSearchTerm(e.target.value)}
                                    className="h-14 text-lg text-black"
                                />
                                <Button type="submit" size="lg" className="h-14 px-8">
                                    <Search className="mr-2 h-5 w-5" />
                                    Search
                                </Button>
                            </form>
                        </div>
                    </div>

                    {/* Features Grid - Show when no search */}
                    {!searchTerm && (
                        <div className="mt-16 grid gap-8 md:grid-cols-4">
                            <div className="text-center">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                                    <Zap className="h-6 w-6 text-green-600" />
                                </div>
                                <h3 className="mt-4 text-black text-lg font-semibold">Instant Activation</h3>
                                <p className="mt-2 text-sm text-gray-600">
                                    Register and activate domains instantly
                                </p>
                            </div>
                            
                            <div className="text-center">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                                    <Shield className="h-6 w-6 text-green-600" />
                                </div>
                                <h3 className="mt-4 text-black text-lg font-semibold">Free Privacy Protection</h3>
                                <p className="mt-2 text-sm text-gray-600">
                                    Keep your personal information private
                                </p>
                            </div>
                            
                            <div className="text-center">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                                    <Clock className="h-6 w-6 text-green-600" />
                                </div>
                                <h3 className="mt-4 text-black text-lg font-semibold">Easy Management</h3>
                                <p className="mt-2 text-sm text-gray-600">
                                    Simple control panel for all domains
                                </p>
                            </div>
                            
                            <div className="text-center">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                                    <Globe className="h-6 w-6 text-green-600" />
                                </div>
                                <h3 className="mt-4 text-black text-lg font-semibold">100+ TLDs Available</h3>
                                <p className="mt-2 text-sm text-gray-600">
                                    Choose from a wide range of extensions
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Results or Popular TLDs Section */}
            <div className="bg-white py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {searchTerm && results.length > 0 ? (
                        <>
                            {/* Available Domains */}
                            {availableDomains.length > 0 && (
                                <div className="mb-12">
                                    <h2 className="mb-8 text-3xl font-bold text-gray-900">
                                        Available Domains ({availableDomains.length})
                                    </h2>
                                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                        {availableDomains.map((result) => (
                                            <Card 
                                                key={result.full_domain} 
                                                className={`flex flex-col ${
                                                    result.is_exact_match 
                                                        ? 'border-green-500 ring-2 ring-green-500 shadow-lg' 
                                                        : 'border-green-200'
                                                } bg-white`}
                                            >
                                                <CardHeader>
                                                    <div className="flex items-start justify-between">
                                                        <CardTitle className="text-xl break-all text-black">{result.full_domain}</CardTitle>
                                                        {result.is_exact_match && (
                                                            <Badge variant="outline" className="ml-2 shrink-0 bg-green-50 text-green-700 border-green-200">
                                                                Match
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center text-sm text-green-600">
                                                        <Check className="mr-1 h-4 w-4" />
                                                        Available
                                                    </div>
                                                </CardHeader>
                                                
                                                <CardContent className="flex-1">
                                                    <div className="text-center">
                                                        <div className="text-3xl font-bold text-green-600">
                                                            ${typeof result.price === 'number' ? result.price.toFixed(2) : Number(result.price || 0).toFixed(2)}
                                                            <span className="text-lg font-normal text-gray-600">/year</span>
                                                        </div>
                                                        <div className="mt-1 text-xs text-gray-500">
                                                            {result.tld_name}
                                                        </div>
                                                    </div>
                                                </CardContent>
                                                
                                                <CardFooter>
                                                    <Button 
                                                        className="w-full bg-green-600 hover:bg-green-700 text-white" 
                                                        onClick={() => addToCart(result)}
                                                        disabled={addingToCart === result.tld_id}
                                                        size="lg"
                                                    >
                                                        {addingToCart === result.tld_id ? (
                                                            'Adding...'
                                                        ) : (
                                                            <>
                                                                <ShoppingCart className="mr-2 h-4 w-4 " />
                                                                Add to Cart
                                                            </>
                                                        )}
                                                    </Button>
                                                </CardFooter>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Unavailable Domains */}
                            {unavailableDomains.length > 0 && (
                                <div>
                                    <h2 className="mb-8 text-3xl font-bold text-gray-900">
                                        Unavailable Domains
                                    </h2>
                                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                        {unavailableDomains.slice(0, 6).map((result) => (
                                            <Card 
                                                key={result.full_domain} 
                                                className={`opacity-60 ${
                                                    result.is_exact_match 
                                                        ? 'border-red-500 ring-2 ring-red-500' 
                                                        : ''
                                                }`}
                                            >
                                                <CardHeader>
                                                    <div className="flex items-start justify-between">
                                                        <CardTitle className="text-xl break-all">{result.full_domain}</CardTitle>
                                                        {result.is_exact_match && (
                                                            <Badge variant="outline" className="ml-2 shrink-0 bg-red-50 text-red-700 border-red-200">
                                                                Match
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center text-sm text-red-600">
                                                        <X className="mr-1 h-4 w-4" />
                                                        Not Available
                                                    </div>
                                                </CardHeader>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        /* Popular TLDs when no search or no results */
                        <>
                            <div className="mb-12 text-center">
                                <h2 className="text-3xl font-bold text-gray-900">
                                    {searchTerm ? 'No results found. Try these popular domains:' : 'Popular Domain Extensions'}
                                </h2>
                                <p className="mt-4 text-lg text-gray-600">
                                    Choose from our most popular domain extensions
                                </p>
                            </div>
                            
                            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
                                {popularTlds.map((tld) => (
                                    <Card key={tld.id} className="overflow-hidden transition-shadow hover:shadow-lg border-green-200 bg-white">
                                        <CardContent className="p-6">
                                            <div className="mb-4">
                                                <div className="text-3xl font-bold text-green-600">.{tld.extension}</div>
                                                <p className="mt-1 text-sm text-gray-600">
                                                    {tld.name}
                                                </p>
                                            </div>
                                            <div className="mb-4">
                                                <div className="text-2xl font-bold text-black">
                                                    ${typeof tld.price === 'number' ? tld.price.toFixed(2) : Number(tld.price || 0).toFixed(2)}
                                                    <span className="text-sm font-normal text-gray-600">/year</span>
                                                </div>
                                                {tld.is_promotional && (
                                                    <span className="mt-1 inline-block rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
                                                        Special Offer
                                                    </span>
                                                )}
                                            </div>
                                            <Button 
                                                className="w-full bg-green-600 hover:bg-green-700 text-white" 
                                                variant="default"
                                                onClick={() => {
                                                    setNewSearchTerm('yourdomain');
                                                    router.get('/domains/results', { domain: 'yourdomain' });
                                                }}
                                            >
                                                Search
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Why Choose Us Section */}
            <div className="bg-gray-50 py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
                        Why Register Your Domain With Us?
                    </h2>
                    <div className="grid gap-8 md:grid-cols-3">
                        <div className="rounded-lg bg-white p-6 shadow-sm">
                            <Shield className="h-10 w-10 text-green-600" />
                            <h3 className="mt-4 text-black text-xl font-semibold">Free Privacy Protection</h3>
                            <p className="mt-2 text-gray-600">
                                Keep your personal information safe with complimentary WHOIS privacy protection.
                            </p>
                        </div>
                        
                        <div className="rounded-lg bg-white p-6 shadow-sm">
                            <Zap className="h-10 w-10 text-green-600" />
                            <h3 className="mt-4 text-black text-xl font-semibold">Instant Activation</h3>
                            <p className="mt-2 text-gray-600">
                                Your domain is registered and ready to use immediately after purchase.
                            </p>
                        </div>
                        
                        <div className="rounded-lg bg-white p-6 shadow-sm">
                            <Globe className="h-10 w-10 text-green-600" />
                            <h3 className="mt-4 text-black text-xl font-semibold">Easy DNS Management</h3>
                            <p className="mt-2 text-gray-600">
                                Powerful yet simple tools to manage your domain's DNS settings and records.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
