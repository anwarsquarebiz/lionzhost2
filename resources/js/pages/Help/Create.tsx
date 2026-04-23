import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Help Center', href: '/help' },
    { title: 'New ticket', href: '/help/tickets/create' },
];

export default function HelpCreate() {
    const form = useForm({
        subject: '',
        body: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/help/tickets');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="New support ticket" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <Button variant="ghost" size="sm" className="w-fit" asChild>
                    <Link href="/help">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to tickets
                    </Link>
                </Button>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>New ticket</CardTitle>
                        <CardDescription>
                            Describe your issue. Our team will reply in this thread.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="subject">Subject</Label>
                                <Input
                                    id="subject"
                                    value={form.data.subject}
                                    onChange={(e) => form.setData('subject', e.target.value)}
                                    required
                                    maxLength={255}
                                    placeholder="e.g. Cannot update nameservers for example.com"
                                />
                                {form.errors.subject && (
                                    <p className="text-sm text-destructive">{form.errors.subject}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="body">Message</Label>
                                <Textarea
                                    id="body"
                                    value={form.data.body}
                                    onChange={(e) => form.setData('body', e.target.value)}
                                    required
                                    rows={10}
                                    placeholder="Include relevant domain names, order IDs, and what you have already tried."
                                />
                                {form.errors.body && <p className="text-sm text-destructive">{form.errors.body}</p>}
                            </div>
                            <div className="flex gap-3">
                                <Button type="submit" disabled={form.processing}>
                                    {form.processing ? 'Submitting…' : 'Submit ticket'}
                                </Button>
                                <Button type="button" variant="outline" asChild>
                                    <Link href="/help">Cancel</Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
