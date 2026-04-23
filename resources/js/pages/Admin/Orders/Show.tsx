import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Package, Globe, Server, Calendar, CreditCard, User } from 'lucide-react';

interface Customer {
    id: number;
    name: string;
    email: string;
    company_name?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
}

interface OrderItem {
    id: number;
    description: string;
    quantity: number;
    unit_price: string;
    total_price: string;
    product: {
        id: number;
        name: string;
        product_type: string;
    } | null;
}

interface DomainOrder {
    id: number;
    domain: string;
    tld: string;
    full_domain: string;
    years: number;
    status: string;
    registered_at: string | null;
    expires_at: string | null;
}

interface HostingOrder {
    id: number;
    domain: string;
    package_name: string;
    status: string;
    product: {
        id: number;
        name: string;
    } | null;
    activated_at: string | null;
    expires_at: string | null;
}

interface Order {
    id: number;
    order_number: string;
    status: string;
    payment_status: string;
    payment_method: string;
    total_amount: string;
    currency: string;
    notes: string | null;
    customer: Customer | null;
    items: OrderItem[];
    domain_orders: DomainOrder[];
    hosting_orders: HostingOrder[];
    processed_at: string | null;
    created_at: string;
    updated_at: string;
}

interface Props {
    order: Order;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin/tlds' },
    { title: 'Orders', href: '/admin/orders' },
    { title: 'Order Details', href: '#' },
];

