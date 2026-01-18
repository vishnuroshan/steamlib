/**
 * ConsentModal Component
 * 
 * Modal for requesting storage consent.
 * Ant Design inspired styling.
 */

interface ConsentModalProps {
    isOpen: boolean;
    onConfirm: () => void;
    onDecline: () => void;
}

export function ConsentModal({ isOpen, onConfirm, onDecline }: ConsentModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/45"
                onClick={onDecline}
            />

            {/* Modal */}
            <div className="relative bg-container border border-primary rounded-md p-6 max-w-sm w-full shadow-md">
                {/* Title */}
                <h2 className="text-base font-semibold text-primary mb-2">
                    Store Public Info?
                </h2>

                {/* Description */}
                <div className="space-y-3 text-secondary text-sm mb-6">
                    <p>
                        We store your public profile info (Username & Steam ID) to improve your experience.
                    </p>
                    <ul className="space-y-2 text-tertiary text-xs">
                        <li className="flex items-start gap-2">
                            <svg className="w-4 h-4 text-success-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Library data is fetched live & never saved</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <svg className="w-4 h-4 text-success-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Only public profile info is stored</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <svg className="w-4 h-4 text-success-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>You can remove your data anytime</span>
                        </li>
                    </ul>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onDecline}
                        className="flex-1 h-8 px-4 rounded font-medium text-sm text-secondary bg-container border border-primary hover:bg-hover transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 h-8 px-4 rounded font-medium text-sm text-white bg-primary-500 hover:bg-primary-600 transition-colors"
                    >
                        Allow
                    </button>
                </div>
            </div>
        </div>
    );
}
