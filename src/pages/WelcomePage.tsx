import { useNavigate } from 'react-router-dom';

export function WelcomePage() {
    const navigate = useNavigate();

    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-hidden max-w-md mx-auto shadow-2xl bg-background-light dark:bg-background-dark">
            {/* Header Image Area */}
            <div className="relative w-full h-[35vh] min-h-[280px] shrink-0">
                {/* Image with gradient overlay */}
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage: 'url("/welcome-hero.jpg")'
                    }}
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background-light dark:from-background-dark via-transparent to-transparent" />
            </div>

            {/* Main Content Area */}
            <div className="flex flex-col flex-1 px-6 relative z-10 -mt-6 pb-6">
                {/* Headline & Branding */}
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="w-16 h-16 bg-primary rounded-2xl shadow-lg flex items-center justify-center mb-4 text-white transform -rotate-3">
                        <span className="material-symbols-outlined" style={{ fontSize: '36px' }}>medical_services</span>
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-text-primary-light dark:text-white leading-tight mb-2">
                        Health Logbook
                    </h1>
                    <p className="text-lg text-text-secondary-light dark:text-text-secondary-dark font-medium leading-normal max-w-[280px]">
                        Care for your family with confidence.
                    </p>
                </div>

                {/* Features List */}
                <div className="flex flex-col gap-4 mb-8">
                    {/* Feature 1: Secure */}
                    <div className="flex flex-row items-center gap-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-50 dark:bg-primary/20 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>shield_person</span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <h2 className="text-text-primary-light dark:text-white text-base font-bold leading-tight">Private & Secure</h2>
                            <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm font-normal leading-normal">Your data stays on your device.</p>
                        </div>
                    </div>

                    {/* Feature 2: Logging */}
                    <div className="flex flex-row items-center gap-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-50 dark:bg-primary/20 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>monitor_heart</span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <h2 className="text-text-primary-light dark:text-white text-base font-bold leading-tight">Simple Logging</h2>
                            <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm font-normal leading-normal">Track BP & Glucose in seconds.</p>
                        </div>
                    </div>

                    {/* Feature 3: Ad-Free */}
                    <div className="flex flex-row items-center gap-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-50 dark:bg-primary/20 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>block</span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <h2 className="text-text-primary-light dark:text-white text-base font-bold leading-tight">Ad-Free Experience</h2>
                            <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm font-normal leading-normal">No distractions, just care.</p>
                        </div>
                    </div>
                </div>

                {/* Spacer */}
                <div className="flex-grow" />

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 mt-4">
                    <button
                        onClick={() => navigate('/login')}
                        className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 px-5 bg-primary hover:bg-primary-dark transition-colors text-white text-lg font-bold leading-normal tracking-wide shadow-lg shadow-primary/30"
                    >
                        Get Started
                    </button>
                    <button
                        onClick={() => navigate('/login')}
                        className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-4 bg-transparent text-text-primary-light dark:text-text-secondary-dark hover:text-primary dark:hover:text-primary transition-colors text-sm font-bold leading-normal tracking-wide"
                    >
                        I already have an account
                    </button>
                </div>
            </div>
        </div>
    );
}
