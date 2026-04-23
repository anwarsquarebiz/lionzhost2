import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Edit, Plus, Trash2, DollarSign, Star, Calendar } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin/tlds' },
    { title: 'Products', href: '/admin/products' },
    { title: 'Show', href: '#' },
];

interface Plan {
    id: number;
    resellerclub_plan_id: number | null;
    plan_type: string;
    package_months: number;
    price_per_month: number | string;
    setup_fee: number | string;
    is_active: boolean;
}

interface Feature {
    id: number;
    feature: string;
    sort_order: number;
    is_highlighted: boolean;
    icon: string | null;
}

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
    plans: Plan[];
    features: Feature[];
}

interface Props {
    product: Product;
}

export default function ShowProduct({ product }: Props) {
    const [showAddPlanForm, setShowAddPlanForm] = useState(false);
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
    const [showAddFeatureForm, setShowAddFeatureForm] = useState(false);
    const [editingFeature, setEditingFeature] = useState<Feature | null>(null);

    // Helper function to safely format currency
    const formatCurrency = (value: number | string): string => {
        const num = Number(value);
        return isNaN(num) ? '0.00' : num.toFixed(2);
    };

    const { data: planData, setData: setPlanData, post: postPlan, put: putPlan, delete: deletePlan, processing: processingPlan, errors: planErrors, reset: resetPlan } = useForm({
        resellerclub_plan_id: null as number | null,
        plan_type: 'add',
        package_months: 1,
        price_per_month: 0,
        setup_fee: 0,
        is_active: true,
    });

    const { data: featureData, setData: setFeatureData, post: postFeature, put: putFeature, delete: deleteFeature, processing: processingFeature, errors: featureErrors, reset: resetFeature } = useForm({
        feature: '',
        sort_order: 0,
        is_highlighted: false,
        icon: '',
    });

    const handleAddPlan = () => {
        setShowAddPlanForm(true);
        setEditingPlan(null);
        resetPlan();
    };

    const handleEditPlan = (plan: Plan) => {
        setEditingPlan(plan);
        setShowAddPlanForm(true);
        setPlanData({
            resellerclub_plan_id: plan.resellerclub_plan_id,
            plan_type: plan.plan_type,
            package_months: plan.package_months,
            price_per_month: Number(plan.price_per_month),
            setup_fee: Number(plan.setup_fee),
            is_active: plan.is_active,
        });
    };

    const handleSubmitPlan = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingPlan) {
            putPlan(`/admin/products/${product.id}/plans/${editingPlan.id}`);
        } else {
            postPlan(`/admin/products/${product.id}/plans`);
        }
        setShowAddPlanForm(false);
        setEditingPlan(null);
        resetPlan();
    };

    const handleDeletePlan = (planId: number) => {
        if (confirm('Are you sure you want to delete this plan?')) {
            deletePlan(`/admin/products/${product.id}/plans/${planId}`);
        }
    };

    const handleAddFeature = () => {
        setShowAddFeatureForm(true);
        setEditingFeature(null);
        resetFeature();
    };

    const handleEditFeature = (feature: Feature) => {
        setEditingFeature(feature);
        setShowAddFeatureForm(true);
        setFeatureData({
            feature: feature.feature,
            sort_order: feature.sort_order,
            is_highlighted: feature.is_highlighted,
            icon: feature.icon || '',
        });
    };

    const handleSubmitFeature = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingFeature) {
            putFeature(`/admin/products/${product.id}/features/${editingFeature.id}`);
        } else {
            postFeature(`/admin/products/${product.id}/features`);
        }
        setShowAddFeatureForm(false);
        setEditingFeature(null);
        resetFeature();
    };

    const handleDeleteFeature = (featureId: number) => {
        if (confirm('Are you sure you want to delete this feature?')) {
            deleteFeature(`/admin/products/${product.id}/features/${featureId}`);
        }
    };

    const getBillingPeriodDisplay = (months: number): string => {
        if (months == 1) return '1 Month';
        if (months < 12) return `${months} Months`;
        if (months == 12) return '1 Year';
        if (months == 24) return '2 Years';
        if (months == 36) return '3 Years';
        return `${months} Months`;
    };

    const getTotalPrice = (pricePerMonth: number | string, months: number, setupFee: number | string): string => {
        const total = (Number(pricePerMonth) * months) + Number(setupFee);
        return formatCurrency(total);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Product Details - ${product.name}`} />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                {/* Product Information */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>{product.name}</CardTitle>
                                <CardDescription>
                                    {product.description} | Type: {product.product_type} | Location: {product.location || 'N/A'}
                                </CardDescription>
                            </div>
                            <Link href={`/admin/products/${product.id}/edit`}>
                                <Button variant="outline">
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Product
                                </Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                            <div>
                                <Label className="text-sm font-medium text-muted-foreground">Currency</Label>
                                <p className="text-lg font-semibold">{product.currency}</p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-muted-foreground">ResellerClub Key</Label>
                                <p className="text-sm font-mono">{product.resellerclub_key || 'N/A'}</p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-muted-foreground">Sort Order</Label>
                                <p className="text-lg font-semibold">{product.sort_order}</p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                                <p className={`text-lg font-semibold ${product.is_active ? 'text-green-600' : 'text-red-600'}`}>
                                    {product.is_active ? 'Active' : 'Inactive'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Pricing Plans */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Pricing Plans</CardTitle>
                                <CardDescription>
                                    Manage billing cycles and pricing for this product
                                </CardDescription>
                            </div>
                            <Button onClick={handleAddPlan}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Plan
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {showAddPlanForm && (
                            <Card className="mb-6">
                                <CardHeader>
                                    <CardTitle>{editingPlan ? 'Edit Plan' : 'Add New Plan'}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmitPlan} className="space-y-4">
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div>
                                                <Label htmlFor="plan_type">Plan Type</Label>
                                                <Select value={planData.plan_type} onValueChange={(value) => setPlanData('plan_type', value)}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="add">Add (New)</SelectItem>
                                                        <SelectItem value="renew">Renew</SelectItem>
                                                        <SelectItem value="restore">Restore</SelectItem>
                                                        <SelectItem value="transfer">Transfer</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {planErrors.plan_type && <p className="text-sm text-red-500">{planErrors.plan_type}</p>}
                                            </div>

                                            <div>
                                                <Label htmlFor="package_months">Package Duration (Months)</Label>
                                                <Select 
                                                    value={planData.package_months.toString()} 
                                                    onValueChange={(value) => setPlanData('package_months', parseInt(value))}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="1">1 Month</SelectItem>
                                                        <SelectItem value="3">3 Months</SelectItem>
                                                        <SelectItem value="6">6 Months</SelectItem>
                                                        <SelectItem value="12">12 Months (1 Year)</SelectItem>
                                                        <SelectItem value="24">24 Months (2 Years)</SelectItem>
                                                        <SelectItem value="36">36 Months (3 Years)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {planErrors.package_months && <p className="text-sm text-red-500">{planErrors.package_months}</p>}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                            <div>
                                                <Label htmlFor="price_per_month">Price per Month ($)</Label>
                                                <Input
                                                    id="price_per_month"
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={planData.price_per_month}
                                                    onChange={(e) => setPlanData('price_per_month', parseFloat(e.target.value))}
                                                    required
                                                />
                                                {planErrors.price_per_month && <p className="text-sm text-red-500">{planErrors.price_per_month}</p>}
                                            </div>

                                            <div>
                                                <Label htmlFor="setup_fee">Setup Fee ($)</Label>
                                                <Input
                                                    id="setup_fee"
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={planData.setup_fee}
                                                    onChange={(e) => setPlanData('setup_fee', parseFloat(e.target.value))}
                                                />
                                                {planErrors.setup_fee && <p className="text-sm text-red-500">{planErrors.setup_fee}</p>}
                                            </div>

                                            <div>
                                                <Label htmlFor="resellerclub_plan_id">ResellerClub Plan ID</Label>
                                                <Input
                                                    id="resellerclub_plan_id"
                                                    type="number"
                                                    value={planData.resellerclub_plan_id || ''}
                                                    onChange={(e) => setPlanData('resellerclub_plan_id', e.target.value ? parseInt(e.target.value) : null)}
                                                    placeholder="Optional"
                                                />
                                                {planErrors.resellerclub_plan_id && <p className="text-sm text-red-500">{planErrors.resellerclub_plan_id}</p>}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="is_active_plan"
                                                    checked={planData.is_active}
                                                    onCheckedChange={(checked) => setPlanData('is_active', checked as boolean)}
                                                />
                                                <Label htmlFor="is_active_plan">Active</Label>
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                Total: ${formatCurrency((planData.price_per_month * planData.package_months) + planData.setup_fee)}
                                            </div>
                                        </div>

                                        <div className="flex justify-end space-x-2">
                                            <Button type="button" variant="outline" onClick={() => { setShowAddPlanForm(false); setEditingPlan(null); resetPlan(); }}>
                                                Cancel
                                            </Button>
                                            <Button type="submit" disabled={processingPlan}>
                                                {editingPlan ? 'Update Plan' : 'Add Plan'}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        )}

                        {product.plans.length > 0 ? (
                            <div className="space-y-4">
                                {product.plans.map((plan) => (
                                    <Card key={plan.id} className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <div className="flex items-center space-x-2">
                                                        <span className="font-medium">{getBillingPeriodDisplay(plan.package_months)}</span>
                                                        <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                                                            {plan.plan_type.toUpperCase()}
                                                        </span>
                                                        {plan.resellerclub_plan_id && (
                                                            <span className="text-xs text-muted-foreground">
                                                                RC: {plan.resellerclub_plan_id}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground mt-1">
                                                        ${formatCurrency(plan.price_per_month)}/month
                                                        {Number(plan.setup_fee) > 0 && ` + $${formatCurrency(plan.setup_fee)} setup`}
                                                        {' • '}Total: ${getTotalPrice(plan.price_per_month, plan.package_months, plan.setup_fee)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEditPlan(plan)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDeletePlan(plan.id)}
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
                                No pricing plans configured. Add some plans to get started.
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Features */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Product Features</CardTitle>
                                <CardDescription>
                                    Manage features and specifications for this product
                                </CardDescription>
                            </div>
                            <Button onClick={handleAddFeature}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Feature
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {showAddFeatureForm && (
                            <Card className="mb-6">
                                <CardHeader>
                                    <CardTitle>{editingFeature ? 'Edit Feature' : 'Add New Feature'}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmitFeature} className="space-y-4">
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div>
                                                <Label htmlFor="feature">Feature</Label>
                                                <Input
                                                    id="feature"
                                                    type="text"
                                                    value={featureData.feature}
                                                    onChange={(e) => setFeatureData('feature', e.target.value)}
                                                    placeholder="e.g., Unlimited Email Accounts"
                                                    required
                                                />
                                                {featureErrors.feature && <p className="text-sm text-red-500">{featureErrors.feature}</p>}
                                            </div>

                                            <div>
                                                <Label htmlFor="icon">Icon (optional)</Label>
                                                <Input
                                                    id="icon"
                                                    type="text"
                                                    value={featureData.icon}
                                                    onChange={(e) => setFeatureData('icon', e.target.value)}
                                                    placeholder="e.g., mail, database, shield"
                                                />
                                                {featureErrors.icon && <p className="text-sm text-red-500">{featureErrors.icon}</p>}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div>
                                                <Label htmlFor="sort_order">Sort Order</Label>
                                                <Input
                                                    id="sort_order"
                                                    type="number"
                                                    min="0"
                                                    value={featureData.sort_order}
                                                    onChange={(e) => setFeatureData('sort_order', parseInt(e.target.value))}
                                                />
                                                {featureErrors.sort_order && <p className="text-sm text-red-500">{featureErrors.sort_order}</p>}
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="is_highlighted"
                                                    checked={featureData.is_highlighted}
                                                    onCheckedChange={(checked) => setFeatureData('is_highlighted', checked as boolean)}
                                                />
                                                <Label htmlFor="is_highlighted">Highlighted Feature</Label>
                                            </div>
                                        </div>

                                        <div className="flex justify-end space-x-2">
                                            <Button type="button" variant="outline" onClick={() => { setShowAddFeatureForm(false); setEditingFeature(null); resetFeature(); }}>
                                                Cancel
                                            </Button>
                                            <Button type="submit" disabled={processingFeature}>
                                                {editingFeature ? 'Update Feature' : 'Add Feature'}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        )}

                        {product.features.length > 0 ? (
                            <div className="space-y-2">
                                {product.features.map((feature) => (
                                    <Card key={feature.id} className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                {feature.is_highlighted && (
                                                    <Star className="h-4 w-4 text-yellow-500" />
                                                )}
                                                <div>
                                                    <div className="font-medium">{feature.feature}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        Order: {feature.sort_order}
                                                        {feature.icon && ` • Icon: ${feature.icon}`}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEditFeature(feature)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDeleteFeature(feature.id)}
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
                                No features configured. Add some features to get started.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

