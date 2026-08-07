import LegalPage from "@/components/LegalPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Health Disclaimer | myFit",
    description: "Important health and medical disclaimer for myFit fitness programs and nutritional content.",
};

const sections = [
    {
        id: "important-notice",
        title: "Important Notice — Please Read",
        content: (
            <div className="legal-content">
                <div className="highlight-box" style={{ borderLeftColor: "#ef4444", background: "#fef2f2" }}>
                    <strong style={{ color: "#991b1b" }}>⚠️ Medical Disclaimer:</strong>{" "}
                    <span style={{ color: "#7f1d1d" }}>
                        The content, programs, and information provided by myFit are intended for
                        general fitness and wellness purposes only. They do <strong>not</strong>{" "}
                        constitute medical advice, diagnosis, or treatment. Always seek the advice of
                        a qualified medical professional before beginning any new exercise program or
                        making changes to your diet.
                    </span>
                </div>
                <p>
                    By using myFit&apos;s Services, programs, nutrition guides, or any other content on
                    our platform, you acknowledge that you have read and understood this Health
                    Disclaimer and agree to its terms.
                </p>
            </div>
        ),
    },
    {
        id: "not-medical-advice",
        title: "Not Medical Advice",
        content: (
            <div className="legal-content">
                <p>
                    All content published on myFit — including workout programs, nutritional guidance,
                    wellness articles, coach tips, and any other materials — is provided for
                    <strong> informational and educational purposes only</strong>.
                </p>
                <p>
                    This content is <strong>not a substitute</strong> for professional medical advice,
                    diagnosis, or treatment from a licensed physician, dietitian, physiotherapist,
                    or other qualified healthcare provider. The information on our platform:
                </p>
                <ul>
                    <li>Is not intended to diagnose, treat, cure, or prevent any disease or medical condition.</li>
                    <li>Does not replace consultations with your personal doctor or healthcare team.</li>
                    <li>May not account for your individual health history, medications, or pre-existing conditions.</li>
                    <li>Is general in nature and may not be suitable for every individual.</li>
                </ul>
                <p>
                    <strong>Never disregard professional medical advice</strong> or delay seeking it
                    because of something you have read or seen on myFit.
                </p>
            </div>
        ),
    },
    {
        id: "consult-doctor",
        title: "Consult Your Doctor First",
        content: (
            <div className="legal-content">
                <p>
                    We strongly recommend that you consult with a qualified healthcare professional
                    <strong> before beginning any exercise or nutrition program</strong>, especially if
                    you:
                </p>
                <ul>
                    <li>Have been diagnosed with any medical condition (cardiovascular disease, diabetes, hypertension, osteoporosis, etc.)</li>
                    <li>Have a history of heart disease, chest pain, or irregular heartbeat.</li>
                    <li>Have experienced joint pain, injury, or chronic musculoskeletal conditions.</li>
                    <li>Are pregnant, breastfeeding, or postpartum.</li>
                    <li>Are over 40 years of age and have not exercised regularly in the past 12 months.</li>
                    <li>Are taking prescription medications that may affect your heart rate, blood pressure, or energy levels.</li>
                    <li>Have any allergy or dietary restriction that could be affected by our nutrition recommendations.</li>
                    <li>Have a history of disordered eating or a complex relationship with food.</li>
                    <li>Have been advised by a healthcare provider to avoid or limit physical activity.</li>
                </ul>
                <p>
                    If you experience any of the following during exercise, <strong>stop immediately
                    and seek medical attention</strong>:
                </p>
                <ul>
                    <li>Chest pain or tightness</li>
                    <li>Shortness of breath disproportionate to exertion</li>
                    <li>Dizziness, lightheadedness, or fainting</li>
                    <li>Severe joint or muscle pain</li>
                    <li>Heart palpitations or irregular heartbeat</li>
                    <li>Nausea or vomiting</li>
                    <li>Numbness or tingling in your limbs</li>
                </ul>
            </div>
        ),
    },
    {
        id: "individual-results",
        title: "Individual Results May Vary",
        content: (
            <div className="legal-content">
                <p>
                    Fitness and wellness results are highly individual and depend on numerous factors
                    including but not limited to:
                </p>
                <ul>
                    <li>Your starting fitness level and physical condition.</li>
                    <li>Your age, genetics, and hormonal profile.</li>
                    <li>Consistency and adherence to the program.</li>
                    <li>Sleep quality and recovery practices.</li>
                    <li>Nutrition, hydration, and supplementation.</li>
                    <li>Stress levels and mental health.</li>
                    <li>Any underlying medical conditions.</li>
                </ul>
                <p>
                    Any testimonials, success stories, before-and-after photos, or results shared on
                    our platform represent <strong>individual experiences only</strong> and are not
                    guarantees or promises of what you will achieve. Your results may differ materially
                    from those featured.
                </p>
                <div className="highlight-box">
                    <strong>Realistic Expectations:</strong> We encourage sustainable, long-term
                    approaches to health and fitness. Rapid or extreme transformations shown in
                    testimonials may not reflect typical or achievable results for most users.
                </div>
            </div>
        ),
    },
    {
        id: "nutrition",
        title: "Nutritional Information",
        content: (
            <div className="legal-content">
                <p>
                    Nutritional guidelines, meal plans, calorie targets, and dietary recommendations
                    provided by myFit are <strong>general guidelines</strong> based on commonly
                    accepted nutritional science and are not personalised medical dietary prescriptions.
                </p>
                <ul>
                    <li>Caloric and macronutrient recommendations are estimates and may need to be adjusted based on your individual metabolic needs.</li>
                    <li>Our nutrition content does not account for all food allergies, intolerances, or medical dietary requirements.</li>
                    <li>If you have a condition such as diabetes, kidney disease, heart disease, eating disorders, or are on prescription medication, please consult a registered dietitian before following our nutrition plans.</li>
                    <li>Supplement recommendations (if any) are general in nature and do not constitute medical advice. Consult a healthcare provider before adding any supplement to your routine.</li>
                </ul>
            </div>
        ),
    },
    {
        id: "risk-of-injury",
        title: "Risk of Injury",
        content: (
            <div className="legal-content">
                <p>
                    Exercise carries an inherent risk of physical injury. By participating in any
                    myFit workout program, you acknowledge and accept that:
                </p>
                <ul>
                    <li>Physical exercise, including strength training, cardiovascular training, and flexibility work, can cause muscle soreness, joint strain, and in some cases more serious injuries.</li>
                    <li>You are responsible for performing exercises with proper form and technique. Always prioritise safety over speed or weight.</li>
                    <li>You should begin at a level appropriate for your current fitness level and progress gradually.</li>
                    <li>You should ensure your workout environment is safe and free of hazards.</li>
                    <li>myFit coaches and trainers cannot observe or correct your form in real time and therefore cannot be held responsible for injuries resulting from improper exercise execution.</li>
                </ul>
                <p>
                    If you are new to exercise, we strongly recommend seeking guidance from a
                    qualified personal trainer or physiotherapist to learn proper form before
                    attempting more advanced exercises.
                </p>
            </div>
        ),
    },
    {
        id: "mental-health",
        title: "Mental Health & Wellbeing",
        content: (
            <div className="legal-content">
                <p>
                    myFit is committed to promoting a positive, balanced relationship with fitness and
                    body image. Our programs are designed to build strength, endurance, and confidence
                    — not to promote extreme dieting, overtraining, or unrealistic body standards.
                </p>
                <p>
                    If you find that engagement with fitness content is negatively impacting your
                    mental health, self-esteem, or relationship with food, we encourage you to:
                </p>
                <ul>
                    <li>Take a break from the platform.</li>
                    <li>Speak with a qualified mental health professional or counsellor.</li>
                    <li>Reach out to eating disorder support organisations such as the Kenya Association of Mental Health.</li>
                </ul>
                <p>
                    Our content is not a replacement for mental health treatment or psychological
                    support services.
                </p>
            </div>
        ),
    },
    {
        id: "liability",
        title: "Limitation of Liability",
        content: (
            <div className="legal-content">
                <p>
                    To the fullest extent permitted by Kenyan law, <strong>myFit, its directors,
                    employees, coaches, trainers, and affiliates</strong> shall not be liable for any
                    injury, illness, health complications, or adverse outcomes resulting from:
                </p>
                <ul>
                    <li>Following any exercise program, nutritional plan, or wellness recommendation on our platform.</li>
                    <li>Failure to consult a healthcare professional before beginning a program.</li>
                    <li>Failure to disclose pre-existing medical conditions or contraindications to exercise.</li>
                    <li>Exercising beyond your current physical capabilities.</li>
                    <li>Improper execution of exercises demonstrated in our content.</li>
                </ul>
                <p>
                    By using our Services, you voluntarily assume all risks associated with physical
                    fitness activities and acknowledge that myFit provides its content in good faith
                    for general wellness purposes only.
                </p>
            </div>
        ),
    },
    {
        id: "emergency",
        title: "Emergency Information",
        content: (
            <div className="legal-content">
                <div className="highlight-box" style={{ borderLeftColor: "#ef4444", background: "#fef2f2" }}>
                    <strong style={{ color: "#991b1b" }}>🚨 In case of a medical emergency, immediately call your local emergency services:</strong>
                    <ul style={{ color: "#7f1d1d", marginTop: "0.5rem" }}>
                        <li><strong>Kenya Emergency Number:</strong> 999 or 112</li>
                        <li><strong>Nairobi Hospital Emergency:</strong> +254 20 284 5000</li>
                        <li><strong>Kenyatta National Hospital:</strong> +254 20 272 6300</li>
                    </ul>
                </div>
                <p>
                    Do not rely on myFit or any online platform during a medical emergency. Always have
                    access to emergency contact numbers and, if possible, exercise with a partner
                    or in a supervised environment.
                </p>
            </div>
        ),
    },
    {
        id: "updates",
        title: "Updates to This Disclaimer",
        content: (
            <div className="legal-content">
                <p>
                    We may update this Health Disclaimer periodically to reflect changes in our
                    programs, new scientific understanding, or regulatory requirements. Updates will
                    be posted on this page with a revised effective date.
                </p>
                <p>
                    If you have questions about this Health Disclaimer or specific concerns about
                    participating in our programs, please contact us at{" "}
                    <a href="mailto:myfitrainingg@gmail.com">myfitrainingg@gmail.com</a>.
                </p>
            </div>
        ),
    },
];

export default function HealthDisclaimerPage() {
    return (
        <LegalPage
            title="Health Disclaimer"
            subtitle="Your safety is our top priority. Please read this important information before starting any myFit program or following our nutritional advice."
            effectiveDate="August 5, 2026"
            lastUpdated="August 5, 2026"
            accentColor="#ef4444"
            icon="❤️‍🩹"
            sections={sections}
        />
    );
}
