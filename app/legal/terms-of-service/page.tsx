import LegalPage from "@/components/LegalPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms of Service | myFit",
    description: "Read myFit's Terms of Service — the rules and conditions governing your use of our fitness platform.",
};

const sections = [
    {
        id: "acceptance",
        title: "Acceptance of Terms",
        content: (
            <div className="legal-content">
                <p>
                    These Terms of Service (&quot;Terms&quot;) constitute a legally binding agreement between
                    you (&quot;User,&quot; &quot;you,&quot; or &quot;your&quot;) and <strong>myFit</strong> (&quot;Company,&quot; &quot;we,&quot; &quot;our,&quot;
                    or &quot;us&quot;), a fitness platform based in Nairobi, Kenya.
                </p>
                <p>
                    By creating an account, purchasing a program, accessing content, or otherwise using
                    any part of our platform, you agree to be bound by these Terms. If you do not agree
                    to all of these Terms, do not use our Services.
                </p>
                <div className="highlight-box">
                    <strong>Important:</strong> These Terms include a limitation of liability clause
                    (Section 10) and a health disclaimer. Please read them carefully before proceeding.
                </div>
            </div>
        ),
    },
    {
        id: "eligibility",
        title: "Eligibility",
        content: (
            <div className="legal-content">
                <p>To use myFit&apos;s Services, you must:</p>
                <ul>
                    <li>Be at least <strong>16 years of age</strong>. If you are under 18, you must have parental or guardian consent.</li>
                    <li>Have the legal capacity to enter into a binding contract under Kenyan law.</li>
                    <li>Provide accurate, truthful, and complete information when registering.</li>
                    <li>Not be a person prohibited from receiving our Services under applicable law.</li>
                </ul>
                <p>
                    By using our Services, you represent and warrant that you meet all of the above
                    eligibility requirements.
                </p>
            </div>
        ),
    },
    {
        id: "account",
        title: "Accounts & Registration",
        content: (
            <div className="legal-content">
                <p>
                    When you create a myFit account, you agree to:
                </p>
                <ul>
                    <li>Provide accurate and complete registration information.</li>
                    <li>Keep your password confidential and not share it with others.</li>
                    <li>Notify us immediately at <a href="mailto:myfitrainingg@gmail.com">myfitrainingg@gmail.com</a> if you suspect unauthorised access to your account.</li>
                    <li>Take responsibility for all activity that occurs under your account.</li>
                </ul>
                <p>
                    We reserve the right to suspend or terminate accounts that contain false information,
                    violate these Terms, or are used for fraudulent or harmful activities.
                </p>
                <div className="highlight-box">
                    <strong>One Account Policy:</strong> Each individual may maintain only one myFit account. Creating multiple accounts to abuse free trials or promotions is strictly prohibited.
                </div>
            </div>
        ),
    },
    {
        id: "subscriptions",
        title: "Subscriptions & Payments",
        content: (
            <div className="legal-content">
                <h3>4.1 Program Types</h3>
                <p>myFit offers two types of purchase models:</p>
                <ul>
                    <li><strong>One-Time Purchase:</strong> A single payment grants you lifetime access to a specific program or content package.</li>
                    <li><strong>Recurring Subscriptions:</strong> Weekly or monthly plans that automatically renew until cancelled. You will be billed at the beginning of each billing cycle.</li>
                </ul>

                <h3>4.2 Pricing</h3>
                <p>
                    All prices are displayed in Kenyan Shillings (KES) unless otherwise stated. Prices
                    may be subject to applicable taxes. We reserve the right to change pricing with
                    reasonable advance notice to subscribers.
                </p>

                <h3>4.3 Payment Processing</h3>
                <p>
                    All payments are processed securely through <strong>Paystack</strong>, a PCI-DSS
                    compliant payment processor. By making a purchase, you authorise Paystack to charge
                    your selected payment method. myFit does not store your full card or bank details.
                </p>

                <h3>4.4 Failed Payments</h3>
                <p>
                    If a payment fails, your subscription access may be suspended. We will notify you
                    by email and you will have a grace period of <strong>3 days</strong> to update your
                    payment method before access is revoked.
                </p>

                <h3>4.5 Free Trials</h3>
                <p>
                    Where free trials are offered, no charge will be made during the trial period.
                    At the end of the trial, your account will automatically convert to a paid plan
                    unless cancelled before the trial ends.
                </p>
            </div>
        ),
    },
    {
        id: "acceptable-use",
        title: "Acceptable Use",
        content: (
            <div className="legal-content">
                <p>You agree to use myFit&apos;s Services only for lawful purposes. You must NOT:</p>
                <ul>
                    <li>Share, resell, sublicense, or redistribute any content from our platform without explicit written permission.</li>
                    <li>Attempt to reverse-engineer, decompile, or extract any source code from our platform.</li>
                    <li>Upload or transmit malicious code, viruses, or harmful content.</li>
                    <li>Harass, threaten, or abuse other users or myFit staff.</li>
                    <li>Use automated bots or scrapers to access our content or user data.</li>
                    <li>Misrepresent your identity or affiliation with any person or entity.</li>
                    <li>Use the platform in a manner that could impair or overburden our infrastructure.</li>
                    <li>Post or share content that is defamatory, obscene, or violates any third-party rights.</li>
                </ul>
                <p>
                    Violation of these acceptable use guidelines may result in immediate suspension or
                    permanent termination of your account without refund.
                </p>
            </div>
        ),
    },
    {
        id: "intellectual-property",
        title: "Intellectual Property",
        content: (
            <div className="legal-content">
                <h3>6.1 Our Content</h3>
                <p>
                    All content on myFit — including but not limited to workout videos, training
                    programs, nutrition guides, written articles, logos, graphics, and software — is the
                    exclusive property of myFit or our licensed content providers and is protected by
                    Kenyan and international intellectual property laws.
                </p>
                <p>
                    Your purchase or subscription grants you a <strong>limited, non-exclusive,
                    non-transferable, personal licence</strong> to access and use the content for your
                    own personal, non-commercial fitness purposes.
                </p>

                <h3>6.2 Your Content</h3>
                <p>
                    By submitting content to our platform (e.g., progress photos, comments, reviews),
                    you grant myFit a non-exclusive, royalty-free, worldwide licence to use, display,
                    and distribute such content in connection with our Services and marketing, with
                    attribution where appropriate.
                </p>

                <h3>6.3 Feedback</h3>
                <p>
                    Any feedback, suggestions, or ideas you provide to us may be used by myFit without
                    obligation or compensation to you.
                </p>
            </div>
        ),
    },
    {
        id: "third-party",
        title: "Third-Party Services",
        content: (
            <div className="legal-content">
                <p>
                    Our platform integrates with third-party services including Paystack (payments),
                    Supabase (database), and Sanity (content). These services have their own terms of
                    service and privacy policies, and your use of them is subject to those policies.
                </p>
                <p>
                    myFit is not responsible for the performance, availability, or content of
                    third-party services. Links to external websites on our platform do not imply
                    endorsement of those websites.
                </p>
            </div>
        ),
    },
    {
        id: "disclaimers",
        title: "Disclaimers & Warranties",
        content: (
            <div className="legal-content">
                <p>
                    To the fullest extent permitted by Kenyan law, myFit provides its Services on an
                    <strong> &quot;as is&quot; and &quot;as available&quot;</strong> basis without any warranties, express or
                    implied, including but not limited to warranties of merchantability, fitness for a
                    particular purpose, or non-infringement.
                </p>
                <p>We do not warrant that:</p>
                <ul>
                    <li>The Services will be uninterrupted, error-free, or free from security vulnerabilities.</li>
                    <li>Any specific fitness results will be achieved through use of our programs.</li>
                    <li>Content on the platform is accurate, complete, or up to date at all times.</li>
                </ul>
                <div className="highlight-box">
                    <strong>Health Disclaimer:</strong> myFit&apos;s programs and content are for
                    informational and educational purposes only and do not constitute medical advice.
                    Always consult a qualified healthcare professional before starting any new exercise
                    or nutrition programme.
                </div>
            </div>
        ),
    },
    {
        id: "limitation-of-liability",
        title: "Limitation of Liability",
        content: (
            <div className="legal-content">
                <p>
                    To the maximum extent permitted by applicable law, myFit, its directors, employees,
                    agents, and affiliates shall not be liable for:
                </p>
                <ul>
                    <li>Any indirect, incidental, special, consequential, or punitive damages.</li>
                    <li>Loss of profits, revenue, data, goodwill, or other intangible losses.</li>
                    <li>Physical injury, illness, or health complications arising from following our programs without proper medical clearance.</li>
                    <li>Interruption of Services, data breaches, or technical failures beyond our reasonable control.</li>
                </ul>
                <p>
                    In no event shall our total liability to you exceed the amount you paid to myFit
                    in the <strong>12 months preceding the claim</strong>.
                </p>
            </div>
        ),
    },
    {
        id: "termination",
        title: "Termination",
        content: (
            <div className="legal-content">
                <h3>10.1 By You</h3>
                <p>
                    You may terminate your account at any time by contacting us at{" "}
                    <a href="mailto:myfitrainingg@gmail.com">myfitrainingg@gmail.com</a> or by using the
                    account deletion feature in your profile settings. Refer to our Cancellation Policy
                    for details on how cancellation affects access and billing.
                </p>

                <h3>10.2 By Us</h3>
                <p>
                    We reserve the right to suspend or permanently terminate your account at our
                    discretion if you:
                </p>
                <ul>
                    <li>Violate any provision of these Terms.</li>
                    <li>Engage in fraudulent, harmful, or illegal activity.</li>
                    <li>Fail to pay any amounts owed after the grace period.</li>
                </ul>
                <p>
                    Upon termination, your right to access the platform ceases immediately. Sections
                    of these Terms that by their nature should survive termination shall continue to
                    apply (including intellectual property, limitation of liability, and governing law).
                </p>
            </div>
        ),
    },
    {
        id: "governing-law",
        title: "Governing Law & Disputes",
        content: (
            <div className="legal-content">
                <p>
                    These Terms shall be governed by and construed in accordance with the laws of
                    <strong> Kenya</strong>. Any disputes arising under these Terms shall first be
                    subject to good-faith negotiation. If unresolved within 30 days, disputes shall
                    be submitted to the jurisdiction of the courts of Nairobi, Kenya.
                </p>
                <p>
                    Nothing in this section prevents you from seeking emergency injunctive relief from
                    a court of competent jurisdiction where necessary to prevent immediate harm.
                </p>
            </div>
        ),
    },
    {
        id: "changes",
        title: "Changes to These Terms",
        content: (
            <div className="legal-content">
                <p>
                    We reserve the right to modify these Terms at any time. We will provide at least
                    <strong> 14 days&apos; notice</strong> of material changes via email or a prominent
                    notice on our platform. Your continued use of the Services after the effective date
                    of changes constitutes your acceptance of the new Terms.
                </p>
                <p>
                    If you do not agree with the updated Terms, you must stop using the Services and
                    cancel your subscription before the effective date.
                </p>
            </div>
        ),
    },
];

export default function TermsOfServicePage() {
    return (
        <LegalPage
            title="Terms of Service"
            subtitle="These terms govern your use of the myFit platform. Please read them carefully — they contain important information about your rights and obligations."
            effectiveDate="August 5, 2026"
            lastUpdated="August 5, 2026"
            accentColor="#8b5cf6"
            icon="📋"
            sections={sections}
        />
    );
}
