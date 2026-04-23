import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import type { PageProps } from '@inertiajs/core';
import { useMemo, useState } from 'react';

type HostingDetailsProps = PageProps & {
	service: {
		id: number;
		domain: string;
		product?: string | null;
		status: string;
		expires_at?: string | null;
		auto_renewal: boolean;
		provider?: string | null;
		provider_order_id?: string | null;
		features?: Record<string, unknown> | null;
	};
};

export default function HostingDetails() {
	const page = usePage<HostingDetailsProps>();
	const svc = page.props.service;
	const [autoRenew, setAutoRenew] = useState<boolean>(!!svc.auto_renewal);
	const [loading, setLoading] = useState<string | null>(null);

	const breadcrumbs: BreadcrumbItem[] = useMemo(
		() => [
			{ title: 'My Hosting', href: '/my/hosting' },
			{ title: svc.domain, href: `/my/hosting/${svc.id}` },
		],
		[svc],
	);

	const toggleAuto = (next: boolean) => {
		setLoading('auto');
		router.put(
			`/my/hosting/${svc.id}/auto-renewal`,
			{ enable: next },
			{ preserveScroll: true, onFinish: () => setLoading(null), onSuccess: () => setAutoRenew(next) },
		);
	};

	return (
		<AppLayout breadcrumbs={breadcrumbs}>
			<Head title={`Manage ${svc.domain}`} />
			<div className="flex h-full flex-1 flex-col gap-4 p-4">
				<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
					<Card>
						<CardHeader>
							<CardTitle>Service</CardTitle>
							<CardDescription>{svc.domain}</CardDescription>
						</CardHeader>
						<CardContent className="space-y-2 text-sm">
							<div className="flex items-center justify-between">
								<div>Product</div>
								<div>{svc.product ?? '—'}</div>
							</div>
							<div className="flex items-center justify-between">
								<div>Status</div>
								<div className="capitalize">{svc.status}</div>
							</div>
							<div className="flex items-center justify-between">
								<div>Expires</div>
								<div>{svc.expires_at ? new Date(svc.expires_at).toISOString().slice(0, 10) : '—'}</div>
							</div>
							<div className="flex items-center justify-between">
								<div>Auto-renew</div>
								<div>{autoRenew ? 'On' : 'Off'}</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Renewal</CardTitle>
							<CardDescription>Toggle auto-renew</CardDescription>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="flex items-center gap-3">
								<button
									onClick={() => toggleAuto(!autoRenew)}
									disabled={loading === 'auto'}
									className="inline-flex rounded-md bg-primary px-3 py-2 text-white disabled:opacity-50"
								>
									{autoRenew ? 'Disable Auto-renew' : 'Enable Auto-renew'}
								</button>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</AppLayout>
	);
}



