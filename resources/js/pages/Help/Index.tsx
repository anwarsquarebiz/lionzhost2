import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { type PageProps } from '@inertiajs/core';
import { Plus } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Help Center', href: '/help' },
];

type TicketRow = {
    id: number;
    subject: string;
    status: string;
    updated_at: string;
    created_at: string;
};

type TicketsPageProps = PageProps & {
    tickets: {
        data: TicketRow[];
        current_page: number;
        last_page: number;
        total: number;
        prev_page_url: string | null;
        next_page_url: string | null;
    };
};

function statusBadge(status: string): string {
    const map: Record<string, string> = {
        awaiting_staff: 'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100',
        awaiting_customer: 'bg-sky-100 text-sky-900 dark:bg-sky-900/40 dark:text-sky-100',
        closed: 'bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
    };
    return map[status] ?? 'bg-neutral-100 text-neutral-800';
}

function statusLabel(status: string): string {
    const map: Record<string, string> = {
        awaiting_staff: 'Awaiting support',
        awaiting_customer: 'Awaiting your reply',
        closed: 'Closed',
    };
    return map[status] ?? status;
}

export default function HelpIndex() {
    const page = usePage<TicketsPageProps>();
    const { tickets } = page.props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Help Center" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Help Center</h1>
                        <p className="text-sm text-muted-foreground">Open a ticket or continue an existing conversation.</p>
                    </div>
                    <Button asChild>
                        <Link href="/help/tickets/create">
                            <Plus className="mr-2 h-4 w-4" />
                            New ticket
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Your tickets</CardTitle>
                        <CardDescription>Only you and our support team can see these threads.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto rounded-lg border">
                            <table className="min-w-full text-sm">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium">Subject</th>
                                        <th className="px-4 py-3 text-left font-medium">Status</th>
                                        <th className="px-4 py-3 text-left font-medium">Updated</th>
                                        <th className="px-4 py-3 text-left font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tickets.data.length === 0 && (
                                        <tr>
                                            <td className="px-4 py-8 text-center text-muted-foreground" colSpan={4}>
                                                No tickets yet. Start one to reach our team.
                                            </td>
                                        </tr>
                                    )}
                                    {tickets.data.map((t) => (
                                        <tr key={t.id} className="border-t">
                                            <td className="max-w-xs truncate px-4 py-3 font-medium">{t.subject}</td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadge(t.status)}`}
                                                >
                                                    {statusLabel(t.status)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {new Date(t.updated_at).toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Link className="text-primary hover:underline" href={`/help/tickets/${t.id}`}>
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
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
