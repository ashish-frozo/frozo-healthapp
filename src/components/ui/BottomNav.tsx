import { NavLink } from 'react-router-dom';

interface NavItem {
    to: string;
    icon: string;
    label: string;
    filled?: boolean;
}

const navItems: NavItem[] = [
    { to: '/', icon: 'home', label: 'Home' },
    { to: '/history', icon: 'history', label: 'History' },
    { to: '/documents', icon: 'description', label: 'Documents' },
    { to: '/export', icon: 'ios_share', label: 'Export' },
    { to: '/profile', icon: 'person', label: 'Profile' },
];

export function BottomNav() {
    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-surface-light dark:bg-surface-dark border-t border-gray-200 dark:border-gray-800 z-50">
            <div className="flex justify-around items-end pb-5 pt-2 max-w-md mx-auto">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            `flex flex-col items-center gap-1 w-16 transition-colors ${isActive
                                ? 'text-primary'
                                : 'text-text-secondary-light dark:text-text-secondary-dark hover:text-primary'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <div className={isActive ? 'bg-primary/10 px-4 py-1 rounded-full' : ''}>
                                    <span className={`material-symbols-outlined text-[28px] ${isActive ? 'filled' : ''}`}>
                                        {item.icon}
                                    </span>
                                </div>
                                <span className={`text-xs ${isActive ? 'font-bold' : 'font-medium'}`}>
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
