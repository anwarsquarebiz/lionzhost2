import PublicLayout from '@/layouts/public-layout';
import { Link } from '@inertiajs/react';
import { Globe, Server, Shield, Headphones } from 'lucide-react';

const sectionClass = 'space-y-3 text-gray-700 leading-relaxed';
const h2Class = 'text-xl font-semibold text-[#0c112a] mb-3';

export default function PublicAbout() {
    return (
        <PublicLayout title="About Us — LionzHost">
            <section className="bg-gradient-to-br from-[#0c112a] to-[#1a1f3a] text-white py-16 md:py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">About LionzHost</h1>
                    <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                        We help individuals and businesses get online with domains, hosting, and security—backed by a
                        team focused on clarity and reliable support.
                    </p>
                </div>
            </section>

            <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-10">
                <section className={sectionClass}>
                    <h2 className={h2Class}>Who we are</h2>
                    <p>
                        <strong className="text-gray-900">LionzHost</strong> is a digital services brand focused on
                        domain names, web hosting, virtual and dedicated servers, and SSL certificates. We aim to make
                        ordering and managing these services straightforward, whether you are launching your first site
                        or running production workloads.
                    </p>
                </section>

                <section className={sectionClass}>
                    <h2 className={h2Class}>What we offer</h2>
                    <ul className="list-none space-y-4">
                        <li className="flex gap-3">
                            <Globe className="h-5 w-5 shrink-0 text-[#6eda78] mt-0.5" aria-hidden />
                            <span>
                                <strong className="text-gray-900">Domains</strong> — search, register, and manage
                                domains with transparent pricing and tools aligned to registry and registrar
                                requirements.
                            </span>
                        </li>
                        <li className="flex gap-3">
                            <Server className="h-5 w-5 shrink-0 text-[#6eda78] mt-0.5" aria-hidden />
                            <span>
                                <strong className="text-gray-900">Hosting &amp; infrastructure</strong> — shared
                                hosting, VPS, and dedicated server options designed for different performance and
                                control needs.
                            </span>
                        </li>
                        <li className="flex gap-3">
                            <Shield className="h-5 w-5 shrink-0 text-[#6eda78] mt-0.5" aria-hidden />
                            <span>
                                <strong className="text-gray-900">SSL certificates</strong> — help you protect visitor
                                data and meet common browser and compliance expectations.
                            </span>
                        </li>
                        <li className="flex gap-3">
                            <Headphones className="h-5 w-5 shrink-0 text-[#6eda78] mt-0.5" aria-hidden />
                            <span>
                                <strong className="text-gray-900">Customer experience</strong> — self-service flows for
                                cart and checkout, plus human support when you need help with your account or services.
                            </span>
                        </li>
                    </ul>
                </section>

                <section className={sectionClass}>
                    <h2 className={h2Class}>Our parent company</h2>
                    <p>
                        LionzHost is operated by <strong className="text-gray-900">Rovos International WLL</strong>,
                        our parent company registered in the Kingdom of Bahrain. Rovos International WLL provides the
                        corporate structure and governance behind the LionzHost brand.
                    </p>
                </section>

                <section className={sectionClass}>
                    <h2 className={h2Class}>Get in touch</h2>
                    <p>
                        For office address, map, and our primary contact email, visit our{' '}
                        <Link href="/contact" className="font-medium text-[#6eda78] hover:text-[#5bc66a] underline">
                            Contact
                        </Link>{' '}
                        page. For legal terms and how we handle personal data, see our{' '}
                        <Link href="/terms" className="font-medium text-[#6eda78] hover:text-[#5bc66a] underline">
                            Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link href="/privacy" className="font-medium text-[#6eda78] hover:text-[#5bc66a] underline">
                            Privacy Policy
                        </Link>
                        .
                    </p>
                </section>
            </article>
        </PublicLayout>
    );
}
