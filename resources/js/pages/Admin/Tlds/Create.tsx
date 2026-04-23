import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin/tlds' },
    { title: 'TLDs', href: '/admin/tlds' },
    { title: 'Create', href: '#' },
];

export default function CreateTld() {
    const { data, setData, post, processing, errors } = useForm({
        extension: '',
        name: '',
        registry_operator: 'centralnic',
        is_active: true,
        min_years: 1,
        max_years: 10,
        auto_renewal: true,
        privacy_protection: true,
        dns_management: true,
        email_forwarding: false,
        id_protection: false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/tlds');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create TLD" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Create New TLD</CardTitle>
                        <CardDescription>Add a new top-level domain</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="extension">Extension *</Label>
                                    <Input
                                        id="extension"
                                        value={data.extension}
                                        onChange={(e) => setData('extension', e.target.value)}
                                        placeholder="com"
                                        required
                                    />
                                    {errors.extension && <p className="text-sm text-red-500">{errors.extension}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="name">Name *</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Commercial"
                                        required
                                    />
                                    {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="registry_operator">Registry Operator *</Label>
                                    <Select 
                                        value={data.registry_operator} 
                                        onValueChange={(value) => setData('registry_operator', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select registry" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="centralnic">CentralNic</SelectItem>
                                            <SelectItem value="resellerclub">ResellerClub</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.registry_operator && <p className="text-sm text-red-500">{errors.registry_operator}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label>Status</Label>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="is_active"
                                            checked={data.is_active}
                                            onCheckedChange={(checked) => setData('is_active', checked as boolean)}
                                        />
                                        <Label htmlFor="is_active" className="font-normal">Active</Label>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="min_years">Min Years</Label>
                                    <Input
                                        id="min_years"
                                        type="number"
                                        value={data.min_years}
                                        onChange={(e) => setData('min_years', parseInt(e.target.value))}
                                        min="1"
                                        max="10"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="max_years">Max Years</Label>
                                    <Input
                                        id="max_years"
                                        type="number"
                                        value={data.max_years}
                                        onChange={(e) => setData('max_years', parseInt(e.target.value))}
                                        min="1"
                                        max="10"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Label>Features</Label>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="auto_renewal"
                                            checked={data.auto_renewal}
                                            onCheckedChange={(checked) => setData('auto_renewal', checked as boolean)}
                                        />
                                        <Label htmlFor="auto_renewal" className="font-normal">Auto Renewal</Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="privacy_protection"
                                            checked={data.privacy_protection}
                                            onCheckedChange={(checked) => setData('privacy_protection', checked as boolean)}
                                        />
                                        <Label htmlFor="privacy_protection" className="font-normal">Privacy Protection</Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="dns_management"
                                            checked={data.dns_management}
                                            onCheckedChange={(checked) => setData('dns_management', checked as boolean)}
                                        />
                                        <Label htmlFor="dns_management" className="font-normal">DNS Management</Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="email_forwarding"
                                            checked={data.email_forwarding}
                                            onCheckedChange={(checked) => setData('email_forwarding', checked as boolean)}
                                        />
                                        <Label htmlFor="email_forwarding" className="font-normal">Email Forwarding</Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="id_protection"
                                            checked={data.id_protection}
                                            onCheckedChange={(checked) => setData('id_protection', checked as boolean)}
                                        />
                                        <Label htmlFor="id_protection" className="font-normal">ID Protection</Label>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-4">
                                <Button type="button" variant="outline" onClick={() => window.history.back()}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}








