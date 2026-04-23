import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Domain Search',
        href: '/domains/search',
    },
];

interface Tld {
    id: number;
    extension: string;
    name: string;
    is_active: boolean;
}

interface DomainSearchProps {
    popularTlds: Tld[];
}

export default function DomainSearch({ popularTlds }: DomainSearchProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [searching, setSearching] = useState(false);
    const [results, setResults] = useState<any[]>([]);
    const [selectedTlds, setSelectedTlds] = useState<string[]>([]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!searchTerm.trim()) {
            return;
        }

        setSearching(true);

        try {
            // If specific TLDs selected, use those; otherwise search all active TLDs
            const tldsToSearch = selectedTlds.length > 0 
                ? selectedTlds 
                : undefined; // Let backend use all active TLDs

            const response = await axios.post('/domains/search', {
                domain: searchTerm,
                tlds: tldsToSearch,
            });

            setResults(response.data.results || []);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setSearching(false);
        }
    };

    const toggleTld = (extension: string) => {
        setSelectedTlds(prev => 
            prev.includes(extension)
                ? prev.filter(t => t !== extension)
                : [...prev, extension]
        );
    };

    const addToCart = async (result: any, years: number = 1) => {
        try {
            const tld = popularTlds.find(t => t.extension === result.tld);
            
            const response = await axios.post('/cart/add', {
                domain: result.domain,
                tld_id: tld?.id,
                years: years,
                options: {
                    privacy: false,
                    dns_management: true,
                    email_forwarding: false,
                    dnssec: false,
                },
            });
            
            if (response.data.success) {
                toast.success('Domain added to cart!');
            }
        } catch (error) {
            console.error('Add to cart failed:', error);
            toast.error('Failed to add domain to cart');
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Domain Search" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Search for Your Perfect Domain</CardTitle>
                        <CardDescription>
                            Find and register your ideal domain name
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <Input
                                type="text"
                                placeholder="Enter domain name (e.g., example)"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="flex-1"
                            />
                            <Button type="submit" disabled={searching}>
                                <Search className="mr-2 h-4 w-4" />
                                {searching ? 'Searching...' : 'Search'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {results.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Search Results</CardTitle>
                            <CardDescription>
                                {results.filter(r => r.available).length} available domain(s)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {results.map((result, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between rounded-lg border p-4"
                                    >
                                        <div>
                                            <p className="font-medium">{result.full_domain}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {result.available ? (
                                                    <span className="text-green-600">Available</span>
                                                ) : (
                                                    <span className="text-red-600">
                                                        {result.error || 'Not available'}
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {result.available && (
                                                <>
                                                    <div className="text-right">
                                                        <p className="font-semibold">
                                                            ${result.price}/{result.currency}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            per year
                                                        </p>
                                                    </div>
                                                    <Button
                                                        onClick={() => addToCart(result)}
                                                        size="sm"
                                                    >
                                                        Add to Cart
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {popularTlds.length > 0 && results.length === 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Popular TLDs</CardTitle>
                            <CardDescription>
                                Select specific TLDs to search, or leave all unchecked to search all active TLDs
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4">
                                <p className="text-sm text-muted-foreground mb-2">
                                    {selectedTlds.length > 0 
                                        ? `${selectedTlds.length} TLD(s) selected` 
                                        : 'All active TLDs will be searched'}
                                </p>
                            </div>
                            <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                                {popularTlds.map((tld) => (
                                    <div
                                        key={tld.id}
                                        onClick={() => toggleTld(tld.extension)}
                                        className={`cursor-pointer rounded-lg border p-3 text-center transition-colors ${
                                            selectedTlds.includes(tld.extension)
                                                ? 'border-primary bg-primary/10'
                                                : 'hover:border-primary/50'
                                        }`}
                                    >
                                        <p className="font-medium">.{tld.extension}</p>
                                        <p className="text-xs text-muted-foreground">{tld.name}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
