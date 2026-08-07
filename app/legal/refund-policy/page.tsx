import LegalPage from "@/components/LegalPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Refund Policy | myFit",
    description: "Understand myFit's refund policy for digital programs and physical products.",
};

const sections = [
    {
        id: "overview",
        title: "Overview",
        content: (
            <div className="legal-content">
                <p>
                    At <strong>myFit</strong>, we are committed to providing you with high-quality
                    fitness programs and products. We understand that circumstances may arise where a
                    refund is necessary, and we strive to handle all refund requests fairly and
                    transparently.
                </p>
                <p>
                    This Refund Policy covers all purchases made through our platform, including digital
                    fitness programs, subscription plans, and physical merchandise (loungewear). Please
                    read this policy carefully before making a purchase.
                </p>
                <div className="highlight-box">
                    <strong>Paystack Refunds:</strong> All refunds are processed through our payment
                    processor, <strong>Paystack</strong>. Refund timelines depend on your bank or card
                    issuer — typically <strong>5–10 business days</strong> for card refunds and
                    <strong> 1–3 business days</strong> for mobile money. Paystack does not guarantee
                    exact timelines as they depend on your financial institution.
                </div>
            </div>
        ),
    },
    {
        id: "digital-programs",
        title: "Digital Programs & Subscriptions",
        content: (
            <div className="legal-content">
                <h3>One-Time Purchase Programs</h3>
                <p>
                    For digital fitness programs purchased as a one-time payment, we offer a
                    <strong> 7-day satisfaction guarantee</strong> from the date of purchase, provided that:
                </p>
                <ul>
                    <li>You have not accessed or downloaded more than <strong>20%</strong> of the program content.</li>
                    <li>You contact us within the 7-day window with a clear reason for your refund request.</li>
                    <li>Your account has not previously received a refund on the same or similar program.</li>
                </ul>
                <p>
                    Once significant content has been accessed or the 7-day window has passed, refunds
                    will be evaluated on a <strong>case-by-case basis</strong> at our sole discretion.
                </p>

                <h3>Weekly & Monthly Subscriptions</h3>
                <p>
                    Subscription payments are charged at the start of each billing cycle. Because
                    access to content is granted immediately upon payment:
                </p>
                <ul>
                    <li>Refunds are generally <strong>not provided</strong> for subscription charges that have already been processed for an active billing period.</li>
                    <li>If you cancel your subscription, you retain access until the end of your current billing period — no partial refunds will be issued for unused days.</li>
                    <li>Exception: If you were charged due to a <strong>technical error</strong> on our part (e.g., charged after you cancelled, double charge), we will refund the erroneous charge in full.</li>
                </ul>

                <h3>Free Trial Conversions</h3>
                <p>
                    If you were charged because you forgot to cancel before your free trial ended, we
                    may offer a one-time courtesy refund at our discretion, provided the request is
                    made within <strong>48 hours</strong> of the charge and you have not used the
                    Services during the paid period.
                </p>
            </div>
        ),
    },
    {
        id: "physical-products",
        title: "Physical Products (Loungewear)",
        content: (
            <div className="legal-content">
                <p>
                    For physical merchandise purchased through myFit (including apparel and loungewear),
                    we offer a <strong>14-day return window</strong> from the date of delivery, subject
                    to the following conditions:
                </p>
                <ul>
                    <li>Items must be <strong>unworn, unwashed, and undamaged</strong> with original tags attached.</li>
                    <li>Items must be in their original packaging.</li>
                    <li>You must provide proof of purchase (order confirmation email or receipt).</li>
                    <li>Sale items and personalised/custom items are <strong>non-refundable</strong> unless defective.</li>
                </ul>

                <h3>Defective or Incorrect Items</h3>
                <p>
                    If you receive a defective, damaged, or incorrect item, you are entitled to a full
                    refund or exchange. Please contact us within <strong>7 days</strong> of delivery with:
                </p>
                <ul>
                    <li>Your order number</li>
                    <li>A clear description of the issue</li>
                    <li>Photos of the defective/incorrect item</li>
                </ul>

                <h3>Return Shipping</h3>
                <p>
                    Customers are responsible for return shipping costs unless the return is due to our
                    error (wrong item, defective product). We recommend using a tracked shipping service,
                    as we cannot be responsible for items lost in return transit.
                </p>
            </div>
        ),
    },
    {
        id: "non-refundable",
        title: "Non-Refundable Items",
        content: (
            <div className="legal-content">
                <p>The following are explicitly <strong>non-refundable</strong>:</p>
                <ul>
                    <li>Programs or content where more than 20% has been accessed.</li>
                    <li>Subscription charges for billing periods that have already commenced, except in cases of technical error.</li>
                    <li>Gift cards or promotional credits.</li>
                    <li>Personalised coaching sessions or one-on-one consultations that have already taken place.</li>
                    <li>Processing fees charged by Paystack (where applicable).</li>
                    <li>Purchases made more than 30 days prior to the refund request (beyond our evaluation window).</li>
                </ul>
            </div>
        ),
    },
    {
        id: "process",
        title: "How to Request a Refund",
        content: (
            <div className="legal-content">
                <p>To request a refund, please follow these steps:</p>
                <ol>
                    <li>
                        <strong>Contact us</strong> at{" "}
                        <a href="mailto:myfitrainingg@gmail.com">myfitrainingg@gmail.com</a> with the
                        subject line: <em>&quot;Refund Request — [Your Order Number]&quot;</em>
                    </li>
                    <li>
                        <strong>Include the following details:</strong>
                        <ul>
                            <li>Full name and email address on your account.</li>
                            <li>Order ID or transaction reference from Paystack.</li>
                            <li>Date of purchase.</li>
                            <li>The specific program or product you are requesting a refund for.</li>
                            <li>A brief explanation of your reason for the refund.</li>
                        </ul>
                    </li>
                    <li>
                        <strong>Our team will review</strong> your request and respond within{" "}
                        <strong>3–5 business days</strong>.
                    </li>
                    <li>
                        If approved, the refund will be initiated through <strong>Paystack</strong> back
                        to your original payment method. Please allow <strong>5–10 business days</strong>{" "}
                        for the funds to appear, depending on your bank.
                    </li>
                </ol>
            </div>
        ),
    },
    {
        id: "chargebacks",
        title: "Chargebacks & Disputes",
        content: (
            <div className="legal-content">
                <p>
                    We encourage you to contact us directly before initiating a chargeback with your
                    bank or card issuer. Chargebacks initiated without first contacting us may result in
                    the suspension of your myFit account.
                </p>
                <p>
                    If you believe you have been charged in error, please email us at{" "}
                    <a href="mailto:myfitrainingg@gmail.com">myfitrainingg@gmail.com</a> and we will
                    investigate and resolve the issue promptly.
                </p>
                <p>
                    myFit reserves the right to dispute any chargebacks we believe to be fraudulent or
                    unjustified. Evidence of platform access and usage logs may be submitted to Paystack
                    and your financial institution as part of any chargeback dispute process.
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
                    myFit reserves the right to modify this Refund Policy at any time. Changes will be
                    posted on this page with an updated effective date. We encourage you to review this
                    policy before making any purchase. Continued use of our Services after changes are
                    posted constitutes your acceptance of the revised policy.
                </p>
                <p>
                    For questions about this policy, contact us at{" "}
                    <a href="mailto:myfitrainingg@gmail.com">myfitrainingg@gmail.com</a>.
                </p>
            </div>
        ),
    },
];

export default function RefundPolicyPage() {
    return (
        <LegalPage
            title="Refund Policy"
            subtitle="We want you to be confident in every purchase. Here's our clear, fair policy on refunds for both digital programs and physical products."
            effectiveDate="August 5, 2026"
            lastUpdated="August 5, 2026"
            accentColor="#10b981"
            icon="💳"
            sections={sections}
        />
    );
}
