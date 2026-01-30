import React from 'react';
import { useNavigate } from 'react-router-dom';

export function TermsPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 p-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h1 className="text-xl font-bold">Terms of Service</h1>
                    <div className="w-10"></div> {/* Spacer */}
                </div>
            </header>

            <main className="max-w-4xl mx-auto p-6 md:p-12">
                <div className="bg-surface-light dark:bg-surface-dark rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-100 dark:border-gray-800">
                    <div className="prose dark:prose-invert max-w-none space-y-8">
                        <div>
                            <h2 className="text-3xl font-bold mb-4">Terms & Conditions</h2>
                            <p className="text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                                Last updated: January 30, 2026
                            </p>
                        </div>

                        <section className="space-y-4">
                            <h3 className="text-xl font-bold text-primary">1. Acceptable Use</h3>
                            <p className="leading-relaxed">
                                By using KinCare, provided by <strong>Frozo Software Pvt ltd</strong>, you agree to provide accurate information and maintain the security of your account. You are responsible for all activity that occurs under your mobile number.
                            </p>
                        </section>

                        <section className="bg-red-50 dark:bg-red-900/10 p-6 rounded-2xl border border-red-100 dark:border-red-900/20">
                            <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">2. Medical Disclaimer</h3>
                            <p className="leading-relaxed font-medium">
                                KinCare is a health tracking and management tool. It is <strong>NOT</strong> a medical device and does <strong>NOT</strong> provide medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
                            </p>
                            <p className="mt-2 text-sm">
                                <strong>KinCare should not be relied upon in emergency situations.</strong>
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h3 className="text-xl font-bold text-primary">3. Caregiver Alerts</h3>
                            <p className="leading-relaxed">
                                Our automated WhatsApp alert system depends on third-party network connectivity and your configuration. <strong>Frozo Software Pvt ltd</strong> cannot guarantee the delivery of alerts in case of network outages or incorrect contact information.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h3 className="text-xl font-bold text-primary">4. Subscriptions & Credits</h3>
                            <p className="leading-relaxed">
                                Payments for AI credits or Care+ subscriptions are processed securely. Subscriptions can be cancelled at any time through your account settings. Credits are non-refundable but do not expire.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h3 className="text-xl font-bold text-primary">5. Termination</h3>
                            <p className="leading-relaxed">
                                We reserve the right to suspend or terminate accounts that violate our terms or engage in fraudulent activity.
                            </p>
                        </section>

                        <section className="bg-primary/5 dark:bg-primary/10 p-6 rounded-2xl border border-primary/20">
                            <h3 className="text-xl font-bold mb-2">6. Intellectual Property</h3>
                            <p className="leading-relaxed">
                                All software, designs, and content within KinCare are the exclusive property of <strong>Frozo Software Pvt ltd</strong>.
                            </p>
                        </section>

                        <div className="flex flex-col items-center pt-8 border-t border-gray-100 dark:border-gray-800">
                            <p className="text-sm font-bold opacity-50">© 2026 Frozo Software Pvt ltd</p>
                            <a href="mailto:hello@frozo.ai" className="text-primary font-bold text-sm mt-1">hello@frozo.ai</a>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
