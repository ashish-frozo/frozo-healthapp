// Country data with dial codes for international phone support
export type SupportedLanguage = 'english' | 'hindi' | 'hinglish';

export interface Country {
    code: string;      // ISO 3166-1 alpha-2
    name: string;
    dialCode: string;
    flag: string;
    minLength: number;
    maxLength: number;
    defaultLanguage: SupportedLanguage;
}

// Most common countries first, then alphabetical
export const COUNTRIES: Country[] = [
    // Popular countries (at top for quick access)
    { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳', minLength: 10, maxLength: 10, defaultLanguage: 'hinglish' },
    { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸', minLength: 10, maxLength: 10, defaultLanguage: 'english' },
    { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧', minLength: 10, maxLength: 10, defaultLanguage: 'english' },
    { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦', minLength: 10, maxLength: 10, defaultLanguage: 'english' },
    { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺', minLength: 9, maxLength: 9, defaultLanguage: 'english' },
    { code: 'AE', name: 'United Arab Emirates', dialCode: '+971', flag: '🇦🇪', minLength: 9, maxLength: 9, defaultLanguage: 'english' },
    { code: 'SG', name: 'Singapore', dialCode: '+65', flag: '🇸🇬', minLength: 8, maxLength: 8, defaultLanguage: 'english' },

    // Alphabetical list - all default to English except Hindi-speaking regions
    { code: 'AF', name: 'Afghanistan', dialCode: '+93', flag: '🇦🇫', minLength: 9, maxLength: 9, defaultLanguage: 'english' },
    { code: 'AL', name: 'Albania', dialCode: '+355', flag: '🇦🇱', minLength: 9, maxLength: 9, defaultLanguage: 'english' },
    { code: 'DZ', name: 'Algeria', dialCode: '+213', flag: '🇩🇿', minLength: 9, maxLength: 9, defaultLanguage: 'english' },
    { code: 'AR', name: 'Argentina', dialCode: '+54', flag: '🇦🇷', minLength: 10, maxLength: 10, defaultLanguage: 'english' },
    { code: 'AT', name: 'Austria', dialCode: '+43', flag: '🇦🇹', minLength: 10, maxLength: 11, defaultLanguage: 'english' },
    { code: 'BD', name: 'Bangladesh', dialCode: '+880', flag: '🇧🇩', minLength: 10, maxLength: 10, defaultLanguage: 'english' },
    { code: 'BE', name: 'Belgium', dialCode: '+32', flag: '🇧🇪', minLength: 9, maxLength: 9, defaultLanguage: 'english' },
    { code: 'BR', name: 'Brazil', dialCode: '+55', flag: '🇧🇷', minLength: 10, maxLength: 11, defaultLanguage: 'english' },
    { code: 'CN', name: 'China', dialCode: '+86', flag: '🇨🇳', minLength: 11, maxLength: 11, defaultLanguage: 'english' },
    { code: 'CO', name: 'Colombia', dialCode: '+57', flag: '🇨🇴', minLength: 10, maxLength: 10, defaultLanguage: 'english' },
    { code: 'EG', name: 'Egypt', dialCode: '+20', flag: '🇪🇬', minLength: 10, maxLength: 10, defaultLanguage: 'english' },
    { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷', minLength: 9, maxLength: 9, defaultLanguage: 'english' },
    { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪', minLength: 10, maxLength: 11, defaultLanguage: 'english' },
    { code: 'GH', name: 'Ghana', dialCode: '+233', flag: '🇬🇭', minLength: 9, maxLength: 9, defaultLanguage: 'english' },
    { code: 'HK', name: 'Hong Kong', dialCode: '+852', flag: '🇭🇰', minLength: 8, maxLength: 8, defaultLanguage: 'english' },
    { code: 'ID', name: 'Indonesia', dialCode: '+62', flag: '🇮🇩', minLength: 10, maxLength: 12, defaultLanguage: 'english' },
    { code: 'IE', name: 'Ireland', dialCode: '+353', flag: '🇮🇪', minLength: 9, maxLength: 9, defaultLanguage: 'english' },
    { code: 'IL', name: 'Israel', dialCode: '+972', flag: '🇮🇱', minLength: 9, maxLength: 9, defaultLanguage: 'english' },
    { code: 'IT', name: 'Italy', dialCode: '+39', flag: '🇮🇹', minLength: 10, maxLength: 10, defaultLanguage: 'english' },
    { code: 'JP', name: 'Japan', dialCode: '+81', flag: '🇯🇵', minLength: 10, maxLength: 10, defaultLanguage: 'english' },
    { code: 'KE', name: 'Kenya', dialCode: '+254', flag: '🇰🇪', minLength: 9, maxLength: 9, defaultLanguage: 'english' },
    { code: 'KR', name: 'South Korea', dialCode: '+82', flag: '🇰🇷', minLength: 10, maxLength: 10, defaultLanguage: 'english' },
    { code: 'MY', name: 'Malaysia', dialCode: '+60', flag: '🇲🇾', minLength: 9, maxLength: 10, defaultLanguage: 'english' },
    { code: 'MX', name: 'Mexico', dialCode: '+52', flag: '🇲🇽', minLength: 10, maxLength: 10, defaultLanguage: 'english' },
    { code: 'NL', name: 'Netherlands', dialCode: '+31', flag: '🇳🇱', minLength: 9, maxLength: 9, defaultLanguage: 'english' },
    { code: 'NZ', name: 'New Zealand', dialCode: '+64', flag: '🇳🇿', minLength: 9, maxLength: 10, defaultLanguage: 'english' },
    { code: 'NG', name: 'Nigeria', dialCode: '+234', flag: '🇳🇬', minLength: 10, maxLength: 10, defaultLanguage: 'english' },
    { code: 'NO', name: 'Norway', dialCode: '+47', flag: '🇳🇴', minLength: 8, maxLength: 8, defaultLanguage: 'english' },
    { code: 'PK', name: 'Pakistan', dialCode: '+92', flag: '🇵🇰', minLength: 10, maxLength: 10, defaultLanguage: 'hinglish' },
    { code: 'PH', name: 'Philippines', dialCode: '+63', flag: '🇵🇭', minLength: 10, maxLength: 10, defaultLanguage: 'english' },
    { code: 'PL', name: 'Poland', dialCode: '+48', flag: '🇵🇱', minLength: 9, maxLength: 9, defaultLanguage: 'english' },
    { code: 'PT', name: 'Portugal', dialCode: '+351', flag: '🇵🇹', minLength: 9, maxLength: 9, defaultLanguage: 'english' },
    { code: 'QA', name: 'Qatar', dialCode: '+974', flag: '🇶🇦', minLength: 8, maxLength: 8, defaultLanguage: 'english' },
    { code: 'RU', name: 'Russia', dialCode: '+7', flag: '🇷🇺', minLength: 10, maxLength: 10, defaultLanguage: 'english' },
    { code: 'SA', name: 'Saudi Arabia', dialCode: '+966', flag: '🇸🇦', minLength: 9, maxLength: 9, defaultLanguage: 'english' },
    { code: 'ZA', name: 'South Africa', dialCode: '+27', flag: '🇿🇦', minLength: 9, maxLength: 9, defaultLanguage: 'english' },
    { code: 'ES', name: 'Spain', dialCode: '+34', flag: '🇪🇸', minLength: 9, maxLength: 9, defaultLanguage: 'english' },
    { code: 'LK', name: 'Sri Lanka', dialCode: '+94', flag: '🇱🇰', minLength: 9, maxLength: 9, defaultLanguage: 'english' },
    { code: 'SE', name: 'Sweden', dialCode: '+46', flag: '🇸🇪', minLength: 9, maxLength: 9, defaultLanguage: 'english' },
    { code: 'CH', name: 'Switzerland', dialCode: '+41', flag: '🇨🇭', minLength: 9, maxLength: 9, defaultLanguage: 'english' },
    { code: 'TW', name: 'Taiwan', dialCode: '+886', flag: '🇹🇼', minLength: 9, maxLength: 9, defaultLanguage: 'english' },
    { code: 'TH', name: 'Thailand', dialCode: '+66', flag: '🇹🇭', minLength: 9, maxLength: 9, defaultLanguage: 'english' },
    { code: 'TR', name: 'Turkey', dialCode: '+90', flag: '🇹🇷', minLength: 10, maxLength: 10, defaultLanguage: 'english' },
    { code: 'UA', name: 'Ukraine', dialCode: '+380', flag: '🇺🇦', minLength: 9, maxLength: 9, defaultLanguage: 'english' },
    { code: 'VN', name: 'Vietnam', dialCode: '+84', flag: '🇻🇳', minLength: 9, maxLength: 10, defaultLanguage: 'english' },
];

// Default country
export const DEFAULT_COUNTRY = COUNTRIES[0]; // India

// Find country by code
export function getCountryByCode(code: string): Country | undefined {
    return COUNTRIES.find(c => c.code === code);
}

// Find country by dial code
export function getCountryByDialCode(dialCode: string): Country | undefined {
    return COUNTRIES.find(c => c.dialCode === dialCode);
}
