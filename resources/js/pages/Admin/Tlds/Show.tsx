import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Edit, Plus, Trash2, DollarSign, Calendar, Star } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin/tlds' },
    { title: 'TLDs', href: '/admin/tlds' },
    { title: 'Show', href: '#' },
];

interface DomainPrice {
    id: number;
    years: number;
    cost: number | string;
    margin: number | string;
    sell_price: number | string;
    is_premium: boolean;
    is_promotional: boolean;
    promotional_start: string | null;
    promotional_end: string | null;
    created_at: string;
    updated_at: string;
}

interface Tld {
    id: number;
    extension: string;
    name: string;
    registry_operator: string;
    is_active: boolean;
    min_years: number;
    max_years: number;
    auto_renewal: boolean;
    privacy_protection: boolean;
    dns_management: boolean;
    email_forwarding: boolean;
    id_protection: boolean;
    domain_prices: DomainPrice[];
    domain_orders: any[];
}

interface Props {
    tld: Tld;
}

export default function ShowTld({ tld }: Props) {
    const [showAddPriceForm, setShowAddPriceForm] = useState(false);
    const [editingPrice, setEditingPrice] = useState<DomainPrice | null>(null);

    // Helper function to safely format currency
    const formatCurrency = (value: number | string): string => {
        const num = Number(value);
        return isNaN(num) ? '0.00' : num.toFixed(2);
    };

    const { data: priceData, setData: setPriceData, post, put, delete: destroy, processing, errors, reset } = useForm({
        years: 1,
        cost: 0,
        margin: 0,
        sell_price: 0,
        is_premium: false,
        is_promotional: false,
        promotional_start: '',
        promotional_end: '',
    });

    const handleAddPrice = () => {
        setShowAddPriceForm(true);
        setEditingPrice(null);
        reset();
    };

    const handleEditPrice = (price: DomainPrice) => {
        setEditingPrice(price);
        setShowAddPriceForm(true);
        setPriceData({
            years: price.years,
            cost: Number(price.cost),
            margin: Number(price.margin),
            sell_price: Number(price.sell_price),
            is_premium: price.is_premium,
            is_promotional: price.is_promotional,
            promotional_start: price.promotional_start || '',
            promotional_end: price.promotional_end || '',
        });
    };

    const handleSubmitPrice = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingPrice) {
            put(`/admin/tlds/${tld.id}/prices/${editingPrice.id}`);
        } else {
            post(`/admin/tlds/${tld.id}/prices`);
        }
        setShowAddPriceForm(false);
        setEditingPrice(null);
        reset();
    };

    const handleDeletePrice = (priceId: number) => {
        if (confirm('Are you sure you want to delete this price?')) {
            destroy(`/admin/tlds/${tld.id}/prices/${priceId}`);
        }
    };

    const handleCancel = () => {
        setShowAddPriceForm(false);
        setEditingPrice(null);
        reset();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`TLD Details - .${tld.extension}`} />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                {/* TLD Information */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>.{tld.extension} - {tld.name}</CardTitle>
                                <CardDescription>
                                    Registry: {tld.registry_operator} | 
                                    Status: {tld.is_active ? 'Active' : 'Inactive'} |
                                    Orders: {tld.domain_orders.length}
                                </CardDescription>
                            </div>
                            <Link href={`/admin/tlds/${tld.id}/edit`}>
                                <Button variant="outline">
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit TLD
                                </Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                            <div>
                                <Label className="text-sm font-medium text-muted-foreground">Min Years</Label>
                                <p className="text-lg font-semibold">{tld.min_years}</p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-muted-foreground">Max Years</Label>
                                <p className="text-lg font-semibold">{tld.max_years}</p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-muted-foreground">Auto Renewal</Label>
                                <p className="text-lg font-semibold">{tld.auto_renewal ? 'Yes' : 'No'}</p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-muted-foreground">Privacy Protection</Label>
                                <p className="text-lg font-semibold">{tld.privacy_protection ? 'Yes' : 'No'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Domain Prices */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Domain Pricing</CardTitle>
                                <CardDescription>
                                    Manage pricing for different registration periods
                                </CardDescription>
                            </div>
                            <Button onClick={handleAddPrice}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Price
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {showAddPriceForm && (
                            <Card className="mb-6">
                                <CardHeader>
                                    <CardTitle>
                                        {editingPrice ? 'Edit Price' : 'Add New Price'}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmitPrice} className="space-y-4">
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                            <div>
                                                <Label htmlFor="years">Years</Label>
                                                <Input
                                                    id="years"
                                                    type="number"
                                                    min="1"
                                                    max="10"
                                                    value={priceData.years}
                                                    onChange={(e) => setPriceData('years', parseInt(e.target.value))}
                                                    required
                                                />
                                                {errors.years && <p className="text-sm text-red-500">{errors.years}</p>}
                                            </div>
                                            <div>
                                                <Label htmlFor="cost">Cost ($)</Label>
                                                <Input
                                                    id="cost"
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={priceData.cost}
                                                    onChange={(e) => setPriceData('cost', parseFloat(e.target.value))}
                                                    required
                                                />
                                                {errors.cost && <p className="text-sm text-red-500">{errors.cost}</p>}
                                            </div>
                                            <div>
                                                <Label htmlFor="margin">Margin ($)</Label>
                                                <Input
                                                    id="margin"
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={priceData.margin}
                                                    onChange={(e) => setPriceData('margin', parseFloat(e.target.value))}
                                                    required
                                                />
                                                {errors.margin && <p className="text-sm text-red-500">{errors.margin}</p>}
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div>
                                                <Label htmlFor="sell_price">Sell Price ($)</Label>
                                                <Input
                                                    id="sell_price"
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={priceData.sell_price}
                                                    onChange={(e) => setPriceData('sell_price', parseFloat(e.target.value))}
                                                    required
                                                />
                                                {errors.sell_price && <p className="text-sm text-red-500">{errors.sell_price}</p>}
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="is_premium"
                                                        checked={priceData.is_premium}
                                                        onCheckedChange={(checked) => setPriceData('is_premium', checked as boolean)}
                                                    />
                                                    <Label htmlFor="is_premium">Premium</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="is_promotional"
                                                        checked={priceData.is_promotional}
                                                        onCheckedChange={(checked) => setPriceData('is_promotional', checked as boolean)}
                                                    />
                                                    <Label htmlFor="is_promotional">Promotional</Label>
                                                </div>
                                            </div>
                                        </div>

                                        {priceData.is_promotional && (
                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                <div>
                                                    <Label htmlFor="promotional_start">Promotional Start</Label>
                                                    <Input
                                                        id="promotional_start"
                                                        type="datetime-local"
                                                        value={priceData.promotional_start}
                                                        onChange={(e) => setPriceData('promotional_start', e.target.value)}
                                                    />
                                                    {errors.promotional_start && <p className="text-sm text-red-500">{errors.promotional_start}</p>}
                                                </div>
                                                <div>
                                                    <Label htmlFor="promotional_end">Promotional End</Label>
                                                    <Input
                                                        id="promotional_end"
                                                        type="datetime-local"
                                                        value={priceData.promotional_end}
                                                        onChange={(e) => setPriceData('promotional_end', e.target.value)}
                                                    />
                                                    {errors.promotional_end && <p className="text-sm text-red-500">{errors.promotional_end}</p>}
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex justify-end space-x-2">
                                            <Button type="button" variant="outline" onClick={handleCancel}>
                                                Cancel
                                            </Button>
                                            <Button type="submit" disabled={processing}>
                                                {editingPrice ? 'Update Price' : 'Add Price'}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        )}

                        {tld.domain_prices.length > 0 ? (
                            <div className="space-y-4">
                                {tld.domain_prices.map((price) => (
                                    <Card key={price.id} className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="flex items-center space-x-2">
                                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-medium">{price.years} year{price.years > 1 ? 's' : ''}</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-sm text-muted-foreground">Cost:</span>
                                                    <span className="font-medium">${formatCurrency(price.cost)}</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-sm text-muted-foreground">Margin:</span>
                                                    <span className="font-medium">${formatCurrency(price.margin)}</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-sm text-muted-foreground">Sell:</span>
                                                    <span className="font-bold text-lg">${formatCurrency(price.sell_price)}</span>
                                                </div>
                                                {price.is_premium && (
                                                    <div className="flex items-center space-x-1">
                                                        <Star className="h-4 w-4 text-yellow-500" />
                                                        <span className="text-sm text-yellow-600">Premium</span>
                                                    </div>
                                                )}
                                                {price.is_promotional && (
                                                    <div className="flex items-center space-x-1">
                                                        <Calendar className="h-4 w-4 text-green-500" />
                                                        <span className="text-sm text-green-600">Promotional</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEditPrice(price)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDeletePrice(price.id)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 text-center text-muted-foreground">
                                No pricing configured. Add some prices to get started.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
