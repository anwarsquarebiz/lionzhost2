import { Link, router, usePage } from '@inertiajs/react';
import { register } from '@/routes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useState } from 'react';
import PublicLayout from '@/layouts/public-layout';

interface Tld {
    id: number;
    extension: string;
    name: string;
    price: number;
}

interface LandingProps {
    popularTlds?: Tld[];
}

export default function Landing({ popularTlds = [] }: LandingProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const cart = usePage().props.cart;

    const handleDomainSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            router.get('/domains/results', { domain: searchTerm });
        }
    };
    return (
        <PublicLayout title="LionzHost - Premium Web Hosting Solutions">

                {/* Hero Section */}
                <section className="bg-gradient-to-br from-[#0c112a] to-[#1a1f3a] text-white py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h1 className="text-4xl md:text-6xl font-bold mb-6">
                                Premium Web Hosting
                                <span className="block text-[#6eda78]">Made Simple</span>
                            </h1>
                            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
                                Get lightning-fast hosting with 99.9% uptime, free SSL certificates, 
                                and 24/7 expert support. Start your website today!
                            </p>

                            {/* Domain Search Bar */}
                            <div className="mx-auto mb-8 max-w-3xl">
                                <form onSubmit={handleDomainSearch} className="flex gap-2">
                                    <Input
                                        type="text"
                                        placeholder="Find your perfect domain name..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="h-14 bg-white text-gray-900 text-lg placeholder:text-gray-500"
                                    />
                                    <Button disabled={!searchTerm.trim()} type="submit" size="lg" className="h-14 bg-[#6eda78] px-8 hover:bg-[#5bc66a]">
                                        <Search className="mr-2 h-5 w-5" />
                                        Search
                                    </Button>
                                </form>
                                
                                {/* Popular TLDs */}
                                {popularTlds.length > 0 && (
                                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                                        {popularTlds.slice(0, 6).map((tld) => (
                                            <button
                                                key={tld.id}
                                                onClick={() => {
                                                    setSearchTerm('yourdomain');
                                                    router.get('/domains/results', { domain: 'yourdomain' });
                                                }}
                                                className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm backdrop-blur-sm transition-colors hover:bg-white/20"
                                            >
                                                .{tld.extension} - ${tld.price}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>                            
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-20 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                Why Choose LionzHost?
                            </h2>
                            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
                                We provide everything you need to build and grow your online presence
                            </p>
                        </div>
                        
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                                <div className="w-12 h-12 bg-[#6eda78] rounded-lg flex items-center justify-center mb-6">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">Lightning Fast</h3>
                                <p className="text-gray-700">
                                    Our SSD-powered servers deliver blazing fast loading times for your website visitors.
                                </p>
                            </div>
                            
                            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                                <div className="w-12 h-12 bg-[#6eda78] rounded-lg flex items-center justify-center mb-6">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">99.9% Uptime</h3>
                                <p className="text-gray-700">
                                    Guaranteed reliability with our enterprise-grade infrastructure and monitoring.
                                </p>
                            </div>
                            
                            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                                <div className="w-12 h-12 bg-[#6eda78] rounded-lg flex items-center justify-center mb-6">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">Free SSL</h3>
                                <p className="text-gray-700">
                                    Secure your website with free SSL certificates included with every hosting plan.
                                </p>
                            </div>
                            
                            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                                <div className="w-12 h-12 bg-[#6eda78] rounded-lg flex items-center justify-center mb-6">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">24/7 Support</h3>
                                <p className="text-gray-700">
                                    Our expert support team is available around the clock to help you succeed.
                                </p>
                            </div>
                            
                            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                                <div className="w-12 h-12 bg-[#6eda78] rounded-lg flex items-center justify-center mb-6">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">Easy Migration</h3>
                                <p className="text-gray-700">
                                    We'll help you migrate your existing website to our platform for free.
                                </p>
                            </div>
                            
                            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                                <div className="w-12 h-12 bg-[#6eda78] rounded-lg flex items-center justify-center mb-6">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">Analytics</h3>
                                <p className="text-gray-700">
                                    Track your website performance with detailed analytics and insights.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Pricing Section */}
                <section className="py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                Choose Your Perfect Plan
                            </h2>
                            <p className="text-xl text-gray-700">
                                Flexible pricing options to fit your needs
                            </p>
                        </div>
                        
                        <div className="grid md:grid-cols-3 gap-8">
                            {/* Starter Plan */}
                            <div className="bg-white border border-gray-200 rounded-xl p-8">
                                <div className="text-center">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Starter</h3>
                                    <div className="mb-6">
                                        <span className="text-4xl font-bold text-gray-900">$2.99</span>
                                        <span className="text-gray-700">/month</span>
                                    </div>
                                    <ul className="space-y-3 mb-8">
                                        <li className="flex items-center text-[#0c112a]">
                                            <svg className="w-5 h-5 text-[#0c112a] mr-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            1 Website
                                        </li>
                                        <li className="flex items-center text-[#0c112a]">
                                            <svg className="w-5 h-5 text-[#0c112a] mr-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            10GB SSD Storage
                                        </li>
                                        <li className="flex items-center text-[#0c112a]">
                                            <svg className="w-5 h-5 text-[#0c112a] mr-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            Free SSL Certificate
                                        </li>
                                        <li className="flex items-center text-[#0c112a]">
                                            <svg className="w-5 h-5 text-[#0c112a] mr-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            Email Support
                                        </li>
                                    </ul>
                                    <Link
                                        href={register()}
                                        className="w-full bg-gray-900 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                                    >
                                        Get Started
                                    </Link>
                                </div>
                            </div>

                            {/* Professional Plan */}
                            <div className="bg-white border-2 border-[#6eda78] rounded-xl p-8 relative">
                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                    <span className="bg-[#6eda78] text-white px-4 py-1 rounded-full text-sm font-semibold">
                                        Most Popular
                                    </span>
                                </div>
                                <div className="text-center">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Professional</h3>
                                    <div className="mb-6">
                                        <span className="text-4xl font-bold text-gray-900">$5.99</span>
                                        <span className="text-gray-700">/month</span>
                                    </div>
                                    <ul className="space-y-3 mb-8">
                                        <li className="flex items-center text-[#0c112a]">
                                            <svg className="w-5 h-5 text-[#0c112a] mr-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            Unlimited Websites
                                        </li>
                                        <li className="flex items-center text-[#0c112a]">
                                            <svg className="w-5 h-5 text-[#0c112a] mr-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            50GB SSD Storage
                                        </li>
                                        <li className="flex items-center text-[#0c112a]">
                                            <svg className="w-5 h-5 text-[#0c112a] mr-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            Free SSL Certificate
                                        </li>
                                        <li className="flex items-center text-[#0c112a]">
                                            <svg className="w-5 h-5 text-[#0c112a] mr-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            24/7 Priority Support
                                        </li>
                                        <li className="flex items-center text-[#0c112a]">
                                            <svg className="w-5 h-5 text-[#0c112a] mr-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            Free Domain
                                        </li>
                                    </ul>
                                    <Link
                                        href={register()}
                                        className="w-full bg-[#6eda78] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#5bc66a] transition-colors"
                                    >
                                        Get Started
                                    </Link>
                                </div>
                            </div>

                            {/* Business Plan */}
                            <div className="bg-white border border-gray-200 rounded-xl p-8">
                                <div className="text-center">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Business</h3>
                                    <div className="mb-6">
                                        <span className="text-4xl font-bold text-gray-900">$9.99</span>
                                        <span className="text-gray-700">/month</span>
                                    </div>
                                    <ul className="space-y-3 mb-8">
                                        <li className="flex items-center text-[#0c112a]">
                                            <svg className="w-5 h-5 text-[#0c112a] mr-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            Unlimited Websites
                                        </li>
                                        <li className="flex items-center text-[#0c112a]">
                                            <svg className="w-5 h-5 text-[#0c112a] mr-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            100GB SSD Storage
                                        </li>
                                        <li className="flex items-center text-[#0c112a]">
                                            <svg className="w-5 h-5 text-[#0c112a] mr-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            Free SSL Certificate
                                        </li>
                                        <li className="flex items-center text-[#0c112a]">
                                            <svg className="w-5 h-5 text-[#0c112a] mr-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            24/7 Phone Support
                                        </li>
                                        <li className="flex items-center text-[#0c112a]">
                                            <svg className="w-5 h-5 text-[#0c112a] mr-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            Free Domain + CDN
                                        </li>
                                    </ul>
                                    <Link
                                        href={register()}
                                        className="w-full bg-gray-900 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                                    >
                                        Get Started
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Testimonials Section */}
                <section className="py-20 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                What Our Customers Say
                            </h2>
                            <p className="text-xl text-gray-700">
                                Join thousands of satisfied customers
                            </p>
                        </div>
                        
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="bg-white p-8 rounded-xl shadow-sm">
                                <div className="flex items-center mb-4">
                                    <div className="flex text-yellow-400">
                                        {[...Array(5)].map((_, i) => (
                                            <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        ))}
                                    </div>
                                </div>
                                <p className="text-gray-700 mb-4">
                                    "LionzHost has been amazing for our business. The uptime is incredible and the support team is always helpful."
                                </p>
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-[#6eda78] rounded-full flex items-center justify-center text-white font-semibold">
                                        JS
                                    </div>
                                    <div className="ml-3">
                                        <p className="font-semibold text-gray-900">John Smith</p>
                                        <p className="text-gray-700 text-sm">CEO, TechCorp</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white p-8 rounded-xl shadow-sm">
                                <div className="flex items-center mb-4">
                                    <div className="flex text-yellow-400">
                                        {[...Array(5)].map((_, i) => (
                                            <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        ))}
                                    </div>
                                </div>
                                <p className="text-gray-700 mb-4">
                                    "The migration process was seamless and the performance improvement was immediate. Highly recommended!"
                                </p>
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-[#6eda78] rounded-full flex items-center justify-center text-white font-semibold">
                                        MJ
                                    </div>
                                    <div className="ml-3">
                                        <p className="font-semibold text-gray-900">Maria Johnson</p>
                                        <p className="text-gray-700 text-sm">Web Developer</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white p-8 rounded-xl shadow-sm">
                                <div className="flex items-center mb-4">
                                    <div className="flex text-yellow-400">
                                        {[...Array(5)].map((_, i) => (
                                            <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        ))}
                                    </div>
                                </div>
                                <p className="text-gray-700 mb-4">
                                    "Best hosting service I've used. Fast, reliable, and the customer support is outstanding."
                                </p>
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-[#6eda78] rounded-full flex items-center justify-center text-white font-semibold">
                                        DW
                                    </div>
                                    <div className="ml-3">
                                        <p className="font-semibold text-gray-900">David Wilson</p>
                                        <p className="text-gray-700 text-sm">E-commerce Owner</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 bg-[#0c112a] text-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">
                            Ready to Get Started?
                        </h2>
                        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                            Join thousands of satisfied customers and start building your online presence today.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href={register()}
                                className="bg-[#6eda78] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#5bc66a] transition-colors"
                            >
                                Start Your Website Now
                            </Link>
                            <button className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-[#0c112a] transition-colors">
                                Contact Sales
                            </button>
                        </div>
                    </div>
                </section>

        </PublicLayout>
    );
}
