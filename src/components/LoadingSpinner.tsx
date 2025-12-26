/**
 * LoadingSpinner Component
 * 
 * Simple loading indicator with Ant Design style.
 */

export function LoadingSpinner() {
    return (
        <div className="flex items-center justify-center p-8">
            <div className="relative">
                <div className="w-8 h-8 rounded-full border-2 border-primary-100 border-t-primary-500 animate-spin"></div>
            </div>
            <span className="ml-3 text-secondary text-sm">Loading...</span>
        </div>
    );
}
