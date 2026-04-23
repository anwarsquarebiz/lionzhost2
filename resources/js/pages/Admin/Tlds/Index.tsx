import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Edit, Plus, Trash2, Eye } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin/tlds',
    },
    {
        title: 'TLDs & Pricing',
        href: '/admin/tlds',
    },
];

interface Tld {
    id: number;
    extension: string;
    name: string;
    registry_operator: string;
    is_active: boolean;
    domain_orders_count: number;
}

interface Props {
    tlds: {
        data: Tld[];
        current_page: number;
        last_page: number;
        total: number;
    };
}

export default function TldsIndex({ tlds }: Props) {
    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this TLD?')) {
            router.delete(`/admin/tlds/${id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="TLDs & Pricing" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>TLDs & Pricing Management</CardTitle>
                                <CardDescription>
                                    Manage top-level domains and their pricing
                                </CardDescription>
                            </div>
                            <Link href="/admin/tlds/create">
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add TLD
                                </Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="p-4 text-left font-medium">Extension</th>
                                        <th className="p-4 text-left font-medium">Name</th>
                                        <th className="p-4 text-left font-medium">Registry</th>
                                        <th className="p-4 text-left font-medium">Status</th>
                                        <th className="p-4 text-left font-medium">Orders</th>
                                        <th className="p-4 text-right font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tlds.data.map((tld) => (
                                        <tr key={tld.id} className="border-b hover:bg-muted/50">
                                            <td className="p-4 font-medium">.{tld.extension}</td>
                                            <td className="p-4">{tld.name}</td>
                                            <td className="p-4 capitalize">{tld.registry_operator}</td>
                                            <td className="p-4">
                                                {tld.is_active ? (
                                                    <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                                                        Inactive
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4 text-muted-foreground">
                                                {tld.domain_orders_count}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex justify-end gap-2">
                                                    <Link href={`/admin/tlds/${tld.id}`}>
                                                        <Button variant="outline" size="sm">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Link href={`/admin/tlds/${tld.id}/edit`}>
                                                        <Button variant="outline" size="sm">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm"
                                                        onClick={() => handleDelete(tld.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        {tlds.data.length === 0 && (
                            <div className="py-12 text-center text-muted-foreground">
                                No TLDs found. Add some to get started.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
