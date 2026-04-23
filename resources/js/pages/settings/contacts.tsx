import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import type { PageProps } from '@inertiajs/core';
import { useMemo, useState } from 'react';

type Contact = {
	id: number;
	type: 'registrant' | 'admin' | 'tech' | 'billing';
	first_name: string;
	last_name: string;
	email: string;
	phone?: string | null;
	organization?: string | null;
	address_line_1: string;
	address_line_2?: string | null;
	city: string;
	state: string;
	postal_code: string;
	country: string;
	is_default: boolean;
};

type ContactsPageProps = PageProps & {
	contacts: Contact[];
};

const typeLabel: Record<Contact['type'], string> = {
	registrant: 'Registrant',
	admin: 'Admin',
	tech: 'Tech',
	billing: 'Billing',
};

export default function ContactsSettings() {
	const page = usePage<ContactsPageProps>();
	const [form, setForm] = useState<Partial<Contact>>({
		type: 'registrant',
		first_name: '',
		last_name: '',
		email: '',
		address_line_1: '',
		city: '',
		state: '',
		postal_code: '',
		country: 'US',
	});
	const [loading, setLoading] = useState<string | null>(null);
	const breadcrumbs: BreadcrumbItem[] = useMemo(
		() => [
			{ title: 'Settings', href: '/settings/profile' },
			{ title: 'Contacts', href: '/settings/contacts' },
		],
		[],
	);

	const submit = () => {
		setLoading('create');
		router.post('/settings/contacts', form, {
			onFinish: () => setLoading(null),
		});
	};

	const del = (id: number) => {
		if (!confirm('Delete this contact?')) return;
		setLoading(`del-${id}`);
		router.delete(`/settings/contacts/${id}`, { onFinish: () => setLoading(null) });
	};

	const setDefault = (id: number) => {
		setLoading(`def-${id}`);
		router.put(`/settings/contacts/${id}/default`, {}, { onFinish: () => setLoading(null) });
	};

	return (
		<AppLayout breadcrumbs={breadcrumbs}>
			<Head title="Contacts" />
			<div className="flex h-full flex-1 flex-col gap-4 p-4">
				<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
					<Card>
						<CardHeader>
							<CardTitle>Contacts</CardTitle>
							<CardDescription>Manage WHOIS contacts</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="overflow-x-auto rounded-lg border">
								<table className="min-w-full text-sm">
									<thead className="bg-neutral-50 dark:bg-neutral-900/50">
										<tr>
											<th className="px-4 py-3 text-left font-medium">Type</th>
											<th className="px-4 py-3 text-left font-medium">Name</th>
											<th className="px-4 py-3 text-left font-medium">Email</th>
											<th className="px-4 py-3 text-left font-medium">Default</th>
											<th className="px-4 py-3 text-left font-medium">Actions</th>
										</tr>
									</thead>
									<tbody>
										{page.props.contacts.map((c) => (
											<tr key={c.id} className="border-t">
												<td className="px-4 py-3">{typeLabel[c.type]}</td>
												<td className="px-4 py-3">{c.first_name} {c.last_name}</td>
												<td className="px-4 py-3">{c.email}</td>
												<td className="px-4 py-3">{c.is_default ? 'Yes' : 'No'}</td>
												<td className="px-4 py-3 space-x-3">
													<button
														onClick={() => setDefault(c.id)}
														disabled={loading === `def-${c.id}` || c.is_default}
														className="rounded-md border px-2 py-1 text-xs disabled:opacity-50"
													>
														Set default
													</button>
													<button
														onClick={() => del(c.id)}
														disabled={loading === `del-${c.id}`}
														className="rounded-md border px-2 py-1 text-xs text-red-600 disabled:opacity-50"
													>
														Delete
													</button>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Add / Edit Contact</CardTitle>
							<CardDescription>Create a new contact record</CardDescription>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="grid grid-cols-2 gap-3">
								<select
									className="rounded-md border px-3 py-2"
									value={form.type ?? 'registrant'}
									onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as Contact['type'] }))}
								>
									<option value="registrant">Registrant</option>
									<option value="admin">Admin</option>
									<option value="tech">Tech</option>
									<option value="billing">Billing</option>
								</select>
								<input className="rounded-md border px-3 py-2" placeholder="First name" value={form.first_name ?? ''} onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))} />
								<input className="rounded-md border px-3 py-2" placeholder="Last name" value={form.last_name ?? ''} onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))} />
								<input className="rounded-md border px-3 py-2" placeholder="Email" value={form.email ?? ''} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
								<input className="rounded-md border px-3 py-2" placeholder="Phone" value={form.phone ?? ''} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
								<input className="rounded-md border px-3 py-2" placeholder="Organization" value={form.organization ?? ''} onChange={(e) => setForm((f) => ({ ...f, organization: e.target.value }))} />
								<input className="col-span-2 rounded-md border px-3 py-2" placeholder="Address line 1" value={form.address_line_1 ?? ''} onChange={(e) => setForm((f) => ({ ...f, address_line_1: e.target.value }))} />
								<input className="col-span-2 rounded-md border px-3 py-2" placeholder="Address line 2" value={form.address_line_2 ?? ''} onChange={(e) => setForm((f) => ({ ...f, address_line_2: e.target.value }))} />
								<input className="rounded-md border px-3 py-2" placeholder="City" value={form.city ?? ''} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
								<input className="rounded-md border px-3 py-2" placeholder="State" value={form.state ?? ''} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} />
								<input className="rounded-md border px-3 py-2" placeholder="Postal code" value={form.postal_code ?? ''} onChange={(e) => setForm((f) => ({ ...f, postal_code: e.target.value }))} />
								<input className="rounded-md border px-3 py-2" placeholder="Country (ISO-2)" value={form.country ?? 'US'} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} />
							</div>
							<div className="flex items-center gap-3">
								<button
									onClick={submit}
									disabled={loading === 'create'}
									className="rounded-md bg-primary px-3 py-2 text-white disabled:opacity-50"
								>
									Save contact
								</button>
								<Link href="/settings/profile" className="text-sm text-neutral-500 hover:underline">
									Back to profile
								</Link>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</AppLayout>
	);
}



