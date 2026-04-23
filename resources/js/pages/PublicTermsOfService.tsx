import PublicLayout from '@/layouts/public-layout';
import { Link } from '@inertiajs/react';

interface Props {
    contactEmail: string;
}

const sectionClass = 'space-y-3 text-gray-700 leading-relaxed';
const h2Class = 'text-xl font-semibold text-[#0c112a] mb-3';

export default function PublicTermsOfService({ contactEmail }: Props) {
    return (
        <PublicLayout title="Terms of Service — LionzHost">
            <section className="bg-gradient-to-br from-[#0c112a] to-[#1a1f3a] text-white py-16 md:py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
                    <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                        Rules governing your use of LionzHost websites and services, operated by Rovos International WLL.
                    </p>
                    <p className="text-sm text-gray-400 mt-4">Last updated: April 24, 2026</p>
                </div>
            </section>

            <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-10">
                <section className={sectionClass}>
                    <h2 className={h2Class}>1. Agreement</h2>
                    <p>
                        By accessing the LionzHost website, creating an account, or ordering services, you agree to
                        these Terms of Service and our{' '}
                        <Link href="/privacy" className="text-[#6eda78] hover:text-[#5bc66a] underline">
                            Privacy Policy
                        </Link>
                        . If you do not agree, do not use our services. LionzHost is operated by{' '}
                        <strong className="text-gray-900">Rovos International WLL</strong> (&quot;we&quot;,
                        &quot;us&quot;, &quot;our&quot;). &quot;You&quot; means the individual or entity using the
                        services.
                    </p>
                </section>

                <section className={sectionClass}>
                    <h2 className={h2Class}>2. Services</h2>
                    <p>
                        We provide domain registration and management, web hosting, VPS and dedicated server products,
                        SSL certificates, and related digital services as described on our site at the time of order.
                        Specific features, limits, and locations may depend on the plan or product you select. Some
                        services rely on third-party registries, data centers, or software; their availability and policies
                        may affect what we can deliver.
                    </p>
                </section>

                <section className={sectionClass}>
                    <h2 className={h2Class}>3. Account</h2>
                    <p>You agree to:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Provide accurate, current, and complete information and keep it updated.</li>
                        <li>Maintain the confidentiality of your credentials and notify us of unauthorized use.</li>
                        <li>Be responsible for activity under your account except where caused by our gross negligence.</li>
                    </ul>
                    <p>We may suspend or terminate accounts that violate these terms or pose a security or legal risk.</p>
                </section>

                <section className={sectionClass}>
                    <h2 className={h2Class}>4. Domains, DNS, and SSL</h2>
                    <p>
                        Domain registrations and renewals are subject to the rules of the applicable registry and
                        registrar policies, including eligibility, naming, dispute resolution (e.g. UDRP where
                        applicable), and data accuracy requirements. You are responsible for ensuring that registration
                        data is correct and for compliance with registry terms. SSL issuance may require validation steps
                        by the certificate authority; failed or delayed validation can delay activation.
                    </p>
                </section>

                <section className={sectionClass}>
                    <h2 className={h2Class}>5. Fees, billing, and renewals</h2>
                    <p>
                        Prices, taxes, and currencies are shown at checkout unless otherwise stated. Recurring services
                        may renew automatically if you have enabled renewal and we have a valid payment method, subject
                        to the renewal settings shown in your account. You are responsible for renewal fees and for
                        timely payment. Failure to pay may result in suspension or cancellation of services, including
                        loss of domain registration if renewal is not completed before expiry, in line with registry
                        rules.
                    </p>
                </section>

                <section className={sectionClass}>
                    <h2 className={h2Class}>6. Refunds and chargebacks</h2>
                    <p>
                        Refund eligibility, if any, depends on the product and the terms displayed at purchase or in
                        your order confirmation. Chargebacks or payment reversals without first contacting support may
                        result in immediate suspension of services and recovery of fees and costs where permitted by law.
                    </p>
                </section>

                <section className={sectionClass}>
                    <h2 className={h2Class}>7. Acceptable use</h2>
                    <p>You must not use our services to:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Violate applicable laws or third-party rights.</li>
                        <li>Send spam, malware, or engage in phishing, fraud, or harassment.</li>
                        <li>Attack or disrupt networks, accounts, or systems (including ours or others).</li>
                        <li>Host or distribute illegal content as defined by the jurisdiction where the service is provided or used.</li>
                    </ul>
                    <p>
                        We may investigate reports and remove or suspend content or services that breach this section.
                    </p>
                </section>

                <section className={sectionClass}>
                    <h2 className={h2Class}>8. Intellectual property</h2>
                    <p>
                        The LionzHost name, branding, and site content are owned by us or our licensors. You receive no
                        rights to our trademarks except the limited right to refer to us as your provider. You retain
                        rights to your own content; you grant us a limited license to host and process it as needed to
                        deliver the services you order.
                    </p>
                </section>

                <section className={sectionClass}>
                    <h2 className={h2Class}>9. Disclaimers</h2>
                    <p>
                        Except where prohibited by law, services are provided &quot;as is&quot; and &quot;as
                        available&quot;. We disclaim implied warranties of merchantability, fitness for a particular
                        purpose, and non-infringement to the fullest extent permitted. Third-party services (registries,
                        payment networks, data centers) are outside our control; downtime or policy changes may affect
                        your services.
                    </p>
                </section>

                <section className={sectionClass}>
                    <h2 className={h2Class}>10. Limitation of liability</h2>
                    <p>
                        To the maximum extent permitted by applicable law, we and our affiliates will not be liable for
                        indirect, incidental, special, consequential, or punitive damages, or loss of profits, data, or
                        goodwill, arising from your use of the services. Our aggregate liability for claims relating to
                        the services in any twelve-month period is limited to the fees you paid us for those services in
                        that period (or, if greater, the minimum amount required by mandatory law in your jurisdiction).
                    </p>
                </section>

                <section className={sectionClass}>
                    <h2 className={h2Class}>11. Indemnity</h2>
                    <p>
                        You will defend and indemnify us against claims, damages, and costs (including reasonable legal
                        fees) arising from your content, your use of the services in breach of these terms, or your
                        violation of law or third-party rights, except to the extent caused by our willful misconduct.
                    </p>
                </section>

                <section className={sectionClass}>
                    <h2 className={h2Class}>12. Governing law and disputes</h2>
                    <p>
                        These terms are governed by the laws of the Kingdom of Bahrain, without regard to conflict-of-law
                        principles. Courts in Bahrain have exclusive jurisdiction subject to any non-waivable rights you
                        may have as a consumer in your country of residence.
                    </p>
                </section>

                <section className={sectionClass}>
                    <h2 className={h2Class}>13. Changes</h2>
                    <p>
                        We may modify these terms by posting an updated version on this page and changing the
                        &quot;Last updated&quot; date. Continued use after changes constitutes acceptance where
                        permitted by law. Material adverse changes may require additional notice where we are legally
                        required to provide it.
                    </p>
                </section>

                <section className={sectionClass}>
                    <h2 className={h2Class}>14. Contact</h2>
                    <p>
                        Questions about these terms:{' '}
                        <a href={`mailto:${contactEmail}`} className="text-[#6eda78] hover:text-[#5bc66a] underline break-all">
                            {contactEmail}
                        </a>
                        . Postal and map details:{' '}
                        <Link href="/contact" className="text-[#6eda78] hover:text-[#5bc66a] underline">
                            Contact
                        </Link>
                        .
                    </p>
                </section>
            </article>
        </PublicLayout>
    );
}
