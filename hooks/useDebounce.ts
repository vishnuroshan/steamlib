import { useState, useEffect } from 'react';

/**
 * useDebounce Hook
 * 
 * Returns a value after a specified delay has passed since the last time it was updated.
 * Useful for debouncing search inputs to avoid excessive filtering/API calls.
 */
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}
