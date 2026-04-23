import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import type { PageProps } from '@inertiajs/core';

const breadcrumbs: BreadcrumbItem[] = [
	{ title: 'My Hosting', href: '/my/hosting' },
];

type HostingItem = {
	id: number;
	domain: string;
	product?: string | null;
	status: string;
	expires_at?: string | null;
	auto_renewal: boolean;
	provider?: string | null;
};

type HostingPageProps = PageProps & {
	hosting: {
		data: HostingItem[];
		next_page_url: string | null;
		prev_page_url: string | null;
		current_page: number;
		last_page: number;
		total: number;
	};
};

export default function MyHosting() {
	const page = usePage<HostingPageProps>();
	const hosting = page.props.hosting;

	return (
		<AppLayout breadcrumbs={breadcrumbs}>
			<Head title="My Hosting" />
			<div className="flex h-full flex-1 flex-col gap-4 p-4">
				<Card>
					<CardHeader>
						<CardTitle>My Hosting</CardTitle>
						<CardDescription>Manage your hosting services</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="overflow-x-auto rounded-lg border">
							<table className="min-w-full text-sm">
								<thead className="bg-neutral-50 dark:bg-neutral-900/50">
									<tr>
										<th className="px-4 py-3 text-left font-medium">Domain</th>
										<th className="px-4 py-3 text-left font-medium">Product</th>
										<th className="px-4 py-3 text-left font-medium">Status</th>
										<th className="px-4 py-3 text-left font-medium">Expires</th>
										<th className="px-4 py-3 text-left font-medium">Auto-renew</th>
										<th className="px-4 py-3 text-left font-medium">Actions</th>
									</tr>
								</thead>
								<tbody>
									{hosting.data.length === 0 && (
										<tr>
											<td className="px-4 py-6 text-center text-neutral-500" colSpan={6}>
												No hosting services found.
											</td>
										</tr>
									)}
									{hosting.data.map((h) => (
										<tr key={h.id} className="border-t">
											<td className="px-4 py-3">{h.domain}</td>
											<td className="px-4 py-3">{h.product ?? '—'}</td>
											<td className="px-4 py-3 capitalize">{h.status}</td>
											<td className="px-4 py-3">
												{h.expires_at ? new Date(h.expires_at).toISOString().slice(0, 10) : '—'}
											</td>
											<td className="px-4 py-3">{h.auto_renewal ? 'On' : 'Off'}</td>
											<td className="px-4 py-3">
												<Link className="text-primary hover:underline" href={`/my/hosting/${h.id}`}>
													Manage
												</Link>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						<div className="mt-4 flex items-center justify-between text-sm">
							<div>
								Page {hosting.current_page} of {hosting.last_page} • {hosting.total} total
							</div>
							<div className="space-x-3">
								{hosting.prev_page_url && (
									<Link className="text-primary hover:underline" href={hosting.prev_page_url}>
										Previous
									</Link>
								)}
								{hosting.next_page_url && (
									<Link className="text-primary hover:underline" href={hosting.next_page_url}>
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



