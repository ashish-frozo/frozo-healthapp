interface NumericKeypadProps {
    onKeyPress: (key: string) => void;
    onDelete: () => void;
    showDecimal?: boolean;
}

export function NumericKeypad({ onKeyPress, onDelete, showDecimal = false }: NumericKeypadProps) {
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', showDecimal ? '.' : '', '0', 'delete'];

    const handlePress = (key: string) => {
        if (key === 'delete') {
            onDelete();
        } else if (key !== '') {
            onKeyPress(key);
        }
    };

    return (
        <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto select-none">
            {keys.map((key, index) => (
                <button
                    key={index}
                    onClick={() => handlePress(key)}
                    disabled={key === ''}
                    className={`h-14 rounded-xl flex items-center justify-center transition-all active:scale-95 ${key === ''
                            ? 'bg-transparent cursor-default'
                            : key === 'delete'
                                ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 active:bg-gray-200 dark:active:bg-gray-700'
                                : 'bg-surface-light dark:bg-surface-dark shadow-sm border-b-2 border-gray-200 dark:border-gray-700 text-2xl font-semibold text-text-primary-light dark:text-text-primary-dark active:border-b-0 active:translate-y-[2px]'
                        }`}
                >
                    {key === 'delete' ? (
                        <span className="material-symbols-outlined">backspace</span>
                    ) : (
                        key
                    )}
                </button>
            ))}
        </div>
    );
}
