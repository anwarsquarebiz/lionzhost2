import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

type Message = {
    id: number;
    body: string;
    is_staff: boolean;
    created_at: string;
    user: { id: number; name: string };
};

type UserBrief = {
    id: number;
    name: string;
    email: string;
};

interface Props {
    ticket: {
        id: number;
        subject: string;
        status: string;
        created_at: string;
        updated_at: string;
        user: UserBrief;
        messages: Message[];
    };
}

export default function SupportTicketsShow({ ticket }: Props) {
    const form = useForm({
        body: '',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin', href: '/admin/tlds' },
        { title: 'Support Tickets', href: '/admin/support-tickets' },
        { title: `#${ticket.id}`, href: `/admin/support-tickets/${ticket.id}` },
    ];

    const submitReply = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(`/admin/support-tickets/${ticket.id}/messages`, {
            preserveScroll: true,
            onSuccess: () => form.reset('body'),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Ticket #${ticket.id}`} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <Button variant="ghost" size="sm" className="w-fit" asChild>
                    <Link href="/admin/support-tickets">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        All tickets
                    </Link>
                </Button>

                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">{ticket.subject}</h1>
                        <p className="text-sm text-muted-foreground">
                            Ticket #{ticket.id} · {ticket.user.name} ({ticket.user.email})
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Status: <span className="font-medium capitalize text-foreground">{ticket.status.replace(/_/g, ' ')}</span>
                            {' · '}
                            Updated {new Date(ticket.updated_at).toLocaleString()}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {ticket.status !== 'closed' ? (
                            <Button variant="outline" asChild>
                                <Link href={`/admin/support-tickets/${ticket.id}/close`} method="post" as="button">
                                    Close ticket
                                </Link>
                            </Button>
                        ) : (
                            <Button variant="outline" asChild>
                                <Link href={`/admin/support-tickets/${ticket.id}/reopen`} method="post" as="button">
                                    Reopen ticket
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Thread</CardTitle>
                        <CardDescription>Customer messages on the left; staff on the right.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="max-h-[min(60vh,520px)] space-y-4 overflow-y-auto rounded-lg border bg-muted/20 p-4">
                            {ticket.messages.map((m) => (
                                <div
                                    key={m.id}
                                    className={`flex flex-col gap-1 rounded-lg border p-3 text-sm ${
                                        m.is_staff
                                            ? 'ml-0 mr-4 border-primary/30 bg-primary/5 md:ml-8'
                                            : 'ml-4 mr-0 border-border bg-card md:mr-8'
                                    }`}
                                >
                                    <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs text-muted-foreground">
                                        <span className="font-medium text-foreground">
                                            {m.is_staff ? `${m.user.name} (staff)` : m.user.name}
                                        </span>
                                        <span>{new Date(m.created_at).toLocaleString()}</span>
                                    </div>
                                    <p className="whitespace-pre-wrap text-foreground">{m.body}</p>
                                </div>
                            ))}
                        </div>

                        {ticket.status !== 'closed' ? (
                            <form onSubmit={submitReply} className="space-y-3 border-t pt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="reply">Staff reply</Label>
                                    <Textarea
                                        id="reply"
                                        value={form.data.body}
                                        onChange={(e) => form.setData('body', e.target.value)}
                                        rows={4}
                                        required
                                        placeholder="Your reply to the customer…"
                                    />
                                    {form.errors.body && (
                                        <p className="text-sm text-destructive">{form.errors.body}</p>
                                    )}
                                </div>
                                <Button type="submit" disabled={form.processing}>
                                    {form.processing ? 'Sending…' : 'Send reply'}
                                </Button>
                            </form>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                Ticket is closed. Reopen to add more messages.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
