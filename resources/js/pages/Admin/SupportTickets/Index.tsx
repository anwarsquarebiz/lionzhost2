import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, Search } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin/tlds' },
    { title: 'Support Tickets', href: '/admin/support-tickets' },
];

type UserBrief = {
    id: number;
    name: string;
    email: string;
};

type TicketRow = {
    id: number;
    subject: string;
    status: string;
    updated_at: string;
    created_at: string;
    user: UserBrief;
};

interface Props {
    tickets: {
        data: TicketRow[];
        current_page: number;
        last_page: number;
        total: number;
        prev_page_url: string | null;
        next_page_url: string | null;
    };
    filters: {
        status?: string;
        search?: string;
    };
    statuses: Record<string, string>;
}

function statusBadge(status: string): string {
    const map: Record<string, string> = {
        awaiting_staff: 'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100',
        awaiting_customer: 'bg-sky-100 text-sky-900 dark:bg-sky-900/40 dark:text-sky-100',
        closed: 'bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
    };
    return map[status] ?? 'bg-neutral-100 text-neutral-800';
}

export default function SupportTicketsIndex({ tickets, filters, statuses }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');

    const applyFilters = () => {
        router.get(
            '/admin/support-tickets',
            {
                search: search || undefined,
                status: status || undefined,
            },
            { preserveState: true },
        );
    };

    const resetFilters = () => {
        setSearch('');
        setStatus('');
        router.get('/admin/support-tickets', {}, { preserveState: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Support Tickets" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Support tickets</CardTitle>
                        <CardDescription>Reply to customers and manage ticket status.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
                            <div className="min-w-[200px] flex-1 space-y-2">
                                <label className="text-sm font-medium">Search</label>
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        className="pl-9"
                                        placeholder="Subject, name, or email…"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), applyFilters())}
                                    />
                                </div>
                            </div>
                            <div className="w-full min-w-[160px] space-y-2 sm:w-48">
                                <label className="text-sm font-medium">Status</label>
                                <Select value={status || '__all__'} onValueChange={(v) => setStatus(v === '__all__' ? '' : v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="__all__">All statuses</SelectItem>
                                        {Object.entries(statuses).map(([value, label]) => (
                                            <SelectItem key={value} value={value}>
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex gap-2">
                                <Button type="button" onClick={applyFilters}>
                                    Apply
                                </Button>
                                <Button type="button" variant="outline" onClick={resetFilters}>
                                    Reset
                                </Button>
                            </div>
                        </div>

                        <div className="overflow-x-auto rounded-lg border">
                            <table className="min-w-full text-sm">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium">ID</th>
                                        <th className="px-4 py-3 text-left font-medium">Customer</th>
                                        <th className="px-4 py-3 text-left font-medium">Subject</th>
                                        <th className="px-4 py-3 text-left font-medium">Status</th>
                                        <th className="px-4 py-3 text-left font-medium">Updated</th>
                                        <th className="px-4 py-3 text-left font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tickets.data.length === 0 && (
                                        <tr>
                                            <td className="px-4 py-8 text-center text-muted-foreground" colSpan={6}>
                                                No tickets match your filters.
                                            </td>
                                        </tr>
                                    )}
                                    {tickets.data.map((t) => (
                                        <tr key={t.id} className="border-t">
                                            <td className="px-4 py-3 font-mono text-muted-foreground">#{t.id}</td>
                                            <td className="px-4 py-3">
                                                <div className="font-medium">{t.user.name}</div>
                                                <div className="text-xs text-muted-foreground">{t.user.email}</div>
                                            </td>
                                            <td className="max-w-xs truncate px-4 py-3">{t.subject}</td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadge(t.status)}`}
                                                >
                                                    {statuses[t.status] ?? t.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {new Date(t.updated_at).toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Link
                                                    className="inline-flex items-center gap-1 text-primary hover:underline"
                                                    href={`/admin/support-tickets/${t.id}`}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    Open
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <div>
                                Page {tickets.current_page} of {tickets.last_page} · {tickets.total} total
                            </div>
                            <div className="space-x-3">
                                {tickets.prev_page_url && (
                                    <Link className="text-primary hover:underline" href={tickets.prev_page_url}>
                                        Previous
                                    </Link>
                                )}
                                {tickets.next_page_url && (
                                    <Link className="text-primary hover:underline" href={tickets.next_page_url}>
                                        Next
                                    </Link>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
