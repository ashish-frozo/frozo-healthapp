import { NavLink } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

interface NavItem {
    to: string;
    icon: string;
    label: string;
    filled?: boolean;
}

const navItems: NavItem[] = [
    { to: '/', icon: 'home', label: 'Home' },
    { to: '/history', icon: 'history', label: 'History' },
    { to: '/trends', icon: 'insights', label: 'Trends' },
    { to: '/documents', icon: 'description', label: 'Docs' },
    { to: '/export', icon: 'ios_share', label: 'Export' },
    { to: '/family-management', icon: 'family_restroom', label: 'Family' },
    { to: '/notifications', icon: 'notifications', label: 'Alerts' },
    { to: '/profile', icon: 'person', label: 'Profile' },
];

export function BottomNav() {
    const { state } = useApp();
    const unreadCount = state.notifications.filter(n => !n.isRead).length;

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-surface-light dark:bg-surface-dark border-t border-gray-200 dark:border-gray-800 z-50 md:hidden">
            <div className="flex justify-between items-end pb-5 pt-2 px-2 overflow-x-auto scrollbar-hide">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            `flex flex-col items-center gap-0.5 min-w-[48px] px-1 transition-colors relative ${isActive
                                ? 'text-primary'
                                : 'text-text-secondary-light dark:text-text-secondary-dark hover:text-primary'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <div className={isActive ? 'bg-primary/10 px-2 py-0.5 rounded-full' : ''}>
                                    <span className={`material-symbols-outlined text-[22px] ${isActive ? 'filled' : ''}`}>
                                        {item.icon}
                                    </span>
                                    {item.to === '/notifications' && unreadCount > 0 && (
                                        <span className="absolute -top-1 right-1 bg-red-500 text-white text-[9px] font-bold min-w-[14px] h-[14px] flex items-center justify-center rounded-full">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </div>
                                <span className={`text-[10px] ${isActive ? 'font-bold' : 'font-medium'}`}>
                                    {item.label}
                                </span>
                            </>
                        )}
                    </NavLink>
                ))}
            </div>
        </nav>
    );
}
