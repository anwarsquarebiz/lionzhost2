import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { type PageProps } from '@inertiajs/core';
import { useMemo, useState } from 'react';

type DomainDetailsProps = PageProps & {
	domain: {
		id: number;
		domain: string;
		status: string;
		expires_at?: string | null;
		auto_renewal: boolean;
		privacy_protection: boolean;
		nameservers: string[] | null;
	};
};

export default function DomainDetails() {
	const page = usePage<DomainDetailsProps>();
	const d = page.props.domain;
	const [nameservers, setNameservers] = useState<string[]>(
		(d.nameservers && d.nameservers.length ? d.nameservers : ['', '']) as string[],
	);
	const [privacy, setPrivacy] = useState<boolean>(!!d.privacy_protection);
	const [loading, setLoading] = useState<string | null>(null);
	const [epp, setEpp] = useState<string | null>(null);
	const [years, setYears] = useState<number>(1);

	const breadcrumbs: BreadcrumbItem[] = useMemo(
		() => [
			{ title: 'My Domains', href: '/my/domains' },
			{ title: d.domain, href: `/my/domains/${d.id}` },
		],
		[d],
	);

	const submitNameservers = () => {
		setLoading('ns');
		router.put(
			`/my/domains/${d.id}/nameservers`,
			{ nameservers: nameservers.filter((v) => v.trim().length > 0) },
			{
				preserveScroll: true,
				onFinish: () => setLoading(null),
				onSuccess: () => {},
			},
		);
	};

	const togglePrivacy = (next: boolean) => {
		setLoading('privacy');
		router.put(
			`/my/domains/${d.id}/privacy`,
			{ enable: next },
			{
				preserveScroll: true,
				onFinish: () => setLoading(null),
				onSuccess: () => setPrivacy(next),
			},
		);
	};

	const lock = () => {
		setLoading('lock');
		router.put(`/my/domains/${d.id}/lock`, {}, { preserveScroll: true, onFinish: () => setLoading(null) });
	};
	const unlock = () => {
		setLoading('unlock');
		router.put(`/my/domains/${d.id}/unlock`, {}, { preserveScroll: true, onFinish: () => setLoading(null) });
	};

	const fetchEpp = () => {
		setLoading('epp');
		fetch(`/my/domains/${d.id}/epp`, { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
			.then((r) => r.json())
			.then((j) => setEpp(j.auth_code ?? null))
			.finally(() => setLoading(null));
	};

	const renew = () => {
		setLoading('renew');
		router.post(
			`/my/domains/${d.id}/renew`,
			{ years },
			{
				preserveScroll: true,
				onFinish: () => setLoading(null),
			},
		);
	};

	const setNs = (index: number, value: string) => {
		const copy = [...nameservers];
		copy[index] = value;
		setNameservers(copy);
	};

	const addNs = () => setNameservers((prev) => [...prev, '']);
	const removeNs = (index: number) => setNameservers((prev) => prev.filter((_, i) => i !== index));

	return (
		<AppLayout breadcrumbs={breadcrumbs}>
			<Head title={`Manage ${d.domain}`} />
			<div className="flex h-full flex-1 flex-col gap-4 p-4">
				<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
					<Card>
						<CardHeader>
							<CardTitle>Domain</CardTitle>
							<CardDescription>{d.domain}</CardDescription>
						</CardHeader>
						<CardContent className="space-y-2 text-sm">
							<div className="flex items-center justify-between">
								<div>Status</div>
								<div className="capitalize">{d.status}</div>
							</div>
							<div className="flex items-center justify-between">
								<div>Auto-renew</div>
								<div>{d.auto_renewal ? 'On' : 'Off'}</div>
							</div>
							<div className="flex items-center justify-between">
								<div>Privacy</div>
								<div>{privacy ? 'On' : 'Off'}</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Privacy & Lock</CardTitle>
							<CardDescription>Toggle privacy or lock state</CardDescription>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="flex items-center gap-3">
								<button
									onClick={() => togglePrivacy(!privacy)}
									disabled={loading === 'privacy'}
									className="inline-flex rounded-md bg-primary px-3 py-2 text-white disabled:opacity-50"
								>
									{privacy ? 'Disable Privacy' : 'Enable Privacy'}
								</button>
								<button
									onClick={lock}
									disabled={loading === 'lock'}
									className="inline-flex rounded-md bg-neutral-800 px-3 py-2 text-white disabled:opacity-50 dark:bg-neutral-200 dark:text-neutral-900"
								>
									Lock
								</button>
								<button
									onClick={unlock}
									disabled={loading === 'unlock'}
									className="inline-flex rounded-md bg-neutral-800 px-3 py-2 text-white disabled:opacity-50 dark:bg-neutral-200 dark:text-neutral-900"
								>
									Unlock
								</button>
							</div>
							<div className="flex items-center gap-3">
								<button
									onClick={fetchEpp}
									disabled={loading === 'epp'}
									className="inline-flex rounded-md border px-3 py-2 disabled:opacity-50"
								>
									Get EPP/Auth code
								</button>
								{epp && <code className="rounded bg-neutral-100 px-2 py-1 text-xs dark:bg-neutral-900">{epp}</code>}
							</div>
						</CardContent>
					</Card>
				</div>

				<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
					<Card>
						<CardHeader>
							<CardTitle>Nameservers</CardTitle>
							<CardDescription>Update authoritative nameservers</CardDescription>
						</CardHeader>
						<CardContent className="space-y-3">
							{nameservers.map((ns, i) => (
								<div key={i} className="flex items-center gap-2">
									<input
										className="w-full rounded-md border px-3 py-2"
										placeholder={`ns${i + 1}.example.com`}
										value={ns}
										onChange={(e) => setNs(i, e.target.value)}
									/>
									{nameservers.length > 2 && (
										<button
											type="button"
											onClick={() => removeNs(i)}
											className="rounded-md border px-2 py-2 text-xs"
										>
											Remove
										</button>
									)}
								</div>
							))}
							<div className="flex items-center gap-3">
								<button type="button" onClick={addNs} className="rounded-md border px-3 py-2">
									Add nameserver
								</button>
								<button
									type="button"
									onClick={submitNameservers}
									disabled={loading === 'ns'}
									className="rounded-md bg-primary px-3 py-2 text-white disabled:opacity-50"
								>
									Save nameservers
								</button>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Renew Domain</CardTitle>
							<CardDescription>Add years to your registration</CardDescription>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="flex items-center gap-3">
								<select
									className="rounded-md border px-3 py-2"
									value={years}
									onChange={(e) => setYears(parseInt(e.target.value, 10))}
								>
									{Array.from({ length: 9 }).map((_, i) => (
										<option key={i + 1} value={i + 1}>
											{i + 1} year{i + 1 > 1 ? 's' : ''}
										</option>
									))}
								</select>
								<button
									onClick={renew}
									disabled={loading === 'renew'}
									className="rounded-md bg-primary px-3 py-2 text-white disabled:opacity-50"
								>
									Renew
								</button>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</AppLayout>
	);
}



