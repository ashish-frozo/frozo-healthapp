import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { TopBar } from '../components/ui';
import { profileService } from '../services/profileService';

type Relationship = 'myself' | 'parent' | 'partner' | 'child' | 'other';

export function CreateProfilePage() {
    const [name, setName] = useState('');
    const [relationship, setRelationship] = useState<Relationship>('myself');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [loading, setLoading] = useState(false);
    const [checkingExisting, setCheckingExisting] = useState(true);
    const navigate = useNavigate();
    const { dispatch, syncData } = useApp();

    // Check if user already has profiles on the backend
    useEffect(() => {
        const checkExistingProfiles = async () => {
            try {
                const profiles = await profileService.getProfiles();
                if (profiles && profiles.length > 0) {
                    console.log('User already has profiles, syncing and redirecting to home');
                    // User already has profiles - sync data and redirect
                    await syncData();
                    navigate('/', { replace: true });
                    return;
                }
            } catch (error) {
                console.error('Error checking existing profiles:', error);
            } finally {
                setCheckingExisting(false);
            }
        };
        checkExistingProfiles();
    }, [navigate, syncData]);

    const relationships: { value: Relationship; label: string; icon?: string }[] = [
        { value: 'myself', label: 'Myself', icon: 'face' },
        { value: 'parent', label: 'Parent' },
        { value: 'partner', label: 'Partner' },
        { value: 'child', label: 'Child' },
        { value: 'other', label: 'Other' },
    ];

    const handleCreateProfile = async () => {
        if (!name.trim()) return;

        setLoading(true);
        try {
            const profile = await profileService.createProfile({
                name: name.trim(),
                relationship,
                dateOfBirth,
            });

            dispatch({ type: 'ADD_PROFILE', payload: profile });
            navigate('/');
        } catch (error) {
            console.error('Create profile error:', error);
            alert('Failed to create profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Show loading while checking for existing profiles
    if (checkingExisting) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-surface-light dark:bg-surface-dark">
                <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
                <p className="text-text-secondary-light dark:text-text-secondary-dark">Checking account...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-surface-light dark:bg-surface-dark md:bg-gray-50 md:dark:bg-gray-900 md:items-center md:justify-center md:p-6">
            <div className="w-full max-w-md md:bg-white md:dark:bg-gray-800 md:rounded-3xl md:shadow-xl md:border md:border-gray-100 md:dark:border-gray-700 md:overflow-hidden flex flex-col h-full md:h-auto">
                <div className="md:hidden">
                    <TopBar title="Create First Profile" showBack />
                </div>

                {/* Desktop Header */}
                <div className="hidden md:flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
                    <h1 className="text-xl font-bold">Create First Profile</h1>
                    <div className="flex items-center gap-2 text-primary">
                        <span className="material-symbols-outlined">health_and_safety</span>
                        <span className="font-bold">KinCare</span>
                    </div>
                </div>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 pb-32 md:pb-6">
                    {/* Profile Header */}
                    <section className="flex flex-col items-center mb-10">
                        <div className="relative group cursor-pointer">
                            {/* Avatar Placeholder */}
                            <div className="w-32 h-32 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-soft">
                                <span className="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600">person</span>
                            </div>
                            {/* Edit Badge */}
                            <div className="absolute bottom-1 right-1 bg-primary text-white p-2.5 rounded-full border-4 border-white dark:border-surface-dark shadow-md flex items-center justify-center">
                                <span className="material-symbols-outlined text-lg">photo_camera</span>
                            </div>
                        </div>
                        <div className="mt-6 text-center max-w-[280px]">
                            <h2 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark leading-tight mb-2">
                                Who is this profile for?
                            </h2>
                            <p className="text-text-secondary-light dark:text-text-secondary-dark text-base font-normal leading-relaxed">
                                Start by adding yourself or the person you care for.
                            </p>
                        </div>
                    </section>

                    {/* Form Fields */}
                    <form className="flex flex-col gap-8">
                        {/* Name Input */}
                        <div>
                            <label className="block text-base font-bold text-text-primary-light dark:text-text-primary-dark mb-3 ml-1">
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Mary Smith"
                                className="w-full h-16 px-5 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-lg text-text-primary-light dark:text-text-primary-dark placeholder:text-gray-400 focus:border-primary focus:ring-0 focus:outline-none transition-all shadow-sm"
                            />
                        </div>

                        {/* Relationship Selection */}
                        <div>
                            <label className="block text-base font-bold text-text-primary-light dark:text-text-primary-dark mb-3 ml-1">
                                Relationship
                            </label>
                            <div className="flex flex-wrap gap-3">
                                {relationships.map((rel) => (
                                    <button
                                        key={rel.value}
                                        type="button"
                                        onClick={() => setRelationship(rel.value)}
                                        className={`flex-grow md:flex-grow-0 h-12 px-6 rounded-full font-medium text-base flex items-center justify-center gap-2 transition-all active:scale-95 ${relationship === rel.value
                                            ? 'bg-primary text-white shadow-glow border border-transparent'
                                            : 'bg-white dark:bg-gray-800 text-text-secondary-light dark:text-text-secondary-dark border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                                            }`}
                                    >
                                        {rel.icon && <span className="material-symbols-outlined text-xl">{rel.icon}</span>}
                                        {rel.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Date of Birth */}
                        <div>
                            <label className="block text-base font-bold text-text-primary-light dark:text-text-primary-dark mb-3 ml-1">
                                Date of Birth
                            </label>
                            <div className="relative">
                                <input
                                    type="date"
                                    value={dateOfBirth}
                                    onChange={(e) => setDateOfBirth(e.target.value)}
                                    className="w-full h-16 px-5 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-lg text-text-primary-light dark:text-text-primary-dark focus:border-primary focus:ring-0 focus:outline-none transition-all shadow-sm"
                                />
                                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <span className="material-symbols-outlined text-gray-400 text-2xl">calendar_today</span>
                                </div>
                            </div>
                            <div className="flex items-start gap-2 mt-3 px-1">
                                <span className="material-symbols-outlined text-gray-400 text-sm mt-0.5">info</span>
                                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark leading-snug">
                                    Used to help us track age-specific health needs.
                                </p>
                            </div>
                        </div>
                    </form>
                </main>

                {/* Fixed Bottom Action (Mobile) / Inline Action (Desktop) */}
                <div className="fixed bottom-0 left-0 right-0 md:static bg-surface-light/95 dark:bg-surface-dark/95 md:bg-transparent backdrop-blur-sm border-t border-gray-100 dark:border-gray-800 md:border-none p-4 pb-8 md:p-6 md:pb-6 z-20 max-w-md mx-auto md:max-w-none">
                    <button
                        onClick={handleCreateProfile}
                        disabled={!name.trim() || loading}
                        className="w-full h-16 bg-primary hover:bg-primary-dark disabled:bg-gray-300 disabled:dark:bg-gray-700 text-white rounded-xl text-lg font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                    >
                        {loading ? (
                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <span>Create Profile</span>
                                <span className="material-symbols-outlined">arrow_forward</span>
                            </>
                        )}
                    </button>
                    <div className="flex items-center justify-center gap-2 mt-4 text-gray-400">
                        <span className="material-symbols-outlined text-base">lock</span>
                        <span className="text-xs font-medium tracking-wide">Your data is stored securely in the cloud</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
