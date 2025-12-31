import { ReactNode, useEffect } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
    title?: string;
    showHandle?: boolean;
}

export function Modal({ isOpen, onClose, children, title, showHandle = true }: ModalProps) {
    // Close on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-surface-light dark:bg-surface-dark rounded-t-3xl w-full max-h-[85vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300">
                {/* Drag Handle */}
                {showHandle && (
                    <div className="w-full flex justify-center pt-4 pb-2">
                        <div className="w-12 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700" />
                    </div>
                )}

                {/* Header */}
                {title && (
                    <div className="px-6 py-2 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
                        <h2 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">
                            {title}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 -mr-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                        >
                            <span className="material-symbols-outlined text-2xl">close</span>
                        </button>
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}
