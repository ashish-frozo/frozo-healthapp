import React from 'react';
import { useNavigate } from 'react-router-dom';

export function PrivacyPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 p-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h1 className="text-xl font-bold">Privacy Policy</h1>
                    <div className="w-10"></div> {/* Spacer */}
                </div>
            </header>

            <main className="max-w-4xl mx-auto p-6 md:p-12">
                <div className="bg-surface-light dark:bg-surface-dark rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-100 dark:border-gray-800">
                    <div className="prose dark:prose-invert max-w-none space-y-8">
                        <div>
                            <h2 className="text-3xl font-bold mb-4">Privacy Policy</h2>
                            <p className="text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                                Last updated: January 30, 2026
                            </p>
                        </div>

                        <section className="space-y-4">
                            <h3 className="text-xl font-bold text-primary">1. Our Commitment to Privacy</h3>
                            <p className="leading-relaxed">
                                At KinCare, operating under <strong>Frozo Software Pvt ltd</strong>, we understand that your health data is deeply personal. Our mission is to help you care for your family while maintaining the highest standards of data security and privacy. We do not sell your personal health information to advertisers or third parties.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h3 className="text-xl font-bold text-primary">2. Information We Collect</h3>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>Health Data:</strong> Vitals (Blood Pressure, Glucose), Symptoms, and medical records you upload.</li>
                                <li><strong>Account Information:</strong> Your phone number and profile details (name, age, relationship).</li>
                                <li><strong>Emergency Contacts:</strong> Information provided for automated WhatsApp alerts.</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h3 className="text-xl font-bold text-primary">3. How We Use Your Data</h3>
                            <p className="leading-relaxed">
                                Your data is used exclusively to:
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Provide health tracking and trend visualization.</li>
                                <li>Coordinate care within your household.</li>
                                <li>Send emergency alerts to your designated caregivers.</li>
                                <li>Generate AI insights to help you understand your health trends.</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h3 className="text-xl font-bold text-primary">4. Data Security</h3>
                            <p className="leading-relaxed">
                                We employ industry-standard encryption for data at rest and in transit. Your medical documents are stored in secure, access-controlled environments. Access to your data is strictly limited to you and the family members you explicitly invite.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h3 className="text-xl font-bold text-primary">5. Governing Law</h3>
                            <p className="leading-relaxed">
                                These policies are governed by the laws of India. Any disputes will be subject to the exclusive jurisdiction of the courts in [Company City], India.
                            </p>
                        </section>

                        <section className="bg-primary/5 dark:bg-primary/10 p-6 rounded-2xl border border-primary/20">
                            <h3 className="text-xl font-bold mb-2">6. Contact Us</h3>
                            <p className="mb-4">
                                If you have questions about this Privacy Policy or your data, please reach out to us:
                            </p>
                            <div className="flex items-center gap-3 text-primary font-bold">
                                <span className="material-symbols-outlined">mail</span>
                                <a href="mailto:hello@frozo.ai">hello@frozo.ai</a>
                            </div>
                            <p className="mt-4 text-sm font-medium">
                                <strong>Frozo Software Pvt ltd</strong><br />
                                Software Development Team
                            </p>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
