import type { SteamProfile } from '../../api/_shared/types';

interface ProfileHeaderProps {
    profile: SteamProfile;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
    const isOnline = profile.personaState !== 0;
    const statusText = isOnline ? 'Online' : 'Offline';
    const statusColor = isOnline ? 'text-green-500' : 'text-gray-500';

    return (
        <div className="flex items-center gap-4 p-4 bg-card border border-primary rounded-lg shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="relative">
                <img
                    src={profile.avatarFull}
                    alt={profile.personaname}
                    className="w-16 h-16 rounded-full border-2 border-primary"
                />
                <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-card ${isOnline ? 'bg-green-500' : 'bg-gray-500'}`} />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-primary truncate">
                        {profile.personaname}
                    </h2>
                    {profile.locCountryCode && (
                        <span className="text-sm text-tertiary">
                            {profile.locCountryCode}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2 text-sm">
                    <span className={`font-medium ${statusColor}`}>
                        {statusText}
                    </span>
                    {profile.realName && (
                        <>
                            <span className="text-tertiary">•</span>
                            <span className="text-secondary truncate">
                                {profile.realName}
                            </span>
                        </>
                    )}
                </div>

                <a
                    href={profile.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-tertiary hover:text-primary transition-colors mt-1 inline-block"
                >
                    View on Steam
                </a>
            </div>
        </div>
    );
}
