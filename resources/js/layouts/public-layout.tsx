import { Head, Link, usePage } from '@inertiajs/react';
import { login, register, logout, dashboard } from '@/routes';
import { ShoppingCart, Menu, X, Facebook, Instagram, Youtube, LayoutDashboard, LogOut } from 'lucide-react';
import { ReactNode, useState, createContext, useContext } from 'react';
import type { SharedData } from '@/types';

// Create cart context locally
interface CartContextType {
    cartCount: number;
    updateCartCount: (count: number) => void;
    incrementCart: () => void;
    decrementCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function useCart() {
    const context = useContext(CartContext);
    // Return default values if not within provider (for pages not using PublicLayout)
    if (context === undefined) {
        return {
            cartCount: 0,
            updateCartCount: () => {},
            incrementCart: () => {},
            decrementCart: () => {},
        };
    }
    return context;
}

interface PublicLayoutProps {
    children: ReactNode;
    title?: string;
}

export default function PublicLayout({ children, title = "LionzHost" }: PublicLayoutProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const pageProps = usePage<SharedData>().props;
    const { auth, url } = pageProps;
    const initialCartCount = (pageProps as any).cartCount || 0;
    const [cartCount, setCartCount] = useState(initialCartCount);
    const currentUrl = (url as string) || '';
    
    // Cart management functions
    const updateCartCount = (count: number) => setCartCount(count);
    const incrementCart = () => setCartCount(prev => prev + 1);
    const decrementCart = () => setCartCount(prev => Math.max(0, prev - 1));
    
    const cartContextValue = {
        cartCount,
        updateCartCount,
        incrementCart,
        decrementCart,
    };
    
    // Helper function to check if link is active
    const isActive = (path: string) => {
        if (!currentUrl) return false;
        return currentUrl === path || currentUrl.startsWith(path + '?');
    };

    return (
        <CartContext.Provider value={cartContextValue}>
            <Head title={title}>
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700"
                    rel="stylesheet"
                />
            </Head>
            
            <div className="min-h-screen bg-white">
                {/* Navigation */}
                <nav className="bg-white shadow-sm border-b border-gray-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            {/* Logo */}
                            <Link href="/" className="flex items-center gap-2">
                                <img 
                                    src="/images/logo_big.png" 
                                    alt="LionzHost" 
                                    className="h-8 w-auto"
                                />
                                <span className="text-xl font-bold text-[#0c112a]">LionzHost</span>
                            </Link>

                            {/* Desktop Navigation Links */}
                            <div className="hidden md:flex items-center space-x-4">
                                <Link 
                                    href="/" 
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                        isActive('/') 
                                            ? 'text-gray-900 bg-gray-100 dark:text-white dark:bg-gray-800' 
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                                >
                                    Home
                                </Link>
                                <Link 
                                    href="/domains/results" 
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                        isActive('/domains/results') 
                                            ? 'text-gray-900 bg-gray-100 dark:text-white dark:bg-gray-800' 
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                                >
                                    Domain Search
                                </Link>
                                <Link 
                                    href="/hosting" 
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                        isActive('/hosting') 
                                            ? 'text-gray-900 bg-gray-100 dark:text-white dark:bg-gray-800' 
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                                >
                                    Shared Hosting
                                </Link>
                                <Link 
                                    href="/vps" 
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                        isActive('/vps') 
                                            ? 'text-gray-900 bg-gray-100 dark:text-white dark:bg-gray-800' 
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                                >
                                    VPS
                                </Link>
                                <Link 
                                    href="/dedicated" 
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                        isActive('/dedicated') 
                                            ? 'text-gray-900 bg-gray-100 dark:text-white dark:bg-gray-800' 
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                                >
                                    Dedicated
                                </Link>
                                <Link 
                                    href="/ssl" 
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                        isActive('/ssl') 
                                            ? 'text-gray-900 bg-gray-100 dark:text-white dark:bg-gray-800' 
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                                >
                                    SSL Certificates
                                </Link>
                            </div>

                            {/* Desktop Auth & Cart */}
                            <div className="hidden md:flex items-center space-x-4">
                                {auth.user ? (
                                    <>
                                        <Link
                                            href={dashboard()}
                                            className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2"
                                        >
                                            <LayoutDashboard className="h-4 w-4" />
                                            Dashboard
                                        </Link>
                                        <Link
                                            href={logout()}
                                            method="post"
                                            as="button"
                                            className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            Logout
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            href={login()}
                                            className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                                        >
                                            Log in
                                        </Link>
                                        <Link
                                            href={register()}
                                            className="bg-[#6eda78] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#5bc66a] transition-colors"
                                        >
                                            Get Started
                                        </Link>
                                    </>
                                )}
                                <Link 
                                    href="/cart" 
                                    className={`relative px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                        isActive('/cart') 
                                            ? 'text-gray-900 bg-gray-100 dark:text-white dark:bg-gray-800' 
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                                >
                                    <ShoppingCart className="h-5 w-5" />
                                    {cartCount > 0 && (
                                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                                            {cartCount > 9 ? '9+' : cartCount}
                                        </span>
                                    )}
                                </Link>
                            </div>

                            {/* Mobile menu button */}
                            <div className="md:hidden flex items-center space-x-2">
                                <Link href="/cart" className="relative text-gray-600 hover:text-gray-900 p-2">
                                    <ShoppingCart className="h-5 w-5" />
                                    {cartCount > 0 && (
                                        <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                                            {cartCount > 9 ? '9+' : cartCount}
                                        </span>
                                    )}
                                </Link>
                                <button
                                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                    className="text-gray-600 hover:text-gray-900 p-2"
                                >
                                    {mobileMenuOpen ? (
                                        <X className="h-6 w-6" />
                                    ) : (
                                        <Menu className="h-6 w-6" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Mobile Navigation Menu */}
                        {mobileMenuOpen && (
                            <div className="md:hidden">
                                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
                                    <Link 
                                        href="/" 
                                        className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                                            isActive('/') 
                                                ? 'text-gray-900 bg-gray-100' 
                                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Home
                                    </Link>
                                    <Link 
                                        href="/domains/results" 
                                        className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                                            isActive('/domains/results') 
                                                ? 'text-gray-900 bg-gray-100' 
                                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Domain Search
                                    </Link>
                                    <Link 
                                        href="/hosting" 
                                        className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                                            isActive('/hosting') 
                                                ? 'text-gray-900 bg-gray-100' 
                                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Shared Hosting
                                    </Link>
                                    <Link 
                                        href="/vps" 
                                        className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                                            isActive('/vps') 
                                                ? 'text-gray-900 bg-gray-100' 
                                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        VPS
                                    </Link>
                                    <Link 
                                        href="/dedicated" 
                                        className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                                            isActive('/dedicated') 
                                                ? 'text-gray-900 bg-gray-100' 
                                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Dedicated
                                    </Link>
                                    <Link 
                                        href="/ssl" 
                                        className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                                            isActive('/ssl') 
                                                ? 'text-gray-900 bg-gray-100' 
                                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        SSL Certificates
                                    </Link>
                                    
                                    {/* Mobile Auth Links */}
                                    <div className="pt-4 border-t border-gray-200">
                                        {auth.user ? (
                                            <>
                                                <Link
                                                    href={dashboard()}
                                                    className="block text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium flex items-center gap-2"
                                                    onClick={() => setMobileMenuOpen(false)}
                                                >
                                                    <LayoutDashboard className="h-4 w-4" />
                                                    Dashboard
                                                </Link>
                                                <Link
                                                    href={logout()}
                                                    method="post"
                                                    as="button"
                                                    className="w-full text-left block text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium flex items-center gap-2 mt-2"
                                                    onClick={() => setMobileMenuOpen(false)}
                                                >
                                                    <LogOut className="h-4 w-4" />
                                                    Logout
                                                </Link>
                                            </>
                                        ) : (
                                            <>
                                                <Link
                                                    href={login()}
                                                    className="block text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium"
                                                    onClick={() => setMobileMenuOpen(false)}
                                                >
                                                    Log in
                                                </Link>
                                                <Link
                                                    href={register()}
                                                    className="block bg-[#6eda78] text-white px-3 py-2 rounded-md text-base font-medium hover:bg-[#5bc66a] transition-colors mt-2"
                                                    onClick={() => setMobileMenuOpen(false)}
                                                >
                                                    Get Started
                                                </Link>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </nav>

                {/* Main Content */}
                <main>
                    {children}
                </main>

                {/* Footer */}
                <footer className="bg-gray-900 text-white py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid md:grid-cols-4 gap-8">
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <img 
                                        src="/images/logo_big.png" 
                                        alt="LionzHost" 
                                        className="h-8 w-auto"
                                    />
                                    <span className="text-xl font-bold">LionzHost</span>
                                </div>
                                <p className="text-gray-400 mb-4">
                                    Your trusted destination for securing the perfect domain name, providing seamless registration services and expert support.
                                </p>
                                <div className="flex space-x-4">
                                    {/* Social Media Links */}

                                    {/* Facebook */}
                                    <a href="https://www.facebook.com/people/LionzHost/61558643663692/" className="text-gray-400 hover:text-white">
                                        <Facebook className="w-6 h-6" />
                                    </a>
                                    {/* X */}
                                    <a href="https://twitter.com/lionzhost" className="text-gray-400 hover:text-white">
                                        <X className="w-6 h-6" />
                                    </a>
                                    
                                    {/* Instagram */}
                                    <a href="https://www.instagram.com/lionzhost/" className="text-gray-400 hover:text-white">
                                        <Instagram className="w-6 h-6" />
                                    </a>

                                    {/* Youtube */}
                                    <a href="https://www.youtube.com/channel/UC5uxvSWIcYy9u6FLmQxi2AA" className="text-gray-400 hover:text-white">
                                        <Youtube className="w-6 h-6" />
                                    </a>
                                </div>
                            </div>
                            
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Hosting</h3>
                                <ul className="space-y-2">
                                    <li><a href="/hosting" className="text-gray-400 hover:text-white">Shared Hosting</a></li>
                                    <li><a href="/vps" className="text-gray-400 hover:text-white">VPS Hosting</a></li>
                                    <li><a href="/dedicated" className="text-gray-400 hover:text-white">Dedicated Servers</a></li>
                                </ul>
                            </div>
                            
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Support</h3>
                                <ul className="space-y-2">
                                    <li><Link href="/help" className="text-gray-400 hover:text-white">Help Center</Link></li>
                                    <li><Link href="/contact" className="text-gray-400 hover:text-white">Contact Us</Link></li>
                                </ul>
                            </div>
                            
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Company</h3>
                                <ul className="space-y-2">
                                    <li><Link href="/about" className="text-gray-400 hover:text-white">About Us</Link></li>
                                    <li><Link href="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</Link></li>
                                    <li><Link href="/terms" className="text-gray-400 hover:text-white">Terms of Service</Link></li>
                                </ul>
                            </div>
                        </div>
                        
                        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
                            <p className="text-gray-400">
                                © 2024 LionzHost. All rights reserved.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </CartContext.Provider>
    );
}
