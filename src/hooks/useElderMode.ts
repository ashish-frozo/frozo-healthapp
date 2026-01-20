import { useMemo } from 'react';
import { useApp } from '../context/AppContext';

const ELDER_MODE_AGE_THRESHOLD = 60;

function calculateAge(dateOfBirth: string | undefined): number {
    if (!dateOfBirth) return 0;

    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
}

export function useElderMode() {
    const { currentProfile } = useApp();

    const age = useMemo(() => {
        return calculateAge(currentProfile?.dateOfBirth);
    }, [currentProfile?.dateOfBirth]);

    const isElderMode = age >= ELDER_MODE_AGE_THRESHOLD;

    return {
        isElderMode,
        age,
        threshold: ELDER_MODE_AGE_THRESHOLD,
    };
}
