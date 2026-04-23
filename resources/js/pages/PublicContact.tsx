import PublicLayout from '@/layouts/public-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, MapPin, Building2, ExternalLink } from 'lucide-react';

interface Props {
    contactEmail: string;
}

const ADDRESS_LINES = [
    'Flat/Shop No. - 1, Building - 201, Road - 505, Block - 305',
    'Area - Manama Center',
    'Bahrain',
] as const;

const FULL_ADDRESS = ADDRESS_LINES.join(', ');

export default function PublicContact({ contactEmail }: Props) {
    const mapsEmbedSrc = `https://maps.google.com/maps?q=${encodeURIComponent(FULL_ADDRESS)}&output=embed`;
    const mapsOpenHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(FULL_ADDRESS)}`;

    return (
        <PublicLayout title="Contact Us — LionzHost">
            <section className="bg-gradient-to-br from-[#0c112a] to-[#1a1f3a] text-white py-16 md:py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
                    <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                        Reach our team by email or visit our registered office in Manama. LionzHost is operated by{' '}
                        <span className="text-[#6eda78] font-medium">Rovos International WLL</span>, our parent company.
                    </p>
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-start">
                    <div className="space-y-6">
                        <Card className="border-gray-200 shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-[#0c112a]">
                                    <Building2 className="h-5 w-5 text-[#6eda78]" />
                                    Parent company
                                </CardTitle>
                                <CardDescription>Legal entity</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-lg font-semibold text-gray-900">Rovos International WLL</p>
                            </CardContent>
                        </Card>

                        <Card className="border-gray-200 shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-[#0c112a]">
                                    <Mail className="h-5 w-5 text-[#6eda78]" />
                                    Email
                                </CardTitle>
                                <CardDescription>Primary way to reach us</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <a
                                    href={`mailto:${contactEmail}`}
                                    className="text-lg font-medium text-blue-600 hover:text-blue-800 hover:underline break-all"
                                >
                                    {contactEmail}
                                </a>
                            </CardContent>
                        </Card>

                        <Card className="border-gray-200 shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-[#0c112a]">
                                    <MapPin className="h-5 w-5 text-[#6eda78]" />
                                    Address
                                </CardTitle>
                                <CardDescription>Registered office</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <address className="not-italic text-gray-700 leading-relaxed">
                                    {ADDRESS_LINES.map((line) => (
                                        <span key={line} className="block">
                                            {line}
                                        </span>
                                    ))}
                                </address>
                                <a
                                    href={mapsOpenHref}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-sm font-medium text-[#6eda78] hover:text-[#5bc66a]"
                                >
                                    Open in Google Maps
                                    <ExternalLink className="h-4 w-4" />
                                </a>
                            </CardContent>
                        </Card>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold text-[#0c112a] mb-4">Location map</h2>
                        <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm bg-gray-100 aspect-[4/3] min-h-[320px]">
                            <iframe
                                title="Rovos International WLL — office location on Google Maps"
                                src={mapsEmbedSrc}
                                className="h-full w-full border-0"
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                allowFullScreen
                            />
                        </div>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
