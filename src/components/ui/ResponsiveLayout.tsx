import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { useIsDesktop } from '../../hooks/useMediaQuery';

interface ResponsiveLayoutProps {
    children: ReactNode;
    /** If true, hides both sidebar and bottom nav (for modal-like pages) */
    hideNav?: boolean;
}

/**
 * Responsive layout wrapper that shows:
 * - Sidebar on desktop/tablet (≥768px)
 * - BottomNav on mobile (<768px)
 */
export function ResponsiveLayout({ children, hideNav = false }: ResponsiveLayoutProps) {
    const isDesktop = useIsDesktop();

    if (hideNav) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark">
            {/* Sidebar for desktop */}
            {isDesktop && <Sidebar />}

            {/* Main content area */}
            <main className={`${isDesktop ? 'md:ml-64' : ''}`}>
                {children}
            </main>

            {/* Bottom nav for mobile */}
            {!isDesktop && <BottomNav />}
        </div>
    );
}
