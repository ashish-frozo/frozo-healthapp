import { useNavigate } from 'react-router-dom';

export function WelcomePage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col bg-surface-light dark:bg-surface-dark text-text-primary-light dark:text-text-primary-dark overflow-x-hidden">
            {/* Navigation Bar */}
            <nav className="w-full px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                        <span className="material-symbols-outlined text-2xl">medical_services</span>
                    </div>
                    <span className="text-xl font-bold tracking-tight hidden sm:block">Frozo Health</span>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => navigate('/login')}
                        className="px-4 py-2 text-sm font-semibold text-text-secondary-light dark:text-text-secondary-dark hover:text-primary transition-colors"
                    >
                        Log In
                    </button>
                    <button
                        onClick={() => navigate('/login')}
                        className="px-5 py-2 text-sm font-bold bg-primary text-white rounded-lg shadow-md shadow-primary/20 hover:bg-primary-dark transition-all active:scale-95"
                    >
                        Get Started
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="relative pt-12 pb-20 lg:pt-24 lg:pb-32 px-6">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
                    {/* Hero Content */}
                    <div className="flex flex-col items-center lg:items-start text-center lg:text-left z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-primary text-sm font-semibold mb-6 border border-blue-100 dark:border-blue-800">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                            New: Emergency WhatsApp Alerts
                        </div>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6">
                            Family Health <br className="hidden sm:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
                                Tracking, Simplified.
                            </span>
                        </h1>
                        <p className="text-lg sm:text-xl text-text-secondary-light dark:text-text-secondary-dark mb-8 max-w-lg leading-relaxed">
                            Monitor blood pressure, glucose, and vitals for your loved ones. Get real-time emergency alerts when it matters most.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                            <button
                                onClick={() => navigate('/login')}
                                className="h-14 px-8 bg-primary hover:bg-primary-dark text-white rounded-xl text-lg font-bold shadow-xl shadow-primary/30 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
                            >
                                Start Tracking Free
                                <span className="material-symbols-outlined">arrow_forward</span>
                            </button>
                            <button
                                onClick={() => navigate('/login')}
                                className="h-14 px-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-text-primary-light dark:text-white rounded-xl text-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center justify-center"
                            >
                                I have an account
                            </button>
                        </div>
                        <div className="mt-8 flex items-center gap-4 text-sm text-text-secondary-light dark:text-text-secondary-dark">
                            <div className="flex -space-x-2">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-surface-dark bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold overflow-hidden">
                                        <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                            <p>Trusted by 1,000+ families</p>
                        </div>
                    </div>

                    {/* Hero Image */}
                    <div className="relative lg:h-[600px] w-full flex items-center justify-center">
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-[3rem] transform rotate-3 scale-95 blur-3xl opacity-60"></div>
                        <div className="relative w-full max-w-md lg:max-w-full aspect-[4/5] lg:aspect-auto lg:h-full rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-gray-800 transform transition-transform hover:scale-[1.01] duration-500">
                            <img
                                src="/welcome-hero.jpg"
                                alt="App Dashboard Preview"
                                className="w-full h-full object-cover"
                            />
                            {/* Floating Cards Overlay */}
                            <div className="absolute bottom-8 left-8 right-8 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/20">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                                        <span className="material-symbols-outlined">favorite</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">Dad's Blood Pressure</p>
                                        <p className="text-lg font-bold text-text-primary-light dark:text-white">120/80 <span className="text-sm font-normal text-green-500">Normal</span></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Features Section */}
            <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to care better</h2>
                        <p className="text-lg text-text-secondary-light dark:text-text-secondary-dark">
                            Simple tools for complex caregiving needs. Designed for families, built for peace of mind.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-primary mb-6">
                                <span className="material-symbols-outlined text-3xl">monitor_heart</span>
                            </div>
                            <h3 className="text-xl font-bold mb-3">Vitals Tracking</h3>
                            <p className="text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                                Log Blood Pressure, Glucose, and Symptoms in seconds. Visualize trends with beautiful charts.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                            <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center text-purple-600 dark:text-purple-400 mb-6">
                                <span className="material-symbols-outlined text-3xl">family_restroom</span>
                            </div>
                            <h3 className="text-xl font-bold mb-3">Family Management</h3>
                            <p className="text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                                Manage multiple profiles from one account. Perfect for caring for aging parents or children.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                            <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center text-red-600 dark:text-red-400 mb-6">
                                <span className="material-symbols-outlined text-3xl">emergency_share</span>
                            </div>
                            <h3 className="text-xl font-bold mb-3">Emergency Alerts</h3>
                            <p className="text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                                Automatically notify family members via WhatsApp if readings go above dangerous thresholds.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Trust/Security Section */}
            <section className="py-20 px-6">
                <div className="max-w-4xl mx-auto bg-primary/5 dark:bg-primary/10 rounded-[2.5rem] p-8 md:p-12 text-center border border-primary/10">
                    <span className="material-symbols-outlined text-5xl text-primary mb-6">shield_lock</span>
                    <h2 className="text-3xl font-bold mb-4">Your Data is Private & Secure</h2>
                    <p className="text-lg text-text-secondary-light dark:text-text-secondary-dark mb-8 max-w-2xl mx-auto">
                        We believe health data belongs to you. All data is encrypted and stored securely. We never sell your personal information.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4 md:gap-8">
                        <div className="flex items-center gap-2 text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
                            <span className="material-symbols-outlined text-green-500">check_circle</span>
                            End-to-End Encryption
                        </div>
                        <div className="flex items-center gap-2 text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
                            <span className="material-symbols-outlined text-green-500">check_circle</span>
                            GDPR Compliant
                        </div>
                        <div className="flex items-center gap-2 text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
                            <span className="material-symbols-outlined text-green-500">check_circle</span>
                            No Ads Tracking
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-gray-200 dark:border-gray-800 mt-auto">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2 opacity-80">
                        <span className="material-symbols-outlined text-primary">medical_services</span>
                        <span className="font-bold">Frozo Health</span>
                    </div>
                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                        © {new Date().getFullYear()} Frozo Health. All rights reserved.
                    </p>
                    <div className="flex gap-6 text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">
                        <a href="#" className="hover:text-primary">Privacy</a>
                        <a href="#" className="hover:text-primary">Terms</a>
                        <a href="#" className="hover:text-primary">Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
