import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Globe, Calendar, Shield, RefreshCw, User, CreditCard, AlertCircle } from 'lucide-react';

interface Customer {
    id: number;
    name: string;
    email: string;
    company_name?: string;
    phone?: string;
}

interface Tld {
    id: number;
    extension: string;
}

interface Order {
    id: number;
    order_number: string;
    status: string;
    total_amount: string;
    currency: string;
    payment_status: string;
}

interface DomainOrder {
    id: number;
    domain: string;
    tld: Tld | null;
    full_domain: string;
    years: number;
    nameservers: string[] | null;
    privacy_protection: boolean;
    auth_code: string | null;
    provider: string;
    status: string;
    registered_at: string | null;
    expires_at: string | null;
    auto_renewal: boolean;
    is_expired: boolean;
    is_expiring_soon: boolean;
    customer: Customer | null;
    order: Order | null;
    created_at: string;
    updated_at: string;
}

interface Props {
    domainOrder: DomainOrder;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin/tlds' },
    { title: 'Domain Orders', href: '/admin/domain-orders' },
    { title: 'Domain Details', href: '#' },
];

export default function DomainOrderShow({ domainOrder }: Props) {
    const { data, setData, put, processing } = useForm({
        status: domainOrder.status,
    });

    const handleUpdateStatus = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/domain-orders/${domainOrder.id}/status`, {
            preserveScroll: true,
        });
    };

    const handleToggleAutoRenewal = () => {
        router.put(`/admin/domain-orders/${domainOrder.id}/auto-renewal`, {}, {
            preserveScroll: true,
        });
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
            <Head title={`Domain: ${domainOrder.full_domain}`} />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/domain-orders">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <Globe className="h-6 w-6 text-blue-600" />
                                <h1 className="text-2xl font-bold">{domainOrder.full_domain}</h1>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Registered on {domainOrder.registered_at ? new Date(domainOrder.registered_at).toLocaleDateString() : 'Pending'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {domainOrder.is_expired && (
                            <Badge variant="destructive" className="flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                Expired
                            </Badge>
                        )}
                        {domainOrder.is_expiring_soon && !domainOrder.is_expired && (
                            <Badge variant="default" className="bg-orange-500 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                Expiring Soon
                            </Badge>
                        )}
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Main Content */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Domain Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Domain Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Domain Name</label>
                                        <div className="mt-1 font-medium">{domainOrder.domain}</div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">TLD</label>
                                        <div className="mt-1 font-medium">.{domainOrder.tld?.extension}</div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Registration Period</label>
                                        <div className="mt-1 font-medium">{domainOrder.years} year{domainOrder.years !== 1 ? 's' : ''}</div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Provider</label>
                                        <div className="mt-1 font-medium capitalize">{domainOrder.provider}</div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Registered Date</label>
                                        <div className="mt-1 font-medium">
                                            {domainOrder.registered_at ? new Date(domainOrder.registered_at).toLocaleDateString() : 'Pending'}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Expiry Date</label>
                                        <div className="mt-1 font-medium">
                                            {domainOrder.expires_at ? new Date(domainOrder.expires_at).toLocaleDateString() : 'N/A'}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t">
                                    <label className="text-sm font-medium text-muted-foreground">Features</label>
                                    <div className="mt-2 flex gap-4">
                                        <div className="flex items-center gap-2">
                                            {domainOrder.privacy_protection ? (
                                                <Shield className="h-5 w-5 text-green-600" />
                                            ) : (
                                                <Shield className="h-5 w-5 text-gray-300" />
                                            )}
                                            <span className="text-sm">Privacy Protection</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {domainOrder.auto_renewal ? (
                                                <RefreshCw className="h-5 w-5 text-blue-600" />
                                            ) : (
                                                <RefreshCw className="h-5 w-5 text-gray-300" />
                                            )}
                                            <span className="text-sm">Auto Renewal</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Nameservers */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Nameservers</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {domainOrder.nameservers && domainOrder.nameservers.length > 0 ? (
                                    <div className="space-y-2">
                                        {domainOrder.nameservers.map((ns, index) => (
                                            <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                                                <span className="text-xs text-muted-foreground">NS{index + 1}:</span>
                                                <span className="font-mono text-sm">{ns}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-sm text-muted-foreground">No nameservers configured</div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Auth Code */}
                        {domainOrder.auth_code && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Authorization Code</CardTitle>
                                    <CardDescription>EPP/Auth code for domain transfer</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="p-3 bg-muted rounded font-mono text-sm">
                                        {domainOrder.auth_code}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Status Management */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleUpdateStatus} className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Domain Status</label>
                                        <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="processing">Processing</SelectItem>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="expired">Expired</SelectItem>
                                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                                <SelectItem value="failed">Failed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <Button type="submit" className="w-full" disabled={processing}>
                                        Update Status
                                    </Button>
                                </form>

                                <div className="mt-4 pt-4 border-t">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium">Auto Renewal</label>
                                        <Switch
                                            checked={domainOrder.auto_renewal}
                                            onCheckedChange={handleToggleAutoRenewal}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Automatically renew before expiration
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Customer Information */}
                        {domainOrder.customer && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Customer
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 text-sm">
                                    <div>
                                        <div className="font-medium">{domainOrder.customer.name}</div>
                                        <div className="text-muted-foreground">{domainOrder.customer.email}</div>
                                    </div>
                                    {domainOrder.customer.company_name && (
                                        <div className="text-muted-foreground">
                                            {domainOrder.customer.company_name}
                                        </div>
                                    )}
                                    {domainOrder.customer.phone && (
                                        <div className="text-muted-foreground">
                                            {domainOrder.customer.phone}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Order Information */}
                        {domainOrder.order && (
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
                                            href={`/admin/orders/${domainOrder.order.id}`}
                                            className="font-medium hover:underline"
                                        >
                                            {domainOrder.order.order_number}
                                        </Link>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Status:</span>
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(domainOrder.order.status)}`}>
                                            {domainOrder.order.status}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Payment:</span>
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(domainOrder.order.payment_status)}`}>
                                            {domainOrder.order.payment_status}
                                        </span>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t">
                                        <span className="text-muted-foreground">Total:</span>
                                        <span className="font-bold">
                                            {domainOrder.order.currency} {parseFloat(domainOrder.order.total_amount).toFixed(2)}
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
                                    <span>{new Date(domainOrder.created_at).toLocaleString()}</span>
                                </div>
                                {domainOrder.registered_at && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Registered:</span>
                                        <span>{new Date(domainOrder.registered_at).toLocaleString()}</span>
                                    </div>
                                )}
                                {domainOrder.expires_at && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Expires:</span>
                                        <span>{new Date(domainOrder.expires_at).toLocaleDateString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Updated:</span>
                                    <span>{new Date(domainOrder.updated_at).toLocaleString()}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}




