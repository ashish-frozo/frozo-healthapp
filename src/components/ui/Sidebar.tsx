import { NavLink } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

interface NavItem {
    to: string;
    icon: string;
    label: string;
}

const navItems: NavItem[] = [
    { to: '/', icon: 'home', label: 'Home' },
    { to: '/history', icon: 'history', label: 'History' },
    { to: '/trends', icon: 'insights', label: 'Trends' },
    { to: '/documents', icon: 'description', label: 'Documents' },
    { to: '/export', icon: 'ios_share', label: 'Export' },
    { to: '/family-management', icon: 'family_restroom', label: 'Family' },
    { to: '/notifications', icon: 'notifications', label: 'Notifications' },
    { to: '/profile', icon: 'person', label: 'Profile' },
];

export function Sidebar() {
    const { currentProfile, state } = useApp();
    const unreadCount = state.notifications.filter(n => !n.isRead).length;

    return (
        <aside className="hidden md:flex flex-col w-64 bg-surface-light dark:bg-surface-dark border-r border-gray-200 dark:border-gray-800 h-screen fixed left-0 top-0 z-50">
            {/* Logo / Branding */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3">
                    <img src="/logo.png" alt="KinCare Logo" className="size-10 rounded-xl shadow-lg shadow-primary/20" />
                    <div>
                        <h1 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">
                            KinCare
                        </h1>
                        <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                            Family Health Tracker
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                ? 'bg-primary text-white shadow-md shadow-primary/20'
                                : 'text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <span className={`material-symbols-outlined text-xl ${isActive ? 'filled' : ''}`}>
                                    {item.icon}
                                </span>
                                <span className="font-medium">{item.label}</span>
                                {item.to === '/notifications' && unreadCount > 0 && (
                                    <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                        {unreadCount}
                                    </span>
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Quick Add Button */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                <NavLink
                    to="/quick-add"
                    className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold transition-colors shadow-lg shadow-primary/20"
                >
                    <span className="material-symbols-outlined">add</span>
                    <span>Quick Add</span>
                </NavLink>
            </div>

            {/* User Profile Section */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3">
                    <div
                        className="size-10 rounded-full bg-gray-200 dark:bg-gray-700 bg-cover bg-center"
                        style={currentProfile?.avatarUrl ? { backgroundImage: `url(${currentProfile.avatarUrl})` } : {}}
                    >
                        {!currentProfile?.avatarUrl && (
                            <span className="material-symbols-outlined text-gray-400 text-xl flex items-center justify-center h-full">
                                person
                            </span>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-text-primary-light dark:text-text-primary-dark truncate">
                            {currentProfile?.name || 'Guest'}
                        </p>
                        <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark capitalize">
                            {currentProfile?.relationship || 'User'}
                        </p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
