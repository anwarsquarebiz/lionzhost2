import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Server, Calendar, User, CreditCard, AlertCircle, Play, Pause, Ban } from 'lucide-react';

interface Customer {
    id: number;
    name: string;
    email: string;
    company_name?: string;
    phone?: string;
}

interface Product {
    id: number;
    name: string;
    product_type: string;
    location: string;
}

interface Order {
    id: number;
    order_number: string;
    status: string;
    total_amount: string;
    currency: string;
    payment_status: string;
}

interface HostingOrder {
    id: number;
    domain: string;
    package_name: string;
    status: string;
    provider: string;
    provider_order_id: string | null;
    billing_cycle: string;
    price: string;
    currency: string;
    features: Record<string, any> | null;
    provider_data: Record<string, any> | null;
    auto_renewal: boolean;
    notes: string | null;
    activated_at: string | null;
    expires_at: string | null;
    suspended_at: string | null;
    cancelled_at: string | null;
    is_active: boolean;
    is_expired: boolean;
    is_expiring_soon: boolean;
    is_suspended: boolean;
    is_cancelled: boolean;
    product: Product | null;
    customer: Customer | null;
    order: Order | null;
    created_at: string;
    updated_at: string;
}

interface Props {
    hostingOrder: HostingOrder;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin/tlds' },
    { title: 'Hosting Orders', href: '/admin/hosting-orders' },
    { title: 'Hosting Details', href: '#' },
];

