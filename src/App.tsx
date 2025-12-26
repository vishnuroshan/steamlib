/**
 * Steam Library Manager
 * 
 * Main application component.
 * Ant Design inspired layout with theme support.
 */

import { useSteamLibrary } from './hooks/useSteamLibrary';
import { useLocalProfiles } from './hooks/useLocalProfiles';
import { useTheme } from './hooks/useTheme';
import { SteamInput } from './components/SteamInput';
import { GameList } from './components/GameList';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorDisplay } from './components/ErrorDisplay';
import { ProfileManager } from './components/ProfileManager';
import { ConsentModal } from './components/ConsentModal';
import { ThemeToggle } from './components/ThemeToggle';
import type { SavedProfile } from './core/types';

function App() {
  const library = useSteamLibrary();
  const profiles = useLocalProfiles();
  const theme = useTheme();

  // Handle profile save request
  const handleSaveProfile = () => {
    if (library.currentProfile) {
      const profile: SavedProfile = {
        steamId64: library.currentProfile.steamId64,
        displayName: null, // We don't have the display name from the API
        vanityUrl: library.currentProfile.vanityUrl,
        savedAt: Date.now(),
      };
      profiles.requestSaveProfile(profile);
    }
  };

  return (
    <div className="min-h-screen bg-page transition-colors duration-200">
      {/* Header */}
      <header className="bg-container border-b border-secondary sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-primary tracking-tight">
              Steamlib
            </h1>
          </div>

          <ThemeToggle
            resolvedTheme={theme.resolvedTheme}
            onToggle={theme.toggleTheme}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Main Column */}
          <div className="flex-1 space-y-6">
            {/* Search Section */}
            <section className="bg-card border border-primary rounded-md p-4 md:p-6 shadow-card">
              <h2 className="text-lg font-semibold text-primary mb-4">
                Look up a Steam Profile
              </h2>
              <SteamInput
                onSubmit={library.fetchLibrary}
                isLoading={library.isLoading}
                lastFailedInput={library.lastFailedInput}
              />
            </section>

            {/* Results Section */}
            {library.isLoading && <LoadingSpinner />}

            {library.error && !library.isLoading && (
              <ErrorDisplay error={library.error} onDismiss={library.clear} />
            )}

            {library.games && !library.isLoading && (
              <section className="animate-in fade-in duration-300">
                <GameList games={library.games} gameCount={library.gameCount} />
              </section>
            )}

            {/* Empty State */}
            {!library.games && !library.isLoading && !library.error && (
              <div className="text-center py-12 md:py-20">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-hover flex items-center justify-center">
                  <svg className="w-8 h-8 text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-secondary mb-2">
                  Enter a Steam profile to begin
                </h3>
                <p className="text-sm text-tertiary max-w-md mx-auto">
                  Use your Steam ID, vanity URL, or paste your full profile link to view your game library.
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:w-80 flex-shrink-0">
            <div className="lg:sticky lg:top-24">
              <ProfileManager
                profiles={profiles.profiles}
                currentSteamId64={library.currentProfile?.steamId64 ?? null}
                onSelect={library.loadProfile}
                onDelete={profiles.deleteProfile}
                onSaveCurrent={handleSaveProfile}
                canSaveCurrent={library.currentProfile !== null}
              />
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-secondary mt-auto bg-container">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-xs text-tertiary">
            steamlib is not affiliated with Valve or Steam. All game data is fetched from public Steam APIs.
          </p>
        </div>
      </footer>

      {/* Consent Modal */}
      <ConsentModal
        isOpen={profiles.showConsentModal}
        onConfirm={profiles.confirmConsent}
        onDecline={profiles.declineConsent}
      />
    </div>
  );
}

export default App;
