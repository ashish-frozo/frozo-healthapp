// Country data with dial codes for international phone support
export interface Country {
    code: string;      // ISO 3166-1 alpha-2
    name: string;
    dialCode: string;
    flag: string;
    minLength: number;
    maxLength: number;
}

// Most common countries first, then alphabetical
export const COUNTRIES: Country[] = [
    // Popular countries (at top for quick access)
    { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳', minLength: 10, maxLength: 10 },
    { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸', minLength: 10, maxLength: 10 },
    { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧', minLength: 10, maxLength: 10 },
    { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦', minLength: 10, maxLength: 10 },
    { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺', minLength: 9, maxLength: 9 },
    { code: 'AE', name: 'United Arab Emirates', dialCode: '+971', flag: '🇦🇪', minLength: 9, maxLength: 9 },
    { code: 'SG', name: 'Singapore', dialCode: '+65', flag: '🇸🇬', minLength: 8, maxLength: 8 },

    // Alphabetical list
    { code: 'AF', name: 'Afghanistan', dialCode: '+93', flag: '🇦🇫', minLength: 9, maxLength: 9 },
    { code: 'AL', name: 'Albania', dialCode: '+355', flag: '🇦🇱', minLength: 9, maxLength: 9 },
    { code: 'DZ', name: 'Algeria', dialCode: '+213', flag: '🇩🇿', minLength: 9, maxLength: 9 },
    { code: 'AR', name: 'Argentina', dialCode: '+54', flag: '🇦🇷', minLength: 10, maxLength: 10 },
    { code: 'AT', name: 'Austria', dialCode: '+43', flag: '🇦🇹', minLength: 10, maxLength: 11 },
    { code: 'BD', name: 'Bangladesh', dialCode: '+880', flag: '🇧🇩', minLength: 10, maxLength: 10 },
    { code: 'BE', name: 'Belgium', dialCode: '+32', flag: '🇧🇪', minLength: 9, maxLength: 9 },
    { code: 'BR', name: 'Brazil', dialCode: '+55', flag: '🇧🇷', minLength: 10, maxLength: 11 },
    { code: 'CN', name: 'China', dialCode: '+86', flag: '🇨🇳', minLength: 11, maxLength: 11 },
    { code: 'CO', name: 'Colombia', dialCode: '+57', flag: '🇨🇴', minLength: 10, maxLength: 10 },
    { code: 'EG', name: 'Egypt', dialCode: '+20', flag: '🇪🇬', minLength: 10, maxLength: 10 },
    { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷', minLength: 9, maxLength: 9 },
    { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪', minLength: 10, maxLength: 11 },
    { code: 'GH', name: 'Ghana', dialCode: '+233', flag: '🇬🇭', minLength: 9, maxLength: 9 },
    { code: 'HK', name: 'Hong Kong', dialCode: '+852', flag: '🇭🇰', minLength: 8, maxLength: 8 },
    { code: 'ID', name: 'Indonesia', dialCode: '+62', flag: '🇮🇩', minLength: 10, maxLength: 12 },
    { code: 'IE', name: 'Ireland', dialCode: '+353', flag: '🇮🇪', minLength: 9, maxLength: 9 },
    { code: 'IL', name: 'Israel', dialCode: '+972', flag: '🇮🇱', minLength: 9, maxLength: 9 },
    { code: 'IT', name: 'Italy', dialCode: '+39', flag: '🇮🇹', minLength: 10, maxLength: 10 },
    { code: 'JP', name: 'Japan', dialCode: '+81', flag: '🇯🇵', minLength: 10, maxLength: 10 },
    { code: 'KE', name: 'Kenya', dialCode: '+254', flag: '🇰🇪', minLength: 9, maxLength: 9 },
    { code: 'KR', name: 'South Korea', dialCode: '+82', flag: '🇰🇷', minLength: 10, maxLength: 10 },
    { code: 'MY', name: 'Malaysia', dialCode: '+60', flag: '🇲🇾', minLength: 9, maxLength: 10 },
    { code: 'MX', name: 'Mexico', dialCode: '+52', flag: '🇲🇽', minLength: 10, maxLength: 10 },
    { code: 'NL', name: 'Netherlands', dialCode: '+31', flag: '🇳🇱', minLength: 9, maxLength: 9 },
    { code: 'NZ', name: 'New Zealand', dialCode: '+64', flag: '🇳🇿', minLength: 9, maxLength: 10 },
    { code: 'NG', name: 'Nigeria', dialCode: '+234', flag: '🇳🇬', minLength: 10, maxLength: 10 },
    { code: 'NO', name: 'Norway', dialCode: '+47', flag: '🇳🇴', minLength: 8, maxLength: 8 },
    { code: 'PK', name: 'Pakistan', dialCode: '+92', flag: '🇵🇰', minLength: 10, maxLength: 10 },
    { code: 'PH', name: 'Philippines', dialCode: '+63', flag: '🇵🇭', minLength: 10, maxLength: 10 },
    { code: 'PL', name: 'Poland', dialCode: '+48', flag: '🇵🇱', minLength: 9, maxLength: 9 },
    { code: 'PT', name: 'Portugal', dialCode: '+351', flag: '🇵🇹', minLength: 9, maxLength: 9 },
    { code: 'QA', name: 'Qatar', dialCode: '+974', flag: '🇶🇦', minLength: 8, maxLength: 8 },
    { code: 'RU', name: 'Russia', dialCode: '+7', flag: '🇷🇺', minLength: 10, maxLength: 10 },
    { code: 'SA', name: 'Saudi Arabia', dialCode: '+966', flag: '🇸🇦', minLength: 9, maxLength: 9 },
    { code: 'ZA', name: 'South Africa', dialCode: '+27', flag: '🇿🇦', minLength: 9, maxLength: 9 },
    { code: 'ES', name: 'Spain', dialCode: '+34', flag: '🇪🇸', minLength: 9, maxLength: 9 },
    { code: 'LK', name: 'Sri Lanka', dialCode: '+94', flag: '🇱🇰', minLength: 9, maxLength: 9 },
    { code: 'SE', name: 'Sweden', dialCode: '+46', flag: '🇸🇪', minLength: 9, maxLength: 9 },
    { code: 'CH', name: 'Switzerland', dialCode: '+41', flag: '🇨🇭', minLength: 9, maxLength: 9 },
    { code: 'TW', name: 'Taiwan', dialCode: '+886', flag: '🇹🇼', minLength: 9, maxLength: 9 },
    { code: 'TH', name: 'Thailand', dialCode: '+66', flag: '🇹🇭', minLength: 9, maxLength: 9 },
    { code: 'TR', name: 'Turkey', dialCode: '+90', flag: '🇹🇷', minLength: 10, maxLength: 10 },
    { code: 'UA', name: 'Ukraine', dialCode: '+380', flag: '🇺🇦', minLength: 9, maxLength: 9 },
    { code: 'VN', name: 'Vietnam', dialCode: '+84', flag: '🇻🇳', minLength: 9, maxLength: 10 },
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