export default function HostingOrderShow({ hostingOrder }: Props) {
    const { data, setData, put, processing } = useForm({
        notes: hostingOrder.notes || '',
    });

    const handleUpdateNotes = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/hosting-orders/${hostingOrder.id}`, {
            preserveScroll: true,
        });
    };

    const handleActivate = () => {
        if (confirm('Are you sure you want to activate this hosting service?')) {
            router.put(`/admin/hosting-orders/${hostingOrder.id}/activate`, {}, {
                preserveScroll: true,
            });
        }
    };

    const handleSuspend = () => {
        if (confirm('Are you sure you want to suspend this hosting service?')) {
            router.put(`/admin/hosting-orders/${hostingOrder.id}/suspend`, {}, {
                preserveScroll: true,
            });
        }
    };

    const handleCancel = () => {
        if (confirm('Are you sure you want to cancel this hosting service? This action cannot be undone.')) {
            router.put(`/admin/hosting-orders/${hostingOrder.id}/cancel`, {}, {
                preserveScroll: true,
            });
        }
    };

    const handleToggleAutoRenewal = () => {
        router.put(`/admin/hosting-orders/${hostingOrder.id}/auto-renewal`, {}, {
            preserveScroll: true,
        });
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
            <Head title={`Hosting: ${hostingOrder.domain}`} />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/hosting-orders">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <Server className="h-6 w-6 text-purple-600" />
                                <h1 className="text-2xl font-bold">{hostingOrder.domain}</h1>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {hostingOrder.package_name}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {hostingOrder.is_expired && (
                            <Badge variant="destructive" className="flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                Expired
                            </Badge>
                        )}
                        {hostingOrder.is_expiring_soon && !hostingOrder.is_expired && (
                            <Badge variant="default" className="bg-orange-500 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                Expiring Soon
                            </Badge>
                        )}
                        {hostingOrder.is_suspended && (
                            <Badge variant="destructive" className="flex items-center gap-1">
                                <Ban className="h-3 w-3" />
                                Suspended
                            </Badge>
                        )}
                        {hostingOrder.is_active && (
                            <Badge variant="default" className="bg-green-500 flex items-center gap-1">
                                Active
                            </Badge>
                        )}
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Main Content */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Hosting Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Hosting Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Domain</label>
                                        <div className="mt-1 font-medium">{hostingOrder.domain}</div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Package</label>
                                        <div className="mt-1 font-medium">{hostingOrder.package_name}</div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Provider</label>
                                        <div className="mt-1 font-medium capitalize">{hostingOrder.provider}</div>
                                    </div>
                                    {hostingOrder.provider_order_id && (
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Provider Order ID</label>
                                            <div className="mt-1 font-medium">{hostingOrder.provider_order_id}</div>
                                        </div>
                                    )}
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Billing Cycle</label>
                                        <div className="mt-1 font-medium capitalize">{hostingOrder.billing_cycle}</div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Price</label>
                                        <div className="mt-1 font-medium">
                                            {hostingOrder.currency} {parseFloat(hostingOrder.price).toFixed(2)}
                                        </div>
                                    </div>
                                    {hostingOrder.activated_at && (
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Activated</label>
                                            <div className="mt-1 font-medium">
                                                {new Date(hostingOrder.activated_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    )}
                                    {hostingOrder.expires_at && (
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Expires</label>
                                            <div className="mt-1 font-medium">
                                                {new Date(hostingOrder.expires_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Product Information */}
                        {hostingOrder.product && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Product Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Product:</span>
                                        <span className="font-medium">{hostingOrder.product.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Type:</span>
                                        <span className="font-medium capitalize">{hostingOrder.product.product_type}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Location:</span>
                                        <span className="font-medium">{hostingOrder.product.location}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Features */}
                        {hostingOrder.features && Object.keys(hostingOrder.features).length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Package Features</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4">
                                        {Object.entries(hostingOrder.features).map(([key, value]) => (
                                            <div key={key}>
                                                <label className="text-sm font-medium text-muted-foreground capitalize">
                                                    {key.replace(/_/g, ' ')}
                                                </label>
                                                <div className="mt-1 text-sm">{String(value)}</div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Notes */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Admin Notes</CardTitle>
                                <CardDescription>Internal notes about this hosting service</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleUpdateNotes} className="space-y-4">
                                    <Textarea
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        rows={4}
                                        placeholder="Add notes..."
                                    />
                                    <Button type="submit" disabled={processing}>
                                        Save Notes
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {!hostingOrder.is_active && !hostingOrder.is_cancelled && (
                                    <Button 
                                        onClick={handleActivate} 
                                        className="w-full"
                                        variant="default"
                                    >
                                        <Play className="mr-2 h-4 w-4" />
                                        Activate
                                    </Button>
                                )}
                                {hostingOrder.is_active && (
                                    <Button 
                                        onClick={handleSuspend} 
                                        className="w-full"
                                        variant="destructive"
                                    >
                                        <Pause className="mr-2 h-4 w-4" />
                                        Suspend
                                    </Button>
                                )}
                                {hostingOrder.is_suspended && (
                                    <Button 
                                        onClick={handleActivate} 
                                        className="w-full"
                                        variant="default"
                                    >
                                        <Play className="mr-2 h-4 w-4" />
                                        Unsuspend
                                    </Button>
                                )}
                                {!hostingOrder.is_cancelled && (
                                    <Button 
                                        onClick={handleCancel} 
                                        className="w-full"
                                        variant="outline"
                                    >
                                        <Ban className="mr-2 h-4 w-4" />
                                        Cancel Service
                                    </Button>
                                )}

                                <div className="pt-4 border-t">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium">Auto Renewal</label>
                                        <Switch
                                            checked={hostingOrder.auto_renewal}
                                            onCheckedChange={handleToggleAutoRenewal}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Automatically renew before expiration
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Current Status:</span>
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(hostingOrder.status)}`}>
                                            {hostingOrder.status}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Customer Information */}
                        {hostingOrder.customer && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Customer
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 text-sm">
                                    <div>
                                        <div className="font-medium">{hostingOrder.customer.name}</div>
                                        <div className="text-muted-foreground">{hostingOrder.customer.email}</div>
                                    </div>
                                    {hostingOrder.customer.company_name && (
                                        <div className="text-muted-foreground">
                                            {hostingOrder.customer.company_name}
                                        </div>
                                    )}
                                    {hostingOrder.customer.phone && (
                                        <div className="text-muted-foreground">
                                            {hostingOrder.customer.phone}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Order Information */}
                        {hostingOrder.order && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CreditCard className="h-5 w-5" />
                                        Order
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Order #:</span>
                                        <Link 
                                            href={`/admin/orders/${hostingOrder.order.id}`}
                                            className="font-medium hover:underline"
                                        >
                                            {hostingOrder.order.order_number}
                                        </Link>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Status:</span>
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(hostingOrder.order.status)}`}>
                                            {hostingOrder.order.status}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Payment:</span>
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(hostingOrder.order.payment_status)}`}>
                                            {hostingOrder.order.payment_status}
                                        </span>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t">
                                        <span className="text-muted-foreground">Total:</span>
                                        <span className="font-bold">
                                            {hostingOrder.order.currency} {parseFloat(hostingOrder.order.total_amount).toFixed(2)}
                                        </span>
                                    </div>
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
                                    <span>{new Date(hostingOrder.created_at).toLocaleString()}</span>
                                </div>
                                {hostingOrder.activated_at && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Activated:</span>
                                        <span>{new Date(hostingOrder.activated_at).toLocaleString()}</span>
                                    </div>
                                )}
                                {hostingOrder.suspended_at && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Suspended:</span>
                                        <span>{new Date(hostingOrder.suspended_at).toLocaleString()}</span>
                                    </div>
                                )}
                                {hostingOrder.cancelled_at && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Cancelled:</span>
                                        <span>{new Date(hostingOrder.cancelled_at).toLocaleString()}</span>
                                    </div>
                                )}
                                {hostingOrder.expires_at && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Expires:</span>
                                        <span>{new Date(hostingOrder.expires_at).toLocaleDateString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Updated:</span>
                                    <span>{new Date(hostingOrder.updated_at).toLocaleString()}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}