export default function OrderShow({ order }: Props) {
    const { data, setData, put, processing } = useForm({
        status: order.status,
        payment_status: order.payment_status,
        notes: order.notes || '',
    });

    const handleUpdateStatus = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/orders/${order.id}`, {
            preserveScroll: true,
        });
    };

    const getStatusBadge = (status: string) => {
        const badges: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-800',
            processing: 'bg-blue-100 text-blue-800',
            active: 'bg-green-100 text-green-800',
            completed: 'bg-green-100 text-green-800',
            cancelled: 'bg-gray-100 text-gray-800',
            failed: 'bg-red-100 text-red-800',
            expired: 'bg-orange-100 text-orange-800',
            suspended: 'bg-red-100 text-red-800',
            refunded: 'bg-purple-100 text-purple-800',
        };
        return badges[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Order ${order.order_number}`} />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/orders">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">Order #{order.order_number}</h1>
                            <p className="text-sm text-muted-foreground">
                                Created on {new Date(order.created_at).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Main Content */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Order Items */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="h-5 w-5" />
                                    Order Items
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {order.items.map((item) => (
                                        <div key={item.id} className="flex justify-between border-b pb-4 last:border-0 last:pb-0">
                                            <div>
                                                <div className="font-medium">{item.description}</div>
                                                {item.product && (
                                                    <div className="text-sm text-muted-foreground">
                                                        {item.product.name} ({item.product.product_type})
                                                    </div>
                                                )}
                                                <div className="text-sm text-muted-foreground">
                                                    Quantity: {item.quantity}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-medium">
                                                    {order.currency} {parseFloat(item.total_price).toFixed(2)}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    @ {order.currency} {parseFloat(item.unit_price).toFixed(2)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="flex justify-between border-t pt-4 font-bold">
                                        <div>Total</div>
                                        <div>{order.currency} {parseFloat(order.total_amount).toFixed(2)}</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Domain Orders */}
                        {order.domain_orders.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Globe className="h-5 w-5" />
                                        Domain Orders
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {order.domain_orders.map((domain) => (
                                            <div key={domain.id} className="flex justify-between items-center border-b pb-4 last:border-0 last:pb-0">
                                                <div>
                                                    <div className="font-medium">{domain.full_domain}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {domain.years} year{domain.years !== 1 ? 's' : ''}
                                                    </div>
                                                    {domain.expires_at && (
                                                        <div className="text-sm text-muted-foreground">
                                                            Expires: {new Date(domain.expires_at).toLocaleDateString()}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-right space-y-2">
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(domain.status)}`}>
                                                        {domain.status}
                                                    </span>
                                                    <div>
                                                        <Link href={`/admin/domain-orders/${domain.id}`}>
                                                            <Button variant="outline" size="sm">
                                                                View Details
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Hosting Orders */}
                        {order.hosting_orders.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Server className="h-5 w-5" />
                                        Hosting Orders
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {order.hosting_orders.map((hosting) => (
                                            <div key={hosting.id} className="flex justify-between items-center border-b pb-4 last:border-0 last:pb-0">
                                                <div>
                                                    <div className="font-medium">{hosting.domain}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {hosting.package_name}
                                                    </div>
                                                    {hosting.product && (
                                                        <div className="text-sm text-muted-foreground">
                                                            {hosting.product.name}
                                                        </div>
                                                    )}
                                                    {hosting.expires_at && (
                                                        <div className="text-sm text-muted-foreground">
                                                            Expires: {new Date(hosting.expires_at).toLocaleDateString()}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-right space-y-2">
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(hosting.status)}`}>
                                                        {hosting.status}
                                                    </span>
                                                    <div>
                                                        <Link href={`/admin/hosting-orders/${hosting.id}`}>
                                                            <Button variant="outline" size="sm">
                                                                View Details
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Order Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Order Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleUpdateStatus} className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Status</label>
                                        <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="processing">Processing</SelectItem>
                                                <SelectItem value="completed">Completed</SelectItem>
                                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                                <SelectItem value="failed">Failed</SelectItem>
                                                <SelectItem value="refunded">Refunded</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Payment Status</label>
                                        <Select value={data.payment_status} onValueChange={(value) => setData('payment_status', value)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="paid">Paid</SelectItem>
                                                <SelectItem value="failed">Failed</SelectItem>
                                                <SelectItem value="refunded">Refunded</SelectItem>
                                                <SelectItem value="partially_refunded">Partially Refunded</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Notes</label>
                                        <Textarea
                                            value={data.notes}
                                            onChange={(e) => setData('notes', e.target.value)}
                                            rows={4}
                                            placeholder="Add notes..."
                                        />
                                    </div>

                                    <Button type="submit" className="w-full" disabled={processing}>
                                        Update Order
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Payment Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5" />
                                    Payment
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Method:</span>
                                    <span className="font-medium capitalize">{order.payment_method || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Status:</span>
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(order.payment_status)}`}>
                                        {order.payment_status}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm pt-2 border-t">
                                    <span className="text-muted-foreground">Total Amount:</span>
                                    <span className="font-bold">{order.currency} {parseFloat(order.total_amount).toFixed(2)}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Customer Information */}
                        {order.customer && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Customer
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 text-sm">
                                    <div>
                                        <div className="font-medium">{order.customer.name}</div>
                                        <div className="text-muted-foreground">{order.customer.email}</div>
                                    </div>
                                    {order.customer.company_name && (
                                        <div className="text-muted-foreground">
                                            {order.customer.company_name}
                                        </div>
                                    )}
                                    {order.customer.phone && (
                                        <div className="text-muted-foreground">
                                            {order.customer.phone}
                                        </div>
                                    )}
                                    {order.customer.address && (
                                        <div className="pt-2 border-t text-muted-foreground">
                                            <div>{order.customer.address}</div>
                                            <div>
                                                {[order.customer.city, order.customer.state, order.customer.postal_code]
                                                    .filter(Boolean)
                                                    .join(', ')}
                                            </div>
                                            {order.customer.country && <div>{order.customer.country}</div>}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Timeline */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Timeline
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Created:</span>
                                    <span>{new Date(order.created_at).toLocaleString()}</span>
                                </div>
                                {order.processed_at && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Processed:</span>
                                        <span>{new Date(order.processed_at).toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Updated:</span>
                                    <span>{new Date(order.updated_at).toLocaleString()}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}




