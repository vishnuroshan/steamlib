/**
 * ErrorDisplay Component
 * 
 * Displays user-friendly error messages.
 * Ant Design inspired styling.
 */

import type { ErrorCode } from '../../api/_shared/types';
import { ERROR_MESSAGES } from '../../api/_shared/types';

interface ErrorDisplayProps {
    error: ErrorCode;
    onDismiss?: () => void;
}

export function ErrorDisplay({ error, onDismiss }: ErrorDisplayProps) {
    const message = ERROR_MESSAGES[error];

    return (
        <div className="bg-error-subtle border border-error-subtle rounded-md p-4">
            <div className="flex items-start gap-3">
                {/* Error Icon */}
                <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>

                {/* Message */}
                <div className="flex-1 min-w-0">
                    <p className="text-error text-sm">{message}</p>
                </div>

                {/* Dismiss */}
                {onDismiss && (
                    <button
                        onClick={onDismiss}
                        className="flex-shrink-0 min-h-[44px] min-w-[44px] -mr-2 -mt-2 p-2 text-error-500 hover:text-error-600 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
}
