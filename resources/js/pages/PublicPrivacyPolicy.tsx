import PublicLayout from '@/layouts/public-layout';
import { Link } from '@inertiajs/react';

interface Props {
    contactEmail: string;
}

const sectionClass = 'space-y-3 text-gray-700 leading-relaxed';
const h2Class = 'text-xl font-semibold text-[#0c112a] mb-3';

export default function PublicPrivacyPolicy({ contactEmail }: Props) {
    return (
        <PublicLayout title="Privacy Policy — LionzHost">
            <section className="bg-gradient-to-br from-[#0c112a] to-[#1a1f3a] text-white py-16 md:py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
                    <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                        How LionzHost (operated by Rovos International WLL) collects, uses, and protects personal
                        information when you use our website and services.
                    </p>
                    <p className="text-sm text-gray-400 mt-4">Last updated: April 24, 2026</p>
                </div>
            </section>

            <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-10">
                <section className={sectionClass}>
                    <h2 className={h2Class}>1. Who this policy covers</h2>
                    <p>
                        This policy applies to visitors of the LionzHost website and customers who create an account or
                        purchase services from us. LionzHost is operated by <strong className="text-gray-900">Rovos
                        International WLL</strong>, with a registered office in Manama, Kingdom of Bahrain (see our{' '}
                        <Link href="/contact" className="text-[#6eda78] hover:text-[#5bc66a] underline">
                            Contact
                        </Link>{' '}
                        page for the full address).
                    </p>
                </section>

                <section className={sectionClass}>
                    <h2 className={h2Class}>2. Information we collect</h2>
                    <p>We may process categories of information including:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>
                            <strong className="text-gray-900">Account and identity</strong> — name, email address,
                            password (stored in hashed form), and similar credentials you provide when registering or
                            updating your profile.
                        </li>
                        <li>
                            <strong className="text-gray-900">Billing and transactions</strong> — billing address,
                            payment-related references, order history, and invoices. Card data is handled by our payment
                            partners according to their certifications; we do not store full card numbers on our servers.
                        </li>
                        <li>
                            <strong className="text-gray-900">Domain and technical contacts</strong> — information
                            required for domain registration, renewal, and DNS services, including contact details that
                            may be submitted to registries and WHOIS (or privacy/redaction services) as required by
                            applicable policies.
                        </li>
                        <li>
                            <strong className="text-gray-900">Support and communications</strong> — messages you send us,
                            support tickets, and metadata needed to respond and improve service quality.
                        </li>
                        <li>
                            <strong className="text-gray-900">Usage and device</strong> — IP address, browser type,
                            approximate location derived from IP, pages viewed, and similar technical data collected
                            through logs, cookies, or analytics tools we use to secure and improve the platform.
                        </li>
                    </ul>
                </section>

                <section className={sectionClass}>
                    <h2 className={h2Class}>3. How we use your information</h2>
                    <p>We use personal data to:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Provide, bill, and support the services you order (domains, hosting, SSL, related add-ons).</li>
                        <li>Authenticate you, prevent fraud and abuse, and comply with legal obligations.</li>
                        <li>Communicate about your account, renewals, incidents, and (where permitted) relevant offers.</li>
                        <li>Maintain and improve our systems, security, and user experience.</li>
                    </ul>
                </section>

                <section className={sectionClass}>
                    <h2 className={h2Class}>4. Legal bases (where applicable)</h2>
                    <p>
                        Depending on your location, we may rely on performance of a contract, legitimate interests (such
                        as fraud prevention and service improvement), consent (e.g. certain marketing cookies or messages),
                        or legal obligation as the basis for processing.
                    </p>
                </section>

                <section className={sectionClass}>
                    <h2 className={h2Class}>5. Sharing and processors</h2>
                    <p>We may share data with:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>
                            <strong className="text-gray-900">Registries and registrar infrastructure</strong> — as
                            required to register and maintain domains.
                        </li>
                        <li>
                            <strong className="text-gray-900">Payment and fraud providers</strong> — to process
                            payments and reduce risk.
                        </li>
                        <li>
                            <strong className="text-gray-900">Hosting and infrastructure partners</strong> — where
                            services are provisioned on third-party platforms.
                        </li>
                        <li>
                            <strong className="text-gray-900">Professional advisers and authorities</strong> — when
                            required by law or to protect our rights and users.
                        </li>
                    </ul>
                    <p>We require service providers to protect personal data and use it only for the purposes we specify.</p>
                </section>

                <section className={sectionClass}>
                    <h2 className={h2Class}>6. International transfers</h2>
                    <p>
                        Your information may be processed in Bahrain and in other countries where our providers operate.
                        Where required, we use appropriate safeguards such as contractual clauses or equivalent mechanisms.
                    </p>
                </section>

                <section className={sectionClass}>
                    <h2 className={h2Class}>7. Retention</h2>
                    <p>
                        We retain personal data for as long as your account is active, as needed to provide services,
                        resolve disputes, and meet legal, tax, and accounting requirements (including registry retention
                        rules for domain data).
                    </p>
                </section>

                <section className={sectionClass}>
                    <h2 className={h2Class}>8. Your choices and rights</h2>
                    <p>
                        You may be able to access, correct, or delete certain information through your account settings.
                        You may also have rights under local law to object to processing, request restriction or
                        portability, or withdraw consent where processing is consent-based. To exercise rights or ask
                        questions, contact us at{' '}
                        <a href={`mailto:${contactEmail}`} className="text-[#6eda78] hover:text-[#5bc66a] underline break-all">
                            {contactEmail}
                        </a>
                        . We will respond within a reasonable period as required by applicable law.
                    </p>
                </section>

                <section className={sectionClass}>
                    <h2 className={h2Class}>9. Cookies</h2>
                    <p>
                        We use cookies and similar technologies for session management, security, preferences, and
                        analytics. You can control cookies through your browser settings; disabling some cookies may
                        affect how the site or checkout works.
                    </p>
                </section>

                <section className={sectionClass}>
                    <h2 className={h2Class}>10. Security</h2>
                    <p>
                        We implement technical and organizational measures appropriate to the nature of the data we
                        process. No method of transmission over the Internet is completely secure; we encourage strong
                        passwords and two-factor authentication where available.
                    </p>
                </section>

                <section className={sectionClass}>
                    <h2 className={h2Class}>11. Children</h2>
                    <p>
                        Our services are not directed at children under 16. We do not knowingly collect personal
                        information from children. If you believe we have collected such data, please contact us so we
                        can delete it.
                    </p>
                </section>

                <section className={sectionClass}>
                    <h2 className={h2Class}>12. Changes</h2>
                    <p>
                        We may update this policy from time to time. We will post the revised version on this page and
                        update the &quot;Last updated&quot; date. Material changes may be communicated by email or
                        notice on the site where appropriate.
                    </p>
                </section>

                <section className={sectionClass}>
                    <h2 className={h2Class}>13. Contact</h2>
                    <p>
                        For privacy-related requests:{' '}
                        <a href={`mailto:${contactEmail}`} className="text-[#6eda78] hover:text-[#5bc66a] underline break-all">
                            {contactEmail}
                        </a>
                        . You can also visit our{' '}
                        <Link href="/contact" className="text-[#6eda78] hover:text-[#5bc66a] underline">
                            Contact
                        </Link>{' '}
                        page.
                    </p>
                </section>
            </article>
        </PublicLayout>
    );
}
