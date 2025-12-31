import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { TopBar, BottomNav } from '../components/ui';
import { AppNotification } from '../types';

export function NotificationPage() {
    const navigate = useNavigate();
    const { state, markNotificationRead, dispatch } = useApp();

    const notifications = state.notifications;

    const getIcon = (type: AppNotification['type']) => {
        switch (type) {
            case 'insight': return 'auto_awesome';
            case 'reminder': return 'notifications_active';
            case 'security': return 'security';
            case 'system': return 'info';
            default: return 'notifications';
        }
    };

    const getIconColor = (type: AppNotification['type']) => {
        switch (type) {
            case 'insight': return 'text-primary';
            case 'reminder': return 'text-amber-500';
            case 'security': return 'text-red-500';
            case 'system': return 'text-blue-500';
            default: return 'text-gray-500';
        }
    };

    const getIconBg = (type: AppNotification['type']) => {
        switch (type) {
            case 'insight': return 'bg-primary/10';
            case 'reminder': return 'bg-amber-50';
            case 'security': return 'bg-red-50';
            case 'system': return 'bg-blue-50';
            default: return 'bg-gray-50';
        }
    };

    const handleNotificationClick = (notif: AppNotification) => {
        markNotificationRead(notif.id);
        if (notif.actionUrl) {
            navigate(notif.actionUrl);
        }
    };

    const clearAll = () => {
        dispatch({ type: 'CLEAR_NOTIFICATIONS' });
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col pb-24 max-w-md mx-auto">
            <TopBar
                title="Notifications"
                showBack
                rightAction={
                    notifications.length > 0 && (
                        <button
                            onClick={clearAll}
                            className="text-sm font-bold text-primary px-2 py-1"
                        >
                            Clear All
                        </button>
                    )
                }
            />

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {notifications.length > 0 ? (
                    notifications.map((notif) => (
                        <button
                            key={notif.id}
                            onClick={() => handleNotificationClick(notif)}
                            className={`w-full flex gap-4 p-4 rounded-2xl border transition-all active:scale-[0.98] text-left ${notif.isRead
                                ? 'bg-surface-light dark:bg-surface-dark border-gray-100 dark:border-gray-800 opacity-70'
                                : 'bg-white dark:bg-gray-800 border-primary/20 shadow-sm ring-1 ring-primary/5'
                                }`}
                        >
                            <div className={`shrink-0 size-12 rounded-xl flex items-center justify-center ${getIconBg(notif.type)}`}>
                                <span className={`material-symbols-outlined ${getIconColor(notif.type)} ${notif.type === 'insight' ? 'filled' : ''}`}>
                                    {getIcon(notif.type)}
                                </span>
                            </div>

                            <div className="flex-1 min-w-0 space-y-1">
                                <div className="flex justify-between items-start gap-2">
                                    <h3 className={`font-bold leading-tight ${notif.isRead ? 'text-text-secondary-light dark:text-text-secondary-dark' : 'text-text-primary-light dark:text-text-primary-dark'}`}>
                                        {notif.title}
                                    </h3>
                                    {!notif.isRead && (
                                        <div className="size-2 rounded-full bg-primary shrink-0 mt-1.5" />
                                    )}
                                </div>
                                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark line-clamp-2 leading-relaxed">
                                    {notif.message}
                                </p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pt-1">
                                    {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                                {notif.actionUrl && !notif.isRead && (
                                    <div className="pt-3">
                                        <div className="inline-flex items-center gap-1 text-xs font-bold text-primary bg-primary/5 px-3 py-1.5 rounded-full border border-primary/10">
                                            Take Action
                                            <span className="material-symbols-outlined text-sm">chevron_right</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </button>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                        <div className="size-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-400">
                            <span className="material-symbols-outlined text-5xl">notifications_off</span>
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xl font-bold">All Caught Up!</h3>
                            <p className="text-text-secondary-light dark:text-text-secondary-dark max-w-[200px]">
                                You don't have any new notifications at the moment.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <BottomNav />
        </div>
    );
}
