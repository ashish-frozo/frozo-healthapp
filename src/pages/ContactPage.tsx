import React from 'react';
import { useNavigate } from 'react-router-dom';

export function ContactPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 p-4">
                <div className="max-w-xl mx-auto flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h1 className="text-xl font-bold">Contact Support</h1>
                    <div className="w-10"></div> {/* Spacer */}
                </div>
            </header>

            <main className="max-w-xl mx-auto p-6 md:p-12">
                <div className="bg-surface-light dark:bg-surface-dark rounded-[2.5rem] p-8 md:p-10 shadow-xl border border-gray-100 dark:border-gray-800 text-center">
                    <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mx-auto mb-8 shadow-inner">
                        <span className="material-symbols-outlined text-4xl">contact_support</span>
                    </div>

                    <h2 className="text-3xl font-bold mb-4">We're here to help</h2>
                    <p className="text-text-secondary-light dark:text-text-secondary-dark text-lg mb-10 leading-relaxed">
                        Have a question, feedback, or need technical assistance? Our team at <strong>Frozo Software Pvt ltd</strong> is ready to assist you.
                    </p>

                    <div className="space-y-4">
                        <a
                            href="mailto:hello@frozo.ai"
                            className="flex items-center gap-4 p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-primary/50 transition-all shadow-sm hover:shadow-md group"
                        >
                            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined">mail</span>
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-bold text-gray-400 tracking-wider uppercase">Email Us</p>
                                <p className="text-xl font-bold text-primary">hello@frozo.ai</p>
                            </div>
                        </a>

                        <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                            <p className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark italic">
                                Support hours: Monday to Friday, 10 AM — 6 PM (IST)
                            </p>
                        </div>
                    </div>

                    <div className="mt-12 flex flex-col items-center gap-2 opacity-60">
                        <img src="/logo.png" alt="Frozo Logo" className="w-8 h-8 grayscale" />
                        <p className="text-xs font-bold uppercase tracking-[0.2em]">Frozo Software Pvt ltd</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
