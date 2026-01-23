import { useState, useRef, useEffect } from 'react';
import { COUNTRIES, Country, DEFAULT_COUNTRY } from '../../data/countries';

interface CountrySelectorProps {
    selectedCountry: Country;
    onSelect: (country: Country) => void;
    disabled?: boolean;
    compact?: boolean;
}

export function CountrySelector({ selectedCountry, onSelect, disabled, compact }: CountrySelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Close on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearch('');
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Focus search input when opened
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const filteredCountries = COUNTRIES.filter(country =>
        country.name.toLowerCase().includes(search.toLowerCase()) ||
        country.dialCode.includes(search) ||
        country.code.toLowerCase().includes(search.toLowerCase())
    );

    const handleSelect = (country: Country) => {
        onSelect(country);
        setIsOpen(false);
        setSearch('');
    };

    return (
        <div ref={containerRef} className="relative">
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`flex items-center gap-2 h-full ${compact ? 'px-3' : 'px-4'} border-r border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
                <span className={compact ? 'text-xl' : 'text-2xl'}>{selectedCountry.flag}</span>
                <span className={`font-semibold ${compact ? 'text-sm' : 'text-lg'} text-text-secondary-light dark:text-text-secondary-dark`}>
                    {selectedCountry.dialCode}
                </span>
                <span className="material-symbols-outlined text-gray-400 text-sm">
                    {isOpen ? 'expand_less' : 'expand_more'}
                </span>
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 max-h-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                    {/* Search Input */}
                    <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                                search
                            </span>
                            <input
                                ref={inputRef}
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search country..."
                                className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:border-primary"
                            />
                        </div>
                    </div>

                    {/* Country List */}
                    <div className="overflow-y-auto max-h-60">
                        {filteredCountries.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">No countries found</div>
                        ) : (
                            filteredCountries.map((country) => (
                                <button
                                    key={country.code}
                                    type="button"
                                    onClick={() => handleSelect(country)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left ${selectedCountry.code === country.code ? 'bg-primary/10' : ''}`}
                                >
                                    <span className="text-2xl">{country.flag}</span>
                                    <div className="flex-1 min-w-0">
                                        <span className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark truncate block">
                                            {country.name}
                                        </span>
                                    </div>
                                    <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                                        {country.dialCode}
                                    </span>
                                    {selectedCountry.code === country.code && (
                                        <span className="material-symbols-outlined text-primary text-lg">check</span>
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export { DEFAULT_COUNTRY };
export type { Country };
