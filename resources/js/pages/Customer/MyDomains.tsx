import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { type PageProps } from '@inertiajs/core';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'My Domains', href: '/my/domains' },
];

type DomainItem = {
	id: number;
	domain: string;
	status: string;
	expires_at?: string | null;
	auto_renewal: boolean;
	privacy_protection: boolean;
	nameservers: string[] | null;
};

type DomainsPageProps = PageProps & {
	domains: {
		data: DomainItem[];
		next_page_url: string | null;
		prev_page_url: string | null;
		current_page: number;
		last_page: number;
		total: number;
	};
};

export default function MyDomains() {
	const page = usePage<DomainsPageProps>();
	const domains = page.props.domains;

	return (
		<AppLayout breadcrumbs={breadcrumbs}>
			<Head title="My Domains" />
			<div className="flex h-full flex-1 flex-col gap-4 p-4">
				<Card>
					<CardHeader>
						<CardTitle>My Domains</CardTitle>
						<CardDescription>Manage your registered domains</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="overflow-x-auto rounded-lg border">
							<table className="min-w-full text-sm">
								<thead className="bg-neutral-50 dark:bg-neutral-900/50">
									<tr>
										<th className="px-4 py-3 text-left font-medium">Domain</th>
										<th className="px-4 py-3 text-left font-medium">Status</th>
										<th className="px-4 py-3 text-left font-medium">Expires</th>
										<th className="px-4 py-3 text-left font-medium">Auto-renew</th>
										<th className="px-4 py-3 text-left font-medium">Privacy</th>
										<th className="px-4 py-3 text-left font-medium">Actions</th>
									</tr>
								</thead>
								<tbody>
									{domains.data.length === 0 && (
										<tr>
											<td className="px-4 py-6 text-center text-neutral-500" colSpan={6}>
												No domains found.
											</td>
										</tr>
									)}
									{domains.data.map((d) => (
										<tr key={d.id} className="border-t">
											<td className="px-4 py-3">{d.domain}</td>
											<td className="px-4 py-3 capitalize">{d.status}</td>
											<td className="px-4 py-3">
												{d.expires_at ? new Date(d.expires_at).toISOString().slice(0, 10) : '—'}
											</td>
											<td className="px-4 py-3">{d.auto_renewal ? 'On' : 'Off'}</td>
											<td className="px-4 py-3">{d.privacy_protection ? 'On' : 'Off'}</td>
											<td className="px-4 py-3">
												<Link
													className="text-primary hover:underline"
													href={`/my/domains/${d.id}`}
												>
													Manage
												</Link>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						{/* Simple pagination */}
						<div className="mt-4 flex items-center justify-between text-sm">
							<div>
								Page {domains.current_page} of {domains.last_page} • {domains.total} total
							</div>
							<div className="space-x-3">
								{domains.prev_page_url && (
									<Link className="text-primary hover:underline" href={domains.prev_page_url}>
										Previous
									</Link>
								)}
								{domains.next_page_url && (
									<Link className="text-primary hover:underline" href={domains.next_page_url}>
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







