/**
 * ProfileManager Component
 * 
 * Sidebar panel for managing saved Steam profiles.
 * Ant Design inspired styling with touch-friendly interactions.
 */

import type { SavedProfile } from '../../api/_shared/types';

interface ProfileManagerProps {
    profiles: SavedProfile[];
    currentSteamId64: string | null;
    onSelect: (profile: SavedProfile) => void;
    onDelete: (steamId64: string) => void;
    onSaveCurrent?: () => void;
    canSaveCurrent: boolean;
}

export function ProfileManager({
    profiles,
    currentSteamId64,
    onSelect,
    onDelete,
    onSaveCurrent,
    canSaveCurrent,
}: ProfileManagerProps) {
    const isCurrentSaved = currentSteamId64
        ? profiles.some(p => p.steamId64 === currentSteamId64)
        : false;

    return (
        <div className="bg-card border border-primary rounded">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-secondary">
                <h3 className="font-medium text-primary text-sm">Saved Profiles</h3>
                {canSaveCurrent && !isCurrentSaved && onSaveCurrent && (
                    <button
                        onClick={onSaveCurrent}
                        className="h-8 px-3 text-xs text-primary-500 hover:text-primary-600 hover:bg-hover rounded transition-colors flex items-center gap-1"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Save Current
                    </button>
                )}
            </div>

            {/* Profile List */}
            <div className="p-2">
                {profiles.length === 0 ? (
                    <p className="text-tertiary text-sm text-center py-6">
                        No saved profiles
                    </p>
                ) : (
                    <div className="space-y-1">
                        {profiles.map((profile) => {
                            const isActive = profile.steamId64 === currentSteamId64;

                            return (
                                <div
                                    key={profile.steamId64}
                                    className={`group flex items-center gap-3 p-3 rounded-md transition-all cursor-pointer min-h-[48px] ${isActive
                                        ? 'bg-selection border border-selection'
                                        : 'hover:bg-hover border border-transparent'
                                        }`}
                                    onClick={() => onSelect(profile)}
                                >
                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-primary truncate">
                                            {profile.displayName || profile.vanityUrl || 'Unknown'}
                                        </p>
                                        <p className="text-xs text-tertiary truncate">
                                            {profile.steamId64}
                                        </p>
                                    </div>

                                    {/* Delete button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDelete(profile.steamId64);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 min-h-[44px] min-w-[44px] p-2.5 rounded-md text-tertiary hover:text-error-500 hover:bg-error-50 transition-all"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
