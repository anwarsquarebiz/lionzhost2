import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, Search, RefreshCw, Globe, Shield, AlertCircle } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin/tlds' },
    { title: 'Domain Orders', href: '/admin/domain-orders' },
];

interface Customer {
    id: number;
    name: string;
    email: string;
}

interface Tld {
    id: number;
    extension: string;
}

interface DomainOrder {
    id: number;
    domain: string;
    tld: Tld | null;
    full_domain: string;
    years: number;
    status: string;
    provider: string;
    privacy_protection: boolean;
    auto_renewal: boolean;
    registered_at: string | null;
    expires_at: string | null;
    is_expired: boolean;
    is_expiring_soon: boolean;
    customer: Customer | null;
    order_id: number;
    created_at: string;
}

interface Props {
    domainOrders: {
        data: DomainOrder[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: {
        status?: string;
        search?: string;
        provider?: string;
    };
    statuses: Record<string, string>;
    providers: Record<string, string>;
}

export default function DomainOrders({ domainOrders, filters, statuses, providers }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [provider, setProvider] = useState(filters.provider || '');

    const handleFilter = () => {
        router.get('/admin/domain-orders', {
            search,
            status,
            provider,
        }, { preserveState: true });
    };

    const handleReset = () => {
        setSearch('');
        setStatus('');
        setProvider('');
        router.get('/admin/domain-orders', {}, { preserveState: true });
    };

    const getStatusBadge = (status: string) => {
        const badges: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-800',
            processing: 'bg-blue-100 text-blue-800',
            active: 'bg-green-100 text-green-800',
            expired: 'bg-orange-100 text-orange-800',
            cancelled: 'bg-gray-100 text-gray-800',
            failed: 'bg-red-100 text-red-800',
        };
        return badges[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Domain Orders" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Domain Orders</CardTitle>
                                <CardDescription>
                                    Manage all domain registrations and renewals
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
                                    placeholder="Search domains..."
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
                                        <th className="p-4 text-left text-sm font-medium text-muted-foreground">Years</th>
                                        <th className="p-4 text-left text-sm font-medium text-muted-foreground">Status</th>
                                        <th className="p-4 text-left text-sm font-medium text-muted-foreground">Provider</th>
                                        <th className="p-4 text-left text-sm font-medium text-muted-foreground">Expires</th>
                                        <th className="p-4 text-left text-sm font-medium text-muted-foreground">Features</th>
                                        <th className="p-4 text-right text-sm font-medium text-muted-foreground">Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {domainOrders.data.map((domain) => (
                                        <tr key={domain.id} className="border-b hover:bg-muted/50">
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <Globe className="h-4 w-4 text-blue-600" />
                                                    <div>
                                                        <div className="font-medium">{domain.full_domain}</div>
                                                        {domain.is_expiring_soon && !domain.is_expired && (
                                                            <div className="flex items-center gap-1 text-xs text-orange-600">
                                                                <AlertCircle className="h-3 w-3" />
                                                                Expiring soon
                                                            </div>
                                                        )}
                                                        {domain.is_expired && (
                                                            <div className="flex items-center gap-1 text-xs text-red-600">
                                                                <AlertCircle className="h-3 w-3" />
                                                                Expired
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                {domain.customer ? (
                                                    <div>
                                                        <div className="font-medium text-sm">{domain.customer.name}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {domain.customer.email}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">N/A</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-sm">
                                                {domain.years} year{domain.years !== 1 ? 's' : ''}
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(domain.status)}`}>
                                                    {statuses[domain.status]}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm capitalize">
                                                {providers[domain.provider] || domain.provider}
                                            </td>
                                            <td className="p-4 text-sm text-muted-foreground">
                                                {domain.expires_at ? new Date(domain.expires_at).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex gap-1">
                                                    {domain.privacy_protection && (
                                                        <Shield className="h-4 w-4 text-green-600" title="Privacy Protection" />
                                                    )}
                                                    {domain.auto_renewal && (
                                                        <RefreshCw className="h-4 w-4 text-blue-600" title="Auto Renewal" />
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex justify-end gap-2">
                                                    <Link href={`/admin/domain-orders/${domain.id}`}>
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
                        
                        {domainOrders.data.length === 0 && (
                            <div className="py-12 text-center text-muted-foreground">
                                No domain orders found.
                            </div>
                        )}

                        {/* Pagination info */}
                        {domainOrders.total > 0 && (
                            <div className="mt-4 text-sm text-muted-foreground">
                                Showing {domainOrders.data.length} of {domainOrders.total} domain orders
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

