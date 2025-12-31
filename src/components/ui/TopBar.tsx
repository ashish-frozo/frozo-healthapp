import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

interface TopBarProps {
    title: string;
    showBack?: boolean;
    rightAction?: React.ReactNode;
    transparent?: boolean;
}

export function TopBar({ title, showBack = false, rightAction, transparent = false }: TopBarProps) {
    const navigate = useNavigate();
    const { state } = useApp();
    const unreadCount = state.notifications.filter(n => !n.isRead).length;

    return (
        <header
            className={`sticky top-0 z-20 flex items-center justify-between px-4 py-3 ${transparent
                ? 'bg-transparent'
                : 'bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800'
                }`}
        >
            {showBack ? (
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center justify-center size-10 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors text-text-primary-light dark:text-text-primary-dark"
                    aria-label="Go back"
                >
                    <span className="material-symbols-outlined text-2xl">arrow_back</span>
                </button>
            ) : (
                <div className="size-10" />
            )}

            <h1 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark tracking-tight">
                {title}
            </h1>

            {rightAction || (
                <button
                    onClick={() => navigate('/notifications')}
                    className="relative flex items-center justify-center size-10 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors text-text-primary-light dark:text-text-primary-dark"
                    aria-label="Notifications"
                >
                    <span className="material-symbols-outlined text-2xl">notifications</span>
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 size-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-background-light dark:border-background-dark">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>
            )}
        </header>
    );
}
