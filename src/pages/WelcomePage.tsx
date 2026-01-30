import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export function WelcomePage() {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen flex flex-col bg-surface-light dark:bg-surface-dark text-text-primary-light dark:text-text-primary-dark overflow-x-hidden selection:bg-primary/30">
            {/* Animated Background */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 blur-[120px] animate-pulse-slow" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-400/20 blur-[120px] animate-pulse-slow delay-1000" />
            </div>

            {/* Navigation Bar */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-sm py-3' : 'bg-transparent py-6'}`}>
                <div className="w-full px-6 flex items-center justify-between max-w-7xl mx-auto">
                    <div className="flex items-center gap-2">
                        <img src="/logo.png" alt="KinCare Logo" className="w-10 h-10 rounded-xl shadow-lg shadow-primary/20" />
                        <span className="text-xl font-bold tracking-tight hidden sm:block bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
                            KinCare
                        </span>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate('/login?mode=login')}
                            className="px-4 py-2 text-sm font-semibold text-text-secondary-light dark:text-text-secondary-dark hover:text-primary transition-colors"
                        >
                            Log In
                        </button>
                        <button
                            onClick={() => navigate('/login?mode=signup')}
                            className="px-5 py-2 text-sm font-bold bg-primary text-white rounded-full shadow-lg shadow-primary/30 hover:bg-primary-dark hover:shadow-primary/40 transition-all active:scale-95"
                        >
                            Get Started
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 px-6 z-10">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
                    {/* Hero Content */}
                    <div className="flex flex-col items-center lg:items-start text-center lg:text-left animate-fade-in-up">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/50 dark:bg-gray-800/50 backdrop-blur-md border border-gray-200 dark:border-gray-700 text-sm font-medium mb-8 shadow-sm hover:shadow-md transition-all cursor-default">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 font-bold">
                                New: Emergency WhatsApp Alerts
                            </span>
                        </div>
                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-8">
                            Family Health <br className="hidden sm:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-500 to-purple-600">
                                Reimagined.
                            </span>
                        </h1>
                        <p className="text-xl text-text-secondary-light dark:text-text-secondary-dark mb-10 max-w-lg leading-relaxed">
                            The modern way to track vitals, manage medications, and keep your family safe. Beautiful, secure, and simple.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                            <button
                                onClick={() => navigate('/login?mode=signup')}
                                className="group h-14 px-8 bg-primary hover:bg-primary-dark text-white rounded-2xl text-lg font-bold shadow-xl shadow-primary/30 transition-all hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2"
                            >
                                Start Tracking Free
                                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </button>
                            <button
                                onClick={() => navigate('/login?mode=login')}
                                className="h-14 px-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-text-primary-light dark:text-white rounded-2xl text-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all hover:-translate-y-1 flex items-center justify-center shadow-sm hover:shadow-md"
                            >
                                I have an account
                            </button>
                        </div>
                        <div className="mt-10 flex items-center gap-4 text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-surface-dark bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold overflow-hidden shadow-sm transition-transform hover:scale-110 hover:z-10">
                                        <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-col">
                                <div className="flex text-yellow-400 text-base">
                                    {'★★★★★'.split('').map((s, i) => <span key={i}>{s}</span>)}
                                </div>
                                <span>Trusted by 1,000+ families</span>
                            </div>
                        </div>
                    </div>

                    {/* Hero Image */}
                    <div className="relative lg:h-[650px] w-full flex items-center justify-center animate-fade-in-left">
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-200 to-purple-200 dark:from-blue-900/40 dark:to-purple-900/40 rounded-[3rem] transform rotate-6 scale-90 blur-3xl opacity-60 animate-pulse-slow"></div>
                        <div className="relative w-full max-w-md lg:max-w-full aspect-[4/5] lg:aspect-auto lg:h-full rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white dark:border-gray-800 transform transition-transform hover:scale-[1.02] duration-700 group">
                            <img
                                src="/welcome-hero.jpg"
                                alt="App Dashboard Preview"
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                            />
                            {/* Floating Cards Overlay */}
                            <div className="absolute bottom-10 left-8 right-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-5 rounded-3xl shadow-2xl border border-white/40 dark:border-gray-700/50 transform transition-all duration-500 hover:-translate-y-2">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-red-500/30">
                                        <span className="material-symbols-outlined text-3xl">favorite</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">Dad's Vitals</p>
                                        <div className="flex items-baseline gap-2">
                                            <p className="text-2xl font-bold text-text-primary-light dark:text-white">120/80</p>
                                            <span className="px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-bold">Normal</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Features Section */}
            <section className="py-24 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm z-10">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                            Everything you need to care better
                        </h2>
                        <p className="text-xl text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                            Simple tools for complex caregiving needs. Designed for families, built for peace of mind.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Feature 1: Vitals */}
                        <div className="group bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:border-primary/20 transition-all duration-300 hover:-translate-y-1">
                            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-primary mb-8 group-hover:scale-110 transition-transform duration-300">
                                <span className="material-symbols-outlined text-4xl">monitor_heart</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Vitals Tracking</h3>
                            <p className="text-text-secondary-light dark:text-text-secondary-dark leading-relaxed text-lg">
                                Log Blood Pressure, Glucose, and Symptoms in seconds. Visualize trends with beautiful charts.
                            </p>
                        </div>

                        {/* Feature 2: Family */}
                        <div className="group bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:border-purple-500/20 transition-all duration-300 hover:-translate-y-1">
                            <div className="w-16 h-16 bg-purple-50 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center text-purple-600 dark:text-purple-400 mb-8 group-hover:scale-110 transition-transform duration-300">
                                <span className="material-symbols-outlined text-4xl">family_restroom</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Family Management</h3>
                            <p className="text-text-secondary-light dark:text-text-secondary-dark leading-relaxed text-lg">
                                Manage multiple profiles from one account. Perfect for caring for aging parents or children.
                            </p>
                        </div>

                        {/* Feature 3: Emergency */}
                        <div className="group bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:border-red-500/20 transition-all duration-300 hover:-translate-y-1">
                            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center text-red-600 dark:text-red-400 mb-8 group-hover:scale-110 transition-transform duration-300">
                                <span className="material-symbols-outlined text-4xl">emergency_share</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Emergency Alerts</h3>
                            <p className="text-text-secondary-light dark:text-text-secondary-dark leading-relaxed text-lg">
                                Automatically notify family members via WhatsApp if readings go above dangerous thresholds.
                            </p>
                        </div>

                        {/* Feature 4: AI Analysis */}
                        <div className="group bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:border-indigo-500/20 transition-all duration-300 hover:-translate-y-1">
                            <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-8 group-hover:scale-110 transition-transform duration-300">
                                <span className="material-symbols-outlined text-4xl">analytics</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-4">AI Health Insights</h3>
                            <p className="text-text-secondary-light dark:text-text-secondary-dark leading-relaxed text-lg">
                                Smart analysis of your health trends. Get personalized insights and early warning signals.
                            </p>
                        </div>

                        {/* Feature 5: Documents */}
                        <div className="group bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:border-orange-500/20 transition-all duration-300 hover:-translate-y-1">
                            <div className="w-16 h-16 bg-orange-50 dark:bg-orange-900/20 rounded-2xl flex items-center justify-center text-orange-600 dark:text-orange-400 mb-8 group-hover:scale-110 transition-transform duration-300">
                                <span className="material-symbols-outlined text-4xl">folder_shared</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Medical Records</h3>
                            <p className="text-text-secondary-light dark:text-text-secondary-dark leading-relaxed text-lg">
                                Securely store prescriptions, lab reports, and insurance cards. Access them anytime, anywhere.
                            </p>
                        </div>

                        {/* Feature 6: Export */}
                        <div className="group bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:border-teal-500/20 transition-all duration-300 hover:-translate-y-1">
                            <div className="w-16 h-16 bg-teal-50 dark:bg-teal-900/20 rounded-2xl flex items-center justify-center text-teal-600 dark:text-teal-400 mb-8 group-hover:scale-110 transition-transform duration-300">
                                <span className="material-symbols-outlined text-4xl">ios_share</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Easy Data Export</h3>
                            <p className="text-text-secondary-light dark:text-text-secondary-dark leading-relaxed text-lg">
                                Share reports with your doctor instantly. Export data as PDF or Excel for your next appointment.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Trust/Security Section */}
            <section className="py-24 px-6 z-10">
                <div className="max-w-5xl mx-auto relative overflow-hidden bg-gradient-to-br from-primary to-blue-700 rounded-[3rem] p-10 md:p-20 text-center text-white shadow-2xl">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>

                    <div className="relative z-10">
                        <div className="w-20 h-20 bg-white/20 backdrop-blur-lg rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
                            <span className="material-symbols-outlined text-5xl text-white">shield_lock</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">Your Data is Private & Secure</h2>
                        <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto leading-relaxed">
                            We believe health data belongs to you. All data is encrypted and stored securely. We never sell your personal information.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4 md:gap-8">
                            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20">
                                <span className="material-symbols-outlined text-green-400">check_circle</span>
                                <span className="font-semibold">End-to-End Encryption</span>
                            </div>
                            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20">
                                <span className="material-symbols-outlined text-green-400">check_circle</span>
                                <span className="font-semibold">GDPR Compliant</span>
                            </div>
                            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20">
                                <span className="material-symbols-outlined text-green-400">check_circle</span>
                                <span className="font-semibold">No Ads Tracking</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="py-24 bg-white dark:bg-gray-900 relative z-10">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                            Simple, Transparent Pricing
                        </h2>
                        <p className="text-xl text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                            Choose credits for flexibility or subscribe for unlimited access
                        </p>
                    </div>

                    {/* Free Tier - Highlighted */}
                    <div className="max-w-2xl mx-auto mb-12">
                        <div className="relative bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-8 text-white shadow-lg">
                            <div className="absolute top-0 right-6 -translate-y-1/2 bg-white text-emerald-600 px-4 py-1.5 rounded-full text-sm font-bold shadow-lg">
                                🎉 Free Forever
                            </div>
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                                <div className="flex-1">
                                    <h3 className="text-2xl font-bold mb-2">Start Free</h3>
                                    <p className="text-white/80 mb-4">Get 10 credits on signup — no card required</p>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-emerald-200">check_circle</span>
                                            <span>~5 Health Insights</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-emerald-200">check_circle</span>
                                            <span>Unlimited BP & Glucose Tracking</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-emerald-200">check_circle</span>
                                            <span>Family Profiles</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-emerald-200">check_circle</span>
                                            <span>Document Storage</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="bg-white text-emerald-600 font-bold px-8 py-4 rounded-xl hover:bg-gray-100 transition-all shadow-lg whitespace-nowrap"
                                >
                                    Try Now — It's Free →
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Subscription - Featured */}
                    <div className="max-w-lg mx-auto mb-16">
                        <div className="relative bg-gradient-to-br from-primary to-indigo-600 rounded-[2rem] p-8 text-white shadow-2xl shadow-primary/30">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-primary px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                                ✨ Best Value
                            </div>
                            <div className="text-center mb-6">
                                <h3 className="text-2xl font-bold mb-2">Care+ Subscription</h3>
                                <div className="flex items-baseline justify-center gap-1">
                                    <span className="text-5xl font-extrabold">$9.99</span>
                                    <span className="text-white/80">/ month</span>
                                </div>
                                <p className="text-white/80 mt-2">Cancel anytime</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-green-300">check_circle</span>
                                    <span>Unlimited Health Insights</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-green-300">check_circle</span>
                                    <span>Unlimited Lab Translations</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-green-300">check_circle</span>
                                    <span>Unlimited Doctor Briefs</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-green-300">check_circle</span>
                                    <span>Priority Support</span>
                                </div>
                                <div className="flex items-center gap-2 col-span-2 justify-center">
                                    <span className="material-symbols-outlined text-green-300">check_circle</span>
                                    <span>Family Sharing (up to 5 profiles)</span>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full py-4 rounded-xl font-bold bg-white text-primary hover:bg-gray-100 transition-all shadow-lg"
                            >
                                Start Free Trial
                            </button>
                        </div>
                    </div>

                    <div className="text-center mb-8">
                        <p className="text-text-secondary-light dark:text-text-secondary-dark">
                            Or purchase credits as needed
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {/* Try It Out Pack */}
                        <div className="relative bg-surface-light dark:bg-surface-dark rounded-[2rem] p-8 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
                            <div className="mb-6">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-white mb-4">
                                    <span className="material-symbols-outlined">rocket_launch</span>
                                </div>
                                <h3 className="text-xl font-bold text-text-primary-light dark:text-white mb-2">Try It Out</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-extrabold text-text-primary-light dark:text-white">$2.99</span>
                                    <span className="text-text-secondary-light dark:text-text-secondary-dark">/ one-time</span>
                                </div>
                            </div>
                            <div className="flex-1 space-y-4 mb-8">
                                <div className="flex items-center gap-3 text-text-secondary-light dark:text-text-secondary-dark">
                                    <span className="material-symbols-outlined text-green-500">check_circle</span>
                                    <span>50 AI Credits</span>
                                </div>
                                <div className="flex items-center gap-3 text-text-secondary-light dark:text-text-secondary-dark">
                                    <span className="material-symbols-outlined text-green-500">check_circle</span>
                                    <span>~25 Health Insights</span>
                                </div>
                                <div className="flex items-center gap-3 text-text-secondary-light dark:text-text-secondary-dark">
                                    <span className="material-symbols-outlined text-green-500">check_circle</span>
                                    <span>Perfect for getting started</span>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full py-4 rounded-xl font-bold border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all"
                            >
                                Get Started
                            </button>
                        </div>

                        {/* Monthly Care Pack */}
                        <div className="relative bg-surface-light dark:bg-surface-dark rounded-[2rem] p-8 border-2 border-blue-500 shadow-xl z-10 flex flex-col">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                                Popular
                            </div>
                            <div className="mb-6">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white mb-4">
                                    <span className="material-symbols-outlined">favorite</span>
                                </div>
                                <h3 className="text-xl font-bold text-text-primary-light dark:text-white mb-2">Monthly Care</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-extrabold text-text-primary-light dark:text-white">$7.99</span>
                                    <span className="text-text-secondary-light dark:text-text-secondary-dark">/ one-time</span>
                                </div>
                            </div>
                            <div className="flex-1 space-y-4 mb-8">
                                <div className="flex items-center gap-3 text-text-secondary-light dark:text-text-secondary-dark">
                                    <span className="material-symbols-outlined text-green-500">check_circle</span>
                                    <span className="font-bold text-blue-600 dark:text-blue-400">150 AI Credits</span>
                                </div>
                                <div className="flex items-center gap-3 text-text-secondary-light dark:text-text-secondary-dark">
                                    <span className="material-symbols-outlined text-green-500">check_circle</span>
                                    <span>~75 Health Insights</span>
                                </div>
                                <div className="flex items-center gap-3 text-text-secondary-light dark:text-text-secondary-dark">
                                    <span className="material-symbols-outlined text-green-500">check_circle</span>
                                    <span>Best for regular tracking</span>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all hover:-translate-y-1"
                            >
                                Get Monthly Care
                            </button>
                        </div>

                        {/* Yearly Care Pack */}
                        <div className="relative bg-surface-light dark:bg-surface-dark rounded-[2rem] p-8 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
                            <div className="mb-6">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white mb-4">
                                    <span className="material-symbols-outlined">family_restroom</span>
                                </div>
                                <h3 className="text-xl font-bold text-text-primary-light dark:text-white mb-2">Yearly Care</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-extrabold text-text-primary-light dark:text-white">$19.99</span>
                                    <span className="text-text-secondary-light dark:text-text-secondary-dark">/ one-time</span>
                                </div>
                            </div>
                            <div className="flex-1 space-y-4 mb-8">
                                <div className="flex items-center gap-3 text-text-secondary-light dark:text-text-secondary-dark">
                                    <span className="material-symbols-outlined text-green-500">check_circle</span>
                                    <span>500 AI Credits</span>
                                </div>
                                <div className="flex items-center gap-3 text-text-secondary-light dark:text-text-secondary-dark">
                                    <span className="material-symbols-outlined text-green-500">check_circle</span>
                                    <span>~250 Health Insights</span>
                                </div>
                                <div className="flex items-center gap-3 text-text-secondary-light dark:text-text-secondary-dark">
                                    <span className="material-symbols-outlined text-green-500">check_circle</span>
                                    <span>Maximum value for families</span>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full py-4 rounded-xl font-bold border-2 border-gray-200 dark:border-gray-700 text-text-primary-light dark:text-white hover:border-primary hover:text-primary transition-all"
                            >
                                Get Yearly Care
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-gray-200 dark:border-gray-800 mt-auto bg-white dark:bg-gray-900 z-10">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2 opacity-80">
                        <img src="/logo.png" alt="KinCare Logo" className="w-8 h-8 rounded-lg" />
                        <span className="font-bold text-lg">KinCare</span>
                    </div>
                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                        © {new Date().getFullYear()} KinCare. All rights reserved.
                    </p>
                    <div className="flex gap-8 text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">
                        <a href="#" className="hover:text-primary transition-colors">Privacy</a>
                        <a href="#" className="hover:text-primary transition-colors">Terms</a>
                        <a href="#" className="hover:text-primary transition-colors">Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
