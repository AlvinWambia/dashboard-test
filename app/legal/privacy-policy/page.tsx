import LegalPage from "@/components/LegalPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy | myFit",
    description: "Learn how myFit collects, uses, and protects your personal information.",
};

const sections = [
    {
        id: "introduction",
        title: "Introduction",
        content: (
            <div className="legal-content">
                <p>
                    Welcome to <strong>myFit</strong> (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to
                    protecting your privacy and handling your personal data with transparency and care.
                    This Privacy Policy explains how we collect, use, store, share, and protect
                    information about you when you access or use our website, mobile application, fitness
                    programs, nutrition plans, wellness content, and any other services we offer
                    (collectively, the &quot;Services&quot;).
                </p>
                <p>
                    By accessing or using myFit&apos;s Services, you acknowledge that you have read,
                    understood, and agree to the collection and use of information in accordance with
                    this Privacy Policy. If you do not agree, please discontinue use of our Services.
                </p>
                <div className="highlight-box">
                    <strong>Our Promise:</strong> We will never sell your personal data to third parties.
                    Your information is used solely to provide and improve our Services and to
                    communicate with you in meaningful ways.
                </div>
            </div>
        ),
    },
    {
        id: "information-we-collect",
        title: "Information We Collect",
        content: (
            <div className="legal-content">
                <h3>1.1 Information You Provide Directly</h3>
                <ul>
                    <li><strong>Account Information:</strong> Name, email address, password, profile photo, and date of birth when you register.</li>
                    <li><strong>Profile & Fitness Data:</strong> Height, weight, fitness goals, workout history, dietary preferences, and health conditions you voluntarily share.</li>
                    <li><strong>Payment Information:</strong> Billing address and payment details processed securely by Paystack. We do not store your full card number or bank account details on our servers.</li>
                    <li><strong>Communications:</strong> Messages, support inquiries, feedback, and survey responses you send to us.</li>
                    <li><strong>User-Generated Content:</strong> Photos, progress updates, or comments you post within the platform.</li>
                </ul>

                <h3>1.2 Information Collected Automatically</h3>
                <ul>
                    <li><strong>Usage Data:</strong> Pages visited, features used, time spent, clicks, and navigation patterns.</li>
                    <li><strong>Device Data:</strong> IP address, browser type, operating system, device identifiers, and screen resolution.</li>
                    <li><strong>Cookies & Tracking Technologies:</strong> Session cookies, persistent cookies, pixel tags, and local storage (see our Cookie Policy for details).</li>
                    <li><strong>Log Data:</strong> Server logs, error reports, and performance data.</li>
                </ul>

                <h3>1.3 Information From Third Parties</h3>
                <ul>
                    <li>Payment confirmation data from <strong>Paystack</strong> (transaction IDs, payment status).</li>
                    <li>Analytics data from third-party analytics providers.</li>
                    <li>Social login data if you choose to sign in via Google or other OAuth providers.</li>
                </ul>
            </div>
        ),
    },
    {
        id: "how-we-use",
        title: "How We Use Your Information",
        content: (
            <div className="legal-content">
                <p>We use the information we collect for the following purposes:</p>
                <ul>
                    <li><strong>Service Delivery:</strong> To provide, manage, and personalise your fitness programs, nutrition plans, and wellness content.</li>
                    <li><strong>Account Management:</strong> To create and maintain your account, authenticate your identity, and manage your subscription.</li>
                    <li><strong>Payment Processing:</strong> To process transactions securely through Paystack and maintain billing records.</li>
                    <li><strong>Communication:</strong> To send service-related emails (receipts, program updates, account alerts) and, with your consent, marketing communications.</li>
                    <li><strong>Personalisation:</strong> To tailor content, workout recommendations, and nutritional guidance to your goals and preferences.</li>
                    <li><strong>Analytics & Improvement:</strong> To analyse usage trends, diagnose technical issues, and continuously improve our platform.</li>
                    <li><strong>Legal Compliance:</strong> To comply with applicable Kenyan law, resolve disputes, and enforce our agreements.</li>
                    <li><strong>Safety & Security:</strong> To detect and prevent fraud, abuse, and unauthorised access.</li>
                </ul>
                <div className="highlight-box">
                    <strong>Marketing Communications:</strong> You may opt out of marketing emails at any time by clicking the &quot;Unsubscribe&quot; link in any email we send, or by contacting us at myfitrainingg@gmail.com.
                </div>
            </div>
        ),
    },
    {
        id: "data-sharing",
        title: "How We Share Your Information",
        content: (
            <div className="legal-content">
                <p>
                    We do <strong>not sell</strong> your personal data. We may share your information
                    only in the following limited circumstances:
                </p>
                <ul>
                    <li>
                        <strong>Service Providers:</strong> Trusted third-party vendors who assist us in operating our platform, including:
                        <ul>
                            <li><strong>Paystack</strong> — payment processing</li>
                            <li><strong>Supabase</strong> — database and authentication infrastructure</li>
                            <li><strong>Sanity</strong> — content management</li>
                            <li><strong>Vercel / hosting providers</strong> — web infrastructure</li>
                            <li><strong>Email service providers</strong> — transactional and marketing emails</li>
                        </ul>
                    </li>
                    <li><strong>Legal Requirements:</strong> If required by Kenyan law, court order, or government authority.</li>
                    <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your data may be transferred to the acquiring entity, subject to the same privacy protections.</li>
                    <li><strong>With Your Consent:</strong> In any other case, only with your explicit consent.</li>
                </ul>
                <p>
                    All service providers are contractually bound to process your data only as
                    instructed by us and in accordance with applicable data protection laws.
                </p>
            </div>
        ),
    },
    {
        id: "data-retention",
        title: "Data Retention",
        content: (
            <div className="legal-content">
                <p>
                    We retain your personal data only for as long as necessary to fulfil the purposes
                    outlined in this Privacy Policy, unless a longer retention period is required or
                    permitted by Kenyan law.
                </p>
                <ul>
                    <li><strong>Active Accounts:</strong> Data is retained for the duration of your account.</li>
                    <li><strong>Deleted Accounts:</strong> Upon account deletion, we will erase or anonymise your personal data within <strong>30 days</strong>, except where we are required to retain it for legal, tax, or regulatory purposes (up to 7 years for financial records under Kenyan law).</li>
                    <li><strong>Inactive Accounts:</strong> Accounts inactive for more than 24 months may be flagged for deletion after prior notice to you.</li>
                </ul>
            </div>
        ),
    },
    {
        id: "your-rights",
        title: "Your Rights",
        content: (
            <div className="legal-content">
                <p>
                    Under the Kenya Data Protection Act (2019), you have the following rights regarding
                    your personal data:
                </p>
                <ul>
                    <li><strong>Right of Access:</strong> Request a copy of the personal data we hold about you.</li>
                    <li><strong>Right to Rectification:</strong> Request correction of inaccurate or incomplete data.</li>
                    <li><strong>Right to Erasure:</strong> Request deletion of your personal data (&quot;right to be forgotten&quot;), subject to our legal obligations.</li>
                    <li><strong>Right to Object:</strong> Object to the processing of your data for marketing purposes.</li>
                    <li><strong>Right to Data Portability:</strong> Request your data in a structured, machine-readable format.</li>
                    <li><strong>Right to Withdraw Consent:</strong> Where processing is based on consent, you may withdraw it at any time.</li>
                </ul>
                <p>
                    To exercise any of these rights, contact us at{" "}
                    <a href="mailto:myfitrainingg@gmail.com">myfitrainingg@gmail.com</a>. We will
                    respond within <strong>30 days</strong> of receiving your request.
                </p>
            </div>
        ),
    },
    {
        id: "security",
        title: "Data Security",
        content: (
            <div className="legal-content">
                <p>
                    We implement industry-standard technical and organisational measures to protect your
                    personal data against unauthorised access, loss, destruction, or alteration. These include:
                </p>
                <ul>
                    <li>SSL/TLS encryption for all data in transit</li>
                    <li>Encrypted storage for sensitive data at rest</li>
                    <li>Role-based access control limiting who can access your data internally</li>
                    <li>Regular security audits and vulnerability assessments</li>
                    <li>Secure, PCI-compliant payment processing via Paystack</li>
                </ul>
                <p>
                    While we strive to protect your information, no method of transmission over the
                    internet is 100% secure. We encourage you to use a strong, unique password and
                    never share your login credentials.
                </p>
            </div>
        ),
    },
    {
        id: "children",
        title: "Children's Privacy",
        content: (
            <div className="legal-content">
                <p>
                    myFit&apos;s Services are not directed to individuals under the age of <strong>16</strong>. We do not knowingly collect personal data from children under 16. If we become aware that we have inadvertently collected data from a child under 16, we will delete it promptly.
                </p>
                <p>
                    If you are a parent or guardian and believe your child has provided us with personal information, please contact us at{" "}
                    <a href="mailto:myfitrainingg@gmail.com">myfitrainingg@gmail.com</a>.
                </p>
            </div>
        ),
    },
    {
        id: "changes",
        title: "Changes to This Policy",
        content: (
            <div className="legal-content">
                <p>
                    We may update this Privacy Policy from time to time to reflect changes in our
                    practices, technology, legal requirements, or business operations. When we make
                    material changes, we will:
                </p>
                <ul>
                    <li>Update the &quot;Last Updated&quot; date at the top of this page.</li>
                    <li>Send you an email notification (if you have an account with us).</li>
                    <li>Display a prominent notice on our platform.</li>
                </ul>
                <p>
                    Your continued use of our Services after changes take effect constitutes your
                    acceptance of the updated Privacy Policy.
                </p>
            </div>
        ),
    },
    {
        id: "contact",
        title: "Contact Us",
        content: (
            <div className="legal-content">
                <p>
                    If you have questions, concerns, or complaints about this Privacy Policy or our
                    data practices, please contact our Data Protection team:
                </p>
                <ul>
                    <li><strong>Company:</strong> myFit</li>
                    <li><strong>Location:</strong> Nairobi, Kenya</li>
                    <li><strong>Email:</strong> <a href="mailto:myfitrainingg@gmail.com">myfitrainingg@gmail.com</a></li>
                </ul>
                <p>
                    You also have the right to lodge a complaint with the{" "}
                    <strong>Office of the Data Protection Commissioner (ODPC)</strong> of Kenya if you
                    believe your data rights have been violated.
                </p>
            </div>
        ),
    },
];

export default function PrivacyPolicyPage() {
    return (
        <LegalPage
            title="Privacy Policy"
            subtitle="We believe your data is your own. Here's exactly how we collect, use, and protect your personal information."
            effectiveDate="August 5, 2026"
            lastUpdated="August 5, 2026"
            accentColor="#3b82f6"
            icon="🔒"
            sections={sections}
        />
    );
}
