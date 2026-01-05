/**
 * SteamInput Component
 * 
 * Input field and submit button for Steam profile lookup.
 * Ant Design inspired styling with touch-friendly interactions.
 */

import { useState, useCallback } from 'react';

interface SteamInputProps {
    onSubmit: (input: string) => void;
    isLoading: boolean;
    lastFailedInput: string | null;
}

export function SteamInput({ onSubmit, isLoading, lastFailedInput }: SteamInputProps) {
    const [input, setInput] = useState('');

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isLoading) {
            onSubmit(input.trim());
        }
    }, [input, isLoading, onSubmit]);

    // Button disabled logic per requirements
    const isDisabled =
        !input.trim() ||
        isLoading ||
        (lastFailedInput !== null && input.trim() === lastFailedInput);

    return (
        <form onSubmit={handleSubmit} className="w-full">
            <div className="flex flex-col sm:flex-row gap-3">
                {/* Input Field */}
                <div className="flex-1">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Steam ID, Vanity URL, or Profile Link"
                        className="w-full h-8 px-3 bg-container border border-primary rounded text-primary placeholder-tertiary focus:outline-none focus:border-primary-500 transition-colors text-sm font-medium"
                        disabled={isLoading}
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isDisabled}
                    className={`h-8 px-4 rounded font-medium text-sm transition-colors flex items-center justify-center gap-2 ${isDisabled
                        ? 'bg-container text-disabled cursor-not-allowed border border-primary opacity-75'
                        : 'bg-primary-500 text-white hover:bg-primary-600'
                        }`}
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <span>Loading</span>
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <span>Lookup</span>
                        </>
                    )}
                </button>
            </div>

            {/* Helper Text */}
            <p className="mt-2 text-xs text-tertiary">
                Enter your Steam ID, custom URL, or full profile link
            </p>
        </form>
    );
}
