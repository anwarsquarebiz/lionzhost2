import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin/tlds' },
    { title: 'EPP Poll Inbox', href: '/admin/epp-poll' },
];

export default function EppPoll() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="EPP Poll Inbox" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>EPP Poll Inbox</CardTitle>
                        <CardDescription>View EPP registry messages</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="relative min-h-[400px] overflow-hidden rounded-xl border">
                            <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}








