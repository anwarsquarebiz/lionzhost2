import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Edit, Plus, Trash2, Eye, Server, Shield, Mail, HardDrive, Package as PackageIcon } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin/tlds' },
    { title: 'Products', href: '/admin/products' },
];

interface Product {
    id: number;
    name: string;
    location: string;
    product_type: string;
    description: string;
    currency: string;
    resellerclub_key: string;
    is_active: boolean;
    sort_order: number;
    plans_count: number;
    features_count: number;
}

interface Props {
    products: {
        data: Product[];
        current_page: number;
        last_page: number;
        total: number;
    };
}

export default function ProductsIndex({ products }: Props) {
    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this product?')) {
            router.delete(`/admin/products/${id}`);
        }
    };

    const getProductIcon = (type: string) => {
        switch (type) {
            case 'shared-hosting':
                return <Server className="h-5 w-5 text-blue-600" />;
            case 'vps':
                return <HardDrive className="h-5 w-5 text-purple-600" />;
            case 'dedicated-hosting':
                return <Server className="h-5 w-5 text-orange-600" />;
            case 'email':
                return <Mail className="h-5 w-5 text-green-600" />;
            case 'ssl':
                return <Shield className="h-5 w-5 text-emerald-600" />;
            default:
                return <PackageIcon className="h-5 w-5 text-gray-600" />;
        }
    };

    const getProductTypeLabel = (type: string) => {
        switch (type) {
            case 'shared-hosting':
                return 'Shared Hosting';
            case 'vps':
                return 'VPS';
            case 'dedicated-hosting':
                return 'Dedicated Server';
            case 'email':
                return 'Email';
            case 'ssl':
                return 'SSL Certificate';
            default:
                return type;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Products Management" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Products Management</CardTitle>
                                <CardDescription>
                                    Manage hosting, VPS, SSL, and other products
                                </CardDescription>
                            </div>
                            <Link href="/admin/products/create">
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Product
                                </Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="p-4 text-left text-sm font-medium text-muted-foreground">Product</th>
                                        <th className="p-4 text-left text-sm font-medium text-muted-foreground">Type</th>
                                        <th className="p-4 text-left text-sm font-medium text-muted-foreground">Location</th>
                                        <th className="p-4 text-left text-sm font-medium text-muted-foreground">Plans</th>
                                        <th className="p-4 text-left text-sm font-medium text-muted-foreground">Features</th>
                                        <th className="p-4 text-left text-sm font-medium text-muted-foreground">Status</th>
                                        <th className="p-4 text-right text-sm font-medium text-muted-foreground">Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {products.data.map((product) => (
                                        <tr key={product.id} className="border-b hover:bg-muted/50">
                                            <td className="p-4">
                                                <div className="flex items-center space-x-3">
                                                    {getProductIcon(product.product_type)}
                                                    <div>
                                                        <div className="font-medium">{product.name}</div>
                                                        {product.resellerclub_key && (
                                                            <div className="text-xs text-muted-foreground">
                                                                RC: {product.resellerclub_key}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-sm">
                                                    {getProductTypeLabel(product.product_type)}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm text-muted-foreground">
                                                {product.location || 'N/A'}
                                            </td>
                                            <td className="p-4 text-sm text-muted-foreground">
                                                {product.plans_count} plan{product.plans_count !== 1 ? 's' : ''}
                                            </td>
                                            <td className="p-4 text-sm text-muted-foreground">
                                                {product.features_count} feature{product.features_count !== 1 ? 's' : ''}
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                    product.is_active 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {product.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex justify-end gap-2">
                                                    <Link href={`/admin/products/${product.id}`}>
                                                        <Button variant="outline" size="sm">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Link href={`/admin/products/${product.id}/edit`}>
                                                        <Button variant="outline" size="sm">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm"
                                                        onClick={() => handleDelete(product.id)}
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
                        
                        {products.data.length === 0 && (
                            <div className="py-12 text-center text-muted-foreground">
                                No products found. Add some to get started.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

