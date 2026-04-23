import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { type PageProps } from '@inertiajs/core';
import { ArrowLeft } from 'lucide-react';

type Message = {
    id: number;
    body: string;
    is_staff: boolean;
    created_at: string;
    user: { id: number; name: string };
};

type TicketShowProps = PageProps & {
    ticket: {
        id: number;
        subject: string;
        status: string;
        created_at: string;
        updated_at: string;
        messages: Message[];
    };
};

function statusLabel(status: string): string {
    const map: Record<string, string> = {
        awaiting_staff: 'Awaiting support',
        awaiting_customer: 'Awaiting your reply',
        closed: 'Closed',
    };
    return map[status] ?? status;
}

export default function HelpShow() {
    const page = usePage<TicketShowProps>();
    const { ticket } = page.props;

    const form = useForm({
        body: '',
    });

    const submitReply = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(`/help/tickets/${ticket.id}/messages`, {
            preserveScroll: true,
            onSuccess: () => form.reset('body'),
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Help Center', href: '/help' },
        { title: ticket.subject, href: `/help/tickets/${ticket.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={ticket.subject} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <Button variant="ghost" size="sm" className="w-fit" asChild>
                    <Link href="/help">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        All tickets
                    </Link>
                </Button>

                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">{ticket.subject}</h1>
                        <p className="text-sm text-muted-foreground">
                            Status: <span className="font-medium text-foreground">{statusLabel(ticket.status)}</span>
                            {' · '}
                            Opened {new Date(ticket.created_at).toLocaleString()}
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Conversation</CardTitle>
                        <CardDescription>Messages appear oldest to newest.</CardDescription>
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
                                            {m.is_staff ? 'LionzHost support' : m.user.name}
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
                                    <Label htmlFor="reply">Your reply</Label>
                                    <Textarea
                                        id="reply"
                                        value={form.data.body}
                                        onChange={(e) => form.setData('body', e.target.value)}
                                        rows={4}
                                        required
                                        minLength={2}
                                        placeholder="Type your message…"
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
                                This ticket is closed. If you need more help, open a new ticket from the Help Center.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
