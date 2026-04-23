import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, Search, Trash2, RefreshCw } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin/tlds' },
    { title: 'Orders', href: '/admin/orders' },
];

interface Customer {
    id: number;
    name: string;
    email: string;
    company_name?: string;
}

interface Order {
    id: number;
    order_number: string;
    status: string;
    payment_status: string;
    payment_method: string;
    total_amount: string;
    currency: string;
    customer: Customer | null;
    items_count: number;
    processed_at: string | null;
    created_at: string;
}

interface Props {
    orders: {
        data: Order[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: {
        status?: string;
        payment_status?: string;
        search?: string;
    };
    statuses: Record<string, string>;
    paymentStatuses: Record<string, string>;
}

export default function OrdersIndex({ orders, filters, statuses, paymentStatuses }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [paymentStatus, setPaymentStatus] = useState(filters.payment_status || '');

    const handleFilter = () => {
        router.get('/admin/orders', {
            search,
            status,
            payment_status: paymentStatus,
        }, { preserveState: true });
    };

    const handleReset = () => {
        setSearch('');
        setStatus('');
        setPaymentStatus('');
        router.get('/admin/orders', {}, { preserveState: true });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this order?')) {
            router.delete(`/admin/orders/${id}`);
        }
    };

    const getStatusBadge = (status: string) => {
        const badges: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-800',
            processing: 'bg-blue-100 text-blue-800',
            completed: 'bg-green-100 text-green-800',
            cancelled: 'bg-gray-100 text-gray-800',
            failed: 'bg-red-100 text-red-800',
            refunded: 'bg-purple-100 text-purple-800',
        };
        return badges[status] || 'bg-gray-100 text-gray-800';
    };

    const getPaymentStatusBadge = (paymentStatus: string) => {
        const badges: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-800',
            paid: 'bg-green-100 text-green-800',
            failed: 'bg-red-100 text-red-800',
            refunded: 'bg-purple-100 text-purple-800',
            partially_refunded: 'bg-orange-100 text-orange-800',
        };
        return badges[paymentStatus] || 'bg-gray-100 text-gray-800';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Orders Management" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Orders Management</CardTitle>
                                <CardDescription>
                                    Manage all customer orders
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
                                    placeholder="Search orders..."
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
                            <Select value={paymentStatus || "all"} onValueChange={(value) => setPaymentStatus(value === "all" ? "" : value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter by payment status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Payment Statuses</SelectItem>
                                    {Object.entries(paymentStatuses).map(([value, label]) => (
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
                                        <th className="p-4 text-left text-sm font-medium text-muted-foreground">Order #</th>
                                        <th className="p-4 text-left text-sm font-medium text-muted-foreground">Customer</th>
                                        <th className="p-4 text-left text-sm font-medium text-muted-foreground">Items</th>
                                        <th className="p-4 text-left text-sm font-medium text-muted-foreground">Total</th>
                                        <th className="p-4 text-left text-sm font-medium text-muted-foreground">Status</th>
                                        <th className="p-4 text-left text-sm font-medium text-muted-foreground">Payment</th>
                                        <th className="p-4 text-left text-sm font-medium text-muted-foreground">Date</th>
                                        <th className="p-4 text-right text-sm font-medium text-muted-foreground">Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {orders.data.map((order) => (
                                        <tr key={order.id} className="border-b hover:bg-muted/50">
                                            <td className="p-4">
                                                <div className="font-medium">{order.order_number}</div>
                                                {order.payment_method && (
                                                    <div className="text-xs text-muted-foreground capitalize">
                                                        {order.payment_method}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                {order.customer ? (
                                                    <div>
                                                        <div className="font-medium">{order.customer.name}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {order.customer.email}
                                                        </div>
                                                        {order.customer.company_name && (
                                                            <div className="text-xs text-muted-foreground">
                                                                {order.customer.company_name}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">N/A</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-sm">
                                                {order.items_count} item{order.items_count !== 1 ? 's' : ''}
                                            </td>
                                            <td className="p-4">
                                                <div className="font-medium">
                                                    {order.currency} {parseFloat(order.total_amount).toFixed(2)}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(order.status)}`}>
                                                    {statuses[order.status]}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusBadge(order.payment_status)}`}>
                                                    {paymentStatuses[order.payment_status]}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm text-muted-foreground">
                                                {new Date(order.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex justify-end gap-2">
                                                    <Link href={`/admin/orders/${order.id}`}>
                                                        <Button variant="outline" size="sm">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    {['pending', 'failed'].includes(order.status) && (
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm"
                                                            onClick={() => handleDelete(order.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4 text-red-500" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        {orders.data.length === 0 && (
                            <div className="py-12 text-center text-muted-foreground">
                                No orders found.
                            </div>
                        )}

                        {/* Pagination info */}
                        {orders.total > 0 && (
                            <div className="mt-4 text-sm text-muted-foreground">
                                Showing {orders.data.length} of {orders.total} orders
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

