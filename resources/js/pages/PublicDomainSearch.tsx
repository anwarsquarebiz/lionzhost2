import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { router } from '@inertiajs/react';
import { Search, Shield, Zap, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import PublicLayout from '@/layouts/public-layout';

interface Tld {
    id: number;
    extension: string;
    name: string;
    price: number;
    is_promotional: boolean;
}

interface Props {
    popularTlds: Tld[];
}

export default function PublicDomainSearch({ popularTlds }: Props) {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!searchTerm.trim()) {
            return;
        }

        router.get('/domains/results', { domain: searchTerm });
    };

    return (
        <PublicLayout title="Find Your Perfect Domain Name">
            {/* Hero Section */}
            <div className="bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">

                {/* Hero Content */}
                <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl dark:text-white">
                            Search for a domain name
                        </h1>
                        <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                            Discover, buy and register your unique domain with our domain name search
                        </p>

                        {/* Search Bar */}
                        <div className="mx-auto mt-10 max-w-3xl">
                            <form onSubmit={handleSearch} className="flex gap-2">
                                <Input
                                    type="text"
                                    placeholder="Enter domain name (e.g., mybusiness)"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="h-14 text-lg"
                                />
                                <Button type="submit" size="lg" className="h-14 px-8">
                                    <Search className="mr-2 h-5 w-5" />
                                    Search
                                </Button>
                            </form>
                        </div>
                    </div>

                    {/* Popular TLDs */}
                    <div className="mt-16">
                        <h2 className="mb-8 text-center text-2xl font-bold text-gray-900 dark:text-white">
                            Choose from the most popular domains
                        </h2>
                        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
                            {popularTlds.map((tld) => (
                                <Card key={tld.id} className="overflow-hidden transition-shadow hover:shadow-lg">
                                    <CardContent className="p-6">
                                        <div className="mb-4">
                                            <div className="text-3xl font-bold text-blue-600">.{tld.extension}</div>
                                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                                {tld.name}
                                            </p>
                                        </div>
                                        <div className="mb-4">
                                            <div className="text-2xl font-bold">
                                                ${tld.price}
                                                <span className="text-sm font-normal text-gray-600">/year</span>
                                            </div>
                                            {tld.is_promotional && (
                                                <span className="mt-1 inline-block rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
                                                    Special Offer
                                                </span>
                                            )}
                                        </div>
                                        <Button 
                                            className="w-full" 
                                            variant="outline"
                                            onClick={() => {
                                                setSearchTerm('yourdomain');
                                                router.get('/domains/results', { domain: 'yourdomain' });
                                            }}
                                        >
                                            Register
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Features Section */}
                    <div className="mt-24">
                        <h2 className="mb-12 text-center text-3xl font-bold text-gray-900 dark:text-white">
                            Why buy domain names at Lionzhost?
                        </h2>
                        <div className="grid gap-8 md:grid-cols-3">
                            <div className="text-center">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                                    <Zap className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h3 className="mt-6 text-xl font-semibold">Quick setup, easy management</h3>
                                <p className="mt-2 text-gray-600 dark:text-gray-400">
                                    Register your domain in just a few clicks – no technical skills needed
                                </p>
                            </div>
                            
                            <div className="text-center">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                                    <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h3 className="mt-6 text-xl font-semibold">Free privacy protection</h3>
                                <p className="mt-2 text-gray-600 dark:text-gray-400">
                                    Keep your personal information hidden from public databases
                                </p>
                            </div>
                            
                            <div className="text-center">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                                    <CheckCircle className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h3 className="mt-6 text-xl font-semibold">24/7 support</h3>
                                <p className="mt-2 text-gray-600 dark:text-gray-400">
                                    Need help? Reach out to our Customer Success team anytime
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Tips Section */}
                    <div className="mt-24 rounded-2xl bg-white p-8 shadow-lg dark:bg-gray-800">
                        <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
                            6 things to remember before you buy domains
                        </h2>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            <div>
                                <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">Keep it short</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Long website names are hard to read and remember – try to keep it under three words
                                </p>
                            </div>
                            <div>
                                <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">Less is more</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Keep it simple – avoid hyphens, numbers, slang, and easily misspelled words
                                </p>
                            </div>
                            <div>
                                <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">Include your brand name</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Try to include your brand name or target keywords for your niche
                                </p>
                            </div>
                            <div>
                                <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">Check availability</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Do a search to see if a name is available – then make sure it hasn't been trademarked
                                </p>
                            </div>
                            <div>
                                <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">Think locally</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    .com TLDs can often be unavailable. Consider country-specific extensions
                                </p>
                            </div>
                            <div>
                                <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">Act fast</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    The best website names are quickly taken. Don't miss out – register today
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </PublicLayout>
    );
}



