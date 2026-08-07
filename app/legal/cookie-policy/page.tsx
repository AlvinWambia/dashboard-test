import LegalPage from "@/components/LegalPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Cookie Policy | myFit",
    description: "Learn how myFit uses cookies and similar tracking technologies on our platform.",
};

const sections = [
    {
        id: "introduction",
        title: "Introduction",
        content: (
            <div className="legal-content">
                <p>
                    This Cookie Policy explains how <strong>myFit</strong> (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;)
                    uses cookies and similar tracking technologies when you visit our website and use
                    our Services. It explains what these technologies are, why we use them, and your
                    rights to control our use of them.
                </p>
                <p>
                    By continuing to use our website, you consent to our use of cookies as described
                    in this policy. You can withdraw your consent at any time by adjusting your browser
                    settings or using the controls described below.
                </p>
                <div className="highlight-box">
                    <strong>Related Policies:</strong> This Cookie Policy should be read alongside
                    our Privacy Policy, which contains additional information about how we handle
                    your personal data.
                </div>
            </div>
        ),
    },
    {
        id: "what-are-cookies",
        title: "What Are Cookies?",
        content: (
            <div className="legal-content">
                <p>
                    Cookies are small text files placed on your device (computer, tablet, or smartphone)
                    by websites you visit. They are widely used to make websites work efficiently, to
                    improve user experience, and to provide information to the website owners.
                </p>
                <p>
                    Cookies can be <strong>session cookies</strong> (which expire when you close your
                    browser) or <strong>persistent cookies</strong> (which remain on your device for a
                    set period of time or until you delete them).
                </p>
                <p>
                    We also use similar technologies such as:
                </p>
                <ul>
                    <li><strong>Local Storage:</strong> Browser-based storage used to retain preferences and session state across page loads.</li>
                    <li><strong>Pixel Tags / Web Beacons:</strong> Tiny image files embedded in web pages or emails to track whether content has been viewed.</li>
                    <li><strong>Session Storage:</strong> Temporary data stored in your browser session that is cleared when you close the tab.</li>
                </ul>
            </div>
        ),
    },
    {
        id: "types-of-cookies",
        title: "Types of Cookies We Use",
        content: (
            <div className="legal-content">
                <h3>🔒 Strictly Necessary Cookies</h3>
                <p>
                    These cookies are essential for the website to function properly. Without them,
                    services you have requested (such as logging in, accessing your program, or
                    completing a payment) cannot be provided. These cookies <strong>cannot be
                    disabled</strong>.
                </p>
                <ul>
                    <li><strong>Authentication Cookies:</strong> Keep you logged into your account across page visits (managed by Supabase).</li>
                    <li><strong>Session Cookies:</strong> Maintain your session state while navigating the platform.</li>
                    <li><strong>Security Cookies:</strong> Help detect and prevent fraud and protect user accounts.</li>
                    <li><strong>Payment Cookies:</strong> Used by Paystack to securely process your transaction.</li>
                </ul>

                <h3>⚡ Functional / Preference Cookies</h3>
                <p>
                    These cookies allow the website to remember choices you make and provide enhanced,
                    personalised features. They may be set by us or by third-party providers whose
                    services we have added to our pages.
                </p>
                <ul>
                    <li>Remembering your language or region preferences.</li>
                    <li>Storing your interface theme preferences (e.g., dark mode).</li>
                    <li>Remembering your programme progress and view history.</li>
                </ul>

                <h3>📊 Analytics Cookies</h3>
                <p>
                    These cookies help us understand how visitors interact with our website by
                    collecting and reporting information anonymously. This allows us to improve the
                    platform experience.
                </p>
                <ul>
                    <li><strong>Usage Analytics:</strong> Pages visited, time spent, navigation paths, and feature interactions.</li>
                    <li><strong>Error Tracking:</strong> Identifying broken pages or technical issues.</li>
                    <li><strong>Performance Monitoring:</strong> Load times and platform responsiveness.</li>
                </ul>
                <p>
                    Analytics data is aggregated and does not personally identify you. You can opt
                    out of analytics tracking via your browser settings.
                </p>

                <h3>🎯 Marketing & Targeting Cookies</h3>
                <p>
                    These cookies may be set through our platform by third-party advertising partners.
                    They track your browsing activity to build a profile of your interests so that
                    relevant advertisements can be shown to you on other websites.
                </p>
                <ul>
                    <li>They do not store personal data directly but are based on uniquely identifying your browser and device.</li>
                    <li>You can opt out of marketing cookies via your browser settings or through the opt-out mechanisms provided by relevant third parties.</li>
                </ul>
                <p>
                    <strong>We do not</strong> currently run third-party ad networks on the myFit
                    platform, but this may change in the future. This policy will be updated accordingly.
                </p>
            </div>
        ),
    },
    {
        id: "third-party-cookies",
        title: "Third-Party Cookies",
        content: (
            <div className="legal-content">
                <p>
                    Some cookies on our platform are placed by third-party services we use. These
                    third parties have their own privacy and cookie policies, which we encourage you
                    to review:
                </p>
                <ul>
                    <li>
                        <strong>Paystack</strong> — Payment processing. Paystack may set cookies to
                        facilitate secure payment sessions.{" "}
                        <a href="https://paystack.com/privacy-policy" target="_blank" rel="noopener noreferrer">
                            Paystack Privacy Policy →
                        </a>
                    </li>
                    <li>
                        <strong>Supabase</strong> — Authentication and database. Supabase sets
                        authentication tokens to maintain secure login sessions.{" "}
                        <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">
                            Supabase Privacy Policy →
                        </a>
                    </li>
                    <li>
                        <strong>Google Fonts</strong> — We load fonts from Google Fonts, which may set
                        cookies related to their CDN delivery.{" "}
                        <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
                            Google Privacy Policy →
                        </a>
                    </li>
                    <li>
                        <strong>Analytics Providers</strong> — If we use a third-party analytics
                        service, they may set cookies to collect anonymised usage data.
                    </li>
                </ul>
                <p>
                    myFit is not responsible for the cookies set by third-party services. Please
                    refer to their respective policies for information on how to opt out.
                </p>
            </div>
        ),
    },
    {
        id: "managing-cookies",
        title: "Managing & Controlling Cookies",
        content: (
            <div className="legal-content">
                <p>
                    You have the right to decide whether to accept or reject cookies (other than
                    strictly necessary ones). Here are your options:
                </p>

                <h3>Browser Settings</h3>
                <p>
                    Most web browsers allow you to control cookies through their settings. You can
                    set your browser to:
                </p>
                <ul>
                    <li>Block all cookies.</li>
                    <li>Delete cookies when you close your browser.</li>
                    <li>Accept cookies only from websites you visit directly (blocking third-party cookies).</li>
                    <li>Notify you when a website tries to set a cookie.</li>
                </ul>
                <p>Browser-specific instructions:</p>
                <ul>
                    <li><strong>Chrome:</strong> Settings → Privacy & Security → Cookies</li>
                    <li><strong>Firefox:</strong> Options → Privacy & Security → Cookies</li>
                    <li><strong>Safari:</strong> Preferences → Privacy → Cookies</li>
                    <li><strong>Edge:</strong> Settings → Privacy, Search, & Services → Cookies</li>
                </ul>

                <h3>Impact of Disabling Cookies</h3>
                <p>
                    Please note that if you choose to block or disable cookies, some parts of myFit
                    may not function correctly. In particular:
                </p>
                <ul>
                    <li>You may not be able to stay logged in to your account.</li>
                    <li>Payment processing via Paystack may be affected.</li>
                    <li>Your preferences and programme progress may not be saved.</li>
                </ul>

                <h3>Opt-Out of Analytics</h3>
                <p>
                    To opt out of analytics tracking, you can use browser extensions such as the{" "}
                    <strong>Google Analytics Opt-out Browser Add-on</strong> or ad-blocking extensions
                    that prevent tracking scripts from loading.
                </p>
            </div>
        ),
    },
    {
        id: "do-not-track",
        title: "Do Not Track Signals",
        content: (
            <div className="legal-content">
                <p>
                    Some browsers offer a &quot;Do Not Track&quot; (DNT) feature that sends a signal to
                    websites requesting that your browsing activity not be tracked. Currently, there
                    is no industry-wide standard for responding to DNT signals.
                </p>
                <p>
                    At present, myFit does not specifically respond to DNT signals. However, you can
                    use the cookie management options described in the previous section to control
                    tracking on our platform.
                </p>
            </div>
        ),
    },
    {
        id: "retention",
        title: "Cookie Retention Periods",
        content: (
            <div className="legal-content">
                <p>Different cookies are retained for different lengths of time:</p>
                <ul>
                    <li><strong>Session Cookies:</strong> Deleted automatically when you close your browser.</li>
                    <li><strong>Authentication Cookies:</strong> Typically retained for up to <strong>7 days</strong> (or until you log out).</li>
                    <li><strong>Preference Cookies:</strong> Retained for up to <strong>12 months</strong>.</li>
                    <li><strong>Analytics Cookies:</strong> Retained for up to <strong>24 months</strong>.</li>
                    <li><strong>Marketing Cookies:</strong> Retained for up to <strong>12 months</strong>.</li>
                </ul>
                <p>
                    You can delete cookies at any time through your browser settings. Deleting cookies
                    will reset your preferences and may require you to log in again.
                </p>
            </div>
        ),
    },
    {
        id: "changes",
        title: "Changes to This Cookie Policy",
        content: (
            <div className="legal-content">
                <p>
                    We may update this Cookie Policy from time to time to reflect changes in the
                    technologies we use or applicable legal requirements. When we make changes, we
                    will update the &quot;Last Updated&quot; date at the top of this page and, where
                    appropriate, notify you via email or a banner on our website.
                </p>
                <p>
                    We encourage you to review this page periodically so you are always aware of how
                    we use cookies. Your continued use of our platform after changes take effect
                    constitutes your acceptance of the updated Cookie Policy.
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
                    If you have any questions about our use of cookies or this Cookie Policy, please
                    contact us:
                </p>
                <ul>
                    <li><strong>Company:</strong> myFit</li>
                    <li><strong>Location:</strong> Nairobi, Kenya</li>
                    <li><strong>Email:</strong> <a href="mailto:myfitrainingg@gmail.com">myfitrainingg@gmail.com</a></li>
                </ul>
            </div>
        ),
    },
];

export default function CookiePolicyPage() {
    return (
        <LegalPage
            title="Cookie Policy"
            subtitle="We use cookies to make myFit work better for you. Here's a transparent breakdown of every type of cookie we use and how to control them."
            effectiveDate="August 5, 2026"
            lastUpdated="August 5, 2026"
            accentColor="#06b6d4"
            icon="🍪"
            sections={sections}
        />
    );
}
