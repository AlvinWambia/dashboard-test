import LegalPage from "@/components/LegalPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Cancellation Policy | myFit",
    description: "Learn how to cancel your myFit subscription and what happens to your access after cancellation.",
};

const sections = [
    {
        id: "overview",
        title: "Overview",
        content: (
            <div className="legal-content">
                <p>
                    At <strong>myFit</strong>, we believe in giving you full control over your fitness
                    journey — including when and how you choose to end it. This Cancellation Policy
                    explains how to cancel your subscription or one-time program access, what happens
                    to your account and data, and how billing is affected.
                </p>
                <div className="highlight-box">
                    <strong>No Long-Term Lock-ins:</strong> myFit does not require long-term contracts.
                    You are free to cancel your subscription at any time without penalty, subject to the
                    terms below.
                </div>
            </div>
        ),
    },
    {
        id: "how-to-cancel",
        title: "How to Cancel Your Subscription",
        content: (
            <div className="legal-content">
                <p>You can cancel your myFit subscription through any of the following methods:</p>

                <h3>Option 1: Through Your Account Dashboard</h3>
                <ol>
                    <li>Log into your myFit account.</li>
                    <li>Navigate to <strong>Profile → Subscription & Billing</strong>.</li>
                    <li>Click <strong>&quot;Manage Subscription&quot;</strong> and select <strong>&quot;Cancel Subscription.&quot;</strong></li>
                    <li>Follow the on-screen prompts to confirm your cancellation.</li>
                    <li>You will receive a confirmation email once your cancellation is processed.</li>
                </ol>

                <h3>Option 2: Via Email</h3>
                <p>
                    Email us at <a href="mailto:myfitrainingg@gmail.com">myfitrainingg@gmail.com</a> with
                    the subject line <em>&quot;Subscription Cancellation — [Your Email Address]&quot;</em>. Please
                    include your full name and the email address registered to your account. We will
                    process your cancellation within <strong>1 business day</strong> and send a
                    confirmation email.
                </p>

                <div className="highlight-box">
                    <strong>Timing Matters:</strong> To avoid being charged for the next billing cycle,
                    please cancel at least <strong>24 hours before</strong> your next renewal date.
                    Cancellations made after the renewal date has passed cannot be refunded for that
                    billing period (unless a technical error occurred — see our Refund Policy).
                </div>
            </div>
        ),
    },
    {
        id: "after-cancellation",
        title: "What Happens After Cancellation",
        content: (
            <div className="legal-content">
                <h3>Access to Content</h3>
                <p>
                    When you cancel a <strong>subscription plan</strong>, your access to the associated
                    programs and content will remain active until the <strong>end of your current
                    billing period</strong>. You will not be billed again after cancellation.
                </p>
                <p>
                    When you cancel a <strong>one-time purchase program</strong>, your access remains
                    available for the duration of the originally granted access period. Cancellation of
                    a one-time purchase does not trigger a refund (see our Refund Policy).
                </p>

                <h3>Your Account</h3>
                <p>
                    Your myFit account will remain active after cancellation. You can log in, view your
                    purchase history, and download any resources you are entitled to during your
                    remaining access period. After the access period ends, premium content will be
                    locked, but your account remains open.
                </p>

                <h3>Your Data</h3>
                <p>
                    We will retain your account data (profile, workout history, progress) for
                    <strong> 12 months</strong> after cancellation, so you can easily resubscribe and
                    pick up where you left off. After 12 months of inactivity, your data may be
                    anonymised or deleted in accordance with our Privacy Policy.
                </p>
            </div>
        ),
    },
    {
        id: "billing-cycles",
        title: "Billing Cycles & Renewal Dates",
        content: (
            <div className="legal-content">
                <h3>Weekly Plans</h3>
                <p>
                    Weekly subscriptions renew every 7 days from your initial purchase date.
                    Cancellation must be made at least <strong>24 hours</strong> before the renewal
                    date to prevent the next charge.
                </p>

                <h3>Monthly Plans</h3>
                <p>
                    Monthly subscriptions renew on the same date each month as your initial subscription
                    date (e.g., if you subscribed on the 5th, you are billed on the 5th of every month).
                    Cancellation must be made at least <strong>24 hours</strong> before the renewal
                    date.
                </p>

                <h3>No Prorated Refunds</h3>
                <p>
                    myFit does <strong>not</strong> provide partial or prorated refunds for the unused
                    portion of a billing cycle. When you cancel, you retain full access until the end
                    of the period you have already paid for.
                </p>
            </div>
        ),
    },
    {
        id: "pausing",
        title: "Pausing Your Subscription",
        content: (
            <div className="legal-content">
                <p>
                    We currently do not offer an automatic subscription pause feature. However, if you
                    are experiencing circumstances (such as illness, injury, or travel) that temporarily
                    prevent you from using the platform, please reach out to us at{" "}
                    <a href="mailto:myfitrainingg@gmail.com">myfitrainingg@gmail.com</a>. We will
                    review your situation and may be able to offer a manual accommodation on a
                    case-by-case basis.
                </p>
            </div>
        ),
    },
    {
        id: "resubscribing",
        title: "Re-subscribing",
        content: (
            <div className="legal-content">
                <p>
                    You are welcome to re-subscribe to myFit at any time. Simply log into your account
                    and select a program or subscription plan. If your account was not deleted, your
                    previous progress and history will be restored.
                </p>
                <p>
                    Please note that promotional pricing or discounts offered at the time of your
                    original subscription may not be available upon re-subscription.
                </p>
            </div>
        ),
    },
    {
        id: "account-termination",
        title: "Account Termination vs Cancellation",
        content: (
            <div className="legal-content">
                <p>
                    <strong>Cancellation</strong> means stopping future billing while retaining your
                    account and access until the end of the paid period.
                </p>
                <p>
                    <strong>Account Termination/Deletion</strong> means permanently removing your
                    account and all associated data. This is irreversible. To delete your account
                    entirely, please contact us at{" "}
                    <a href="mailto:myfitrainingg@gmail.com">myfitrainingg@gmail.com</a> with the
                    subject line <em>&quot;Account Deletion Request.&quot;</em> Account deletion will also cancel
                    any active subscription.
                </p>
            </div>
        ),
    },
    {
        id: "contact",
        title: "Questions & Support",
        content: (
            <div className="legal-content">
                <p>
                    If you have any questions about your cancellation, are having trouble cancelling
                    through the dashboard, or want to discuss your options, please contact us:
                </p>
                <ul>
                    <li><strong>Email:</strong> <a href="mailto:myfitrainingg@gmail.com">myfitrainingg@gmail.com</a></li>
                    <li><strong>Response Time:</strong> Within 1–2 business days</li>
                    <li><strong>Location:</strong> Nairobi, Kenya</li>
                </ul>
            </div>
        ),
    },
];

export default function CancellationPolicyPage() {
    return (
        <LegalPage
            title="Cancellation Policy"
            subtitle="You are always in control. Here's everything you need to know about cancelling your myFit subscription — no hidden catches, no penalties."
            effectiveDate="August 5, 2026"
            lastUpdated="August 5, 2026"
            accentColor="#f59e0b"
            icon="🚫"
            sections={sections}
        />
    );
}
