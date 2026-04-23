import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, Search, RefreshCw, Server, AlertCircle, Ban } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin/tlds' },
    { title: 'Hosting Orders', href: '/admin/hosting-orders' },
];

interface Customer {
    id: number;
    name: string;
    email: string;
}

interface Product {
    id: number;
    name: string;
    product_type: string;
}

interface HostingOrder {
    id: number;
    domain: string;
    package_name: string;
    status: string;
    provider: string;
    billing_cycle: string;
    price: string;
    currency: string;
    auto_renewal: boolean;
    activated_at: string | null;
    expires_at: string | null;
    is_active: boolean;
    is_expired: boolean;
    is_expiring_soon: boolean;
    is_suspended: boolean;
    product: Product | null;
    customer: Customer | null;
    order_id: number;
    created_at: string;
}

interface Props {
    hostingOrders: {
        data: HostingOrder[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: {
        status?: string;
        search?: string;
        provider?: string;
        product_id?: string;
    };
    statuses: Record<string, string>;
    providers: Record<string, string>;
}

export default function HostingOrders({ hostingOrders, filters, statuses, providers }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [provider, setProvider] = useState(filters.provider || '');

    const handleFilter = () => {
        router.get('/admin/hosting-orders', {
            search,
            status,
            provider,
        }, { preserveState: true });
    };

    const handleReset = () => {
        setSearch('');
        setStatus('');
        setProvider('');
        router.get('/admin/hosting-orders', {}, { preserveState: true });
    };

    const getStatusBadge = (status: string) => {
        const badges: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-800',
            processing: 'bg-blue-100 text-blue-800',
            active: 'bg-green-100 text-green-800',
            suspended: 'bg-red-100 text-red-800',
            cancelled: 'bg-gray-100 text-gray-800',
            expired: 'bg-orange-100 text-orange-800',
            failed: 'bg-red-100 text-red-800',
        };
        return badges[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Hosting Orders" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Hosting Orders</CardTitle>
                                <CardDescription>
                                    Manage all hosting services and packages
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* Filters */}
                        <div className="mb-6 grid gap-4 md:grid-cols-4">
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search hosting..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                                    className="pl-8"
                                />
                            </div>
                            <Select value={status || "all"} onValueChange={(value) => setStatus(value === "all" ? "" : value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    {Object.entries(statuses).map(([value, label]) => (
                                        <SelectItem key={value} value={value}>
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={provider || "all"} onValueChange={(value) => setProvider(value === "all" ? "" : value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter by provider" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Providers</SelectItem>
                                    {Object.entries(providers).map(([value, label]) => (
                                        <SelectItem key={value} value={value}>
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <div className="flex gap-2">
                                <Button onClick={handleFilter} className="flex-1">
                                    <Search className="mr-2 h-4 w-4" />
                                    Filter
                                </Button>
                                <Button onClick={handleReset} variant="outline">
                                    <RefreshCw className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="p-4 text-left text-sm font-medium text-muted-foreground">Domain</th>
                                        <th className="p-4 text-left text-sm font-medium text-muted-foreground">Customer</th>
                                        <th className="p-4 text-left text-sm font-medium text-muted-foreground">Package</th>
                                        <th className="p-4 text-left text-sm font-medium text-muted-foreground">Status</th>
                                        <th className="p-4 text-left text-sm font-medium text-muted-foreground">Provider</th>
                                        <th className="p-4 text-left text-sm font-medium text-muted-foreground">Billing</th>
                                        <th className="p-4 text-left text-sm font-medium text-muted-foreground">Price</th>
                                        <th className="p-4 text-left text-sm font-medium text-muted-foreground">Expires</th>
                                        <th className="p-4 text-right text-sm font-medium text-muted-foreground">Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {hostingOrders.data.map((hosting) => (
                                        <tr key={hosting.id} className="border-b hover:bg-muted/50">
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <Server className="h-4 w-4 text-purple-600" />
                                                    <div>
                                                        <div className="font-medium">{hosting.domain}</div>
                                                        {hosting.is_expiring_soon && !hosting.is_expired && (
                                                            <div className="flex items-center gap-1 text-xs text-orange-600">
                                                                <AlertCircle className="h-3 w-3" />
                                                                Expiring soon
                                                            </div>
                                                        )}
                                                        {hosting.is_expired && (
                                                            <div className="flex items-center gap-1 text-xs text-red-600">
                                                                <AlertCircle className="h-3 w-3" />
                                                                Expired
                                                            </div>
                                                        )}
                                                        {hosting.is_suspended && (
                                                            <div className="flex items-center gap-1 text-xs text-red-600">
                                                                <Ban className="h-3 w-3" />
                                                                Suspended
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                {hosting.customer ? (
                                                    <div>
                                                        <div className="font-medium text-sm">{hosting.customer.name}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {hosting.customer.email}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">N/A</span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <div>
                                                    <div className="font-medium text-sm">{hosting.package_name}</div>
                                                    {hosting.product && (
                                                        <div className="text-xs text-muted-foreground">
                                                            {hosting.product.name}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(hosting.status)}`}>
                                                    {statuses[hosting.status]}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm capitalize">
                                                {providers[hosting.provider] || hosting.provider}
                                            </td>
                                            <td className="p-4 text-sm capitalize">
                                                {hosting.billing_cycle}
                                            </td>
                                            <td className="p-4">
                                                <div className="font-medium text-sm">
                                                    {hosting.currency} {parseFloat(hosting.price).toFixed(2)}
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm text-muted-foreground">
                                                {hosting.expires_at ? new Date(hosting.expires_at).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex justify-end gap-2">
                                                    <Link href={`/admin/hosting-orders/${hosting.id}`}>
                                                        <Button variant="outline" size="sm">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        {hostingOrders.data.length === 0 && (
                            <div className="py-12 text-center text-muted-foreground">
                                No hosting orders found.
                            </div>
                        )}

                        {/* Pagination info */}
                        {hostingOrders.total > 0 && (
                            <div className="mt-4 text-sm text-muted-foreground">
                                Showing {hostingOrders.data.length} of {hostingOrders.total} hosting orders
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

