import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLibraryStore, useUserStore, useAudioStore } from '@shared/store';
import { Card, Spinner, Button, UsageLimitsIndicator, UpgradePromptModal, NetworkStatusIndicator } from '@shared/ui';
import { PlaylistManager, NashidCard } from '@widgets/library';
import { NASHID_CATEGORIES, getCategoryConfig, getCategoryLabel } from '@shared/config/nashidCategories';
import { haptic, deepLinks, isTelegram } from '@shared/lib/telegram';
import type { Nashid } from '@mubarak-way/shared';
import type { Nashid as StoreNashid } from '@shared/store/audioStore';

type NashidCategory = 'all' | 'spiritual' | 'family' | 'gratitude' | 'prophet' | 'quran' | 'dua' | 'favorite';

// Helper to convert Nashid to StoreNashid
const toStoreNashid = (nashid: Nashid): StoreNashid => ({
  ...nashid,
  id: String(nashid.id || nashid.nashidId || ''),
  nashidId: String(nashid.nashidId || nashid.id || ''),
});

export default function NashidListPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useUserStore();
  const { nashids, isLoading, error, loadNashids, searchNashids } = useLibraryStore();
  const {
    favorites,
    offlineNashids,
    addToPlaylist,
    playlists,
    createPlaylist,
    toggleFavorite,
    toggleOffline,
    usageLimits,
    limitError,
    clearLimitError
  } = useAudioStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<NashidCategory>('all');
  const [currentNashid, setCurrentNashid] = useState<Nashid | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showPlaylistManager, setShowPlaylistManager] = useState(false);
  const [showAddToPlaylist, setShowAddToPlaylist] = useState<Nashid | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Generate categories from config
  const categories: { key: NashidCategory; label: string; icon: string; color?: string }[] = [
    { key: 'all', label: t('category.all', { defaultValue: 'Все' }), icon: '🎵' },
    ...Object.keys(NASHID_CATEGORIES)
      .filter(key => key !== 'all')
      .map(key => {
        const config = getCategoryConfig(key);
        return {
          key: key as NashidCategory,
          label: getCategoryLabel(key, i18n.language as 'ru' | 'en' | 'ar'),
          icon: config.emoji,
          color: config.color
        };
      }),
    { key: 'favorite', label: t('category.favorite', { defaultValue: 'Избранное' }), icon: '⭐' },
  ];

  // Filter nashids based on category
  const filteredNashids = nashids.filter((nashid) => {
    // Filter by category
    if (selectedCategory === 'favorite') {
      return favorites.includes(String(nashid.id || nashid.nashidId || ''));
    }
    if (selectedCategory !== 'all' && nashid.category !== selectedCategory) {
      return false;
    }
    return true;
  });

  useEffect(() => {
    if (searchQuery) {
      searchNashids(searchQuery);
    } else {
      loadNashids({ page: 1, limit: 20 });
    }
  }, [searchQuery, loadNashids, searchNashids]);

  // Show upgrade modal when limit error occurs
  useEffect(() => {
    if (limitError) {
      setShowUpgradeModal(true);
    }
  }, [limitError]);

  // Auto-play from URL parameter
  useEffect(() => {
    const playId = searchParams.get('play');
    if (playId && nashids.length > 0) {
      const nashid = nashids.find(n => n.id === parseInt(playId, 10));
      if (nashid) {
        handlePlay(nashid);
        searchParams.delete('play');
        setSearchParams(searchParams);
      }
    }
  }, [searchParams, nashids, setSearchParams]);

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      // Auto-play next nashid
      handlePlayNext();
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [currentNashid]);

  const handlePlay = (nashid: Nashid) => {
    haptic.impact('light');

    if (currentNashid?.id === nashid.id) {
      // Toggle play/pause
      if (audioRef.current) {
        if (isPlaying) {
          audioRef.current.pause();
        } else {
          audioRef.current.play();
        }
      }
    } else {
      // Load and play new nashid
      setCurrentNashid(nashid);
      setCurrentTime(0);
      if (audioRef.current) {
        audioRef.current.src = nashid.audioUrl;
        audioRef.current.play();
      }
    }
  };

  const handlePlayNext = () => {
    if (!currentNashid) return;
    const currentIndex = nashids.findIndex(n => n.id === currentNashid.id);
    if (currentIndex < nashids.length - 1) {
      handlePlay(nashids[currentIndex + 1]);
    }
  };

  const handlePlayPrev = () => {
    if (!currentNashid) return;
    const currentIndex = nashids.findIndex(n => n.id === currentNashid.id);
    if (currentIndex > 0) {
      handlePlay(nashids[currentIndex - 1]);
    }
  };

  const handleSeek = (value: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value;
      setCurrentTime(value);
    }
  };

  const handleToggleFavorite = async (e: React.MouseEvent, nashidId: number) => {
    e.stopPropagation();
    if (!user?.telegramId) return;

    haptic.impact('light');

    const success = await toggleFavorite(String(nashidId), user.telegramId);

    if (success) {
      haptic.notification('success');
    } else if (limitError) {
      haptic.notification('error');
      console.log('[NashidListPage] Favorite toggle failed:', limitError.message);
    }
  };

  const handleToggleOffline = async (e: React.MouseEvent, nashidId: number) => {
    e.stopPropagation();
    if (!user?.telegramId) return;

    haptic.impact('light');

    const success = await toggleOffline(String(nashidId), user.telegramId);

    if (success) {
      haptic.notification('success');
    } else if (limitError) {
      haptic.notification('error');
      console.log('[NashidListPage] Offline toggle failed:', limitError.message);
    }
  };

  const handleShareNashid = (e: React.MouseEvent, nashid: Nashid) => {
    e.stopPropagation();
    haptic.impact('medium');
    deepLinks.sendNashid(nashid.id, nashid.title);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  if (isLoading && nashids.length === 0) {
    return (
      <div className="page-container flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container p-4">
        <div className="text-center text-red-600 dark:text-red-400">
          <p className="mb-4">{error}</p>
          <Button onClick={() => loadNashids({ page: 1, limit: 20 })}>
            {t('common.retry')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container flex flex-col h-screen">
      {/* Network Status Indicator */}
      <NetworkStatusIndicator position="top" />

      {/* Header */}
      <header className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex-shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate('/library')}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            ← {t('common.back')}
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex-1">
            🎵 {t('library.nashids')}
          </h1>
        </div>

        {/* Usage Limits Indicators */}
        {user && usageLimits && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            <UsageLimitsIndicator
              current={usageLimits.favorites?.current || 0}
              limit={usageLimits.favorites?.limit || 10}
              type="favorites"
              compact={true}
              showUpgradePrompt={() => setShowUpgradeModal(true)}
            />
            <UsageLimitsIndicator
              current={usageLimits.offline?.current || 0}
              limit={usageLimits.offline?.limit || 5}
              type="offline"
              compact={true}
              showUpgradePrompt={() => setShowUpgradeModal(true)}
            />
          </div>
        )}

        {/* Search */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('library.searchNashidsPlaceholder', { defaultValue: 'Search nashids...' })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />

        {/* Action Buttons */}
        <div className="flex gap-2 mt-3">
          <Button
            onClick={() => setShowPlaylistManager(true)}
            variant="secondary"
            size="sm"
          >
            📋 {t('playlist.myPlaylists', { defaultValue: 'Мои плейлисты' })}
          </Button>
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-2 hide-scrollbar">
          {categories.map((category) => {
            const isSelected = selectedCategory === category.key;

            // Use static Tailwind classes to ensure they're included in production build
            const getColorClasses = () => {
              if (!category.color) {
                return isSelected
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600';
              }

              if (isSelected) {
                switch(category.color) {
                  case 'blue': return 'bg-blue-500 text-white';
                  case 'green': return 'bg-green-500 text-white';
                  case 'purple': return 'bg-purple-500 text-white';
                  case 'red': return 'bg-red-500 text-white';
                  case 'yellow': return 'bg-yellow-500 text-white';
                  case 'pink': return 'bg-pink-500 text-white';
                  case 'indigo': return 'bg-indigo-500 text-white';
                  default: return 'bg-primary-500 text-white';
                }
              } else {
                switch(category.color) {
                  case 'blue': return 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800';
                  case 'green': return 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800';
                  case 'purple': return 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800';
                  case 'red': return 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800';
                  case 'yellow': return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-800';
                  case 'pink': return 'bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300 hover:bg-pink-200 dark:hover:bg-pink-800';
                  case 'indigo': return 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-800';
                  default: return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600';
                }
              }
            };

            const colorClasses = getColorClasses();

            return (
              <button
                key={category.key}
                onClick={() => {
                  haptic.selection();
                  setSelectedCategory(category.key);
                }}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${colorClasses}`}
              >
                {category.icon} {category.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Playlist Manager Modal */}
      {showPlaylistManager && (
        <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50">
          <PlaylistManager onClose={() => setShowPlaylistManager(false)} />
        </div>
      )}

      {/* Add to Playlist Modal */}
      {showAddToPlaylist && (
        <AddToPlaylistModal
          nashid={showAddToPlaylist}
          playlists={playlists}
          onAddToPlaylist={(playlistId) => {
            addToPlaylist(playlistId, toStoreNashid(showAddToPlaylist));
            setShowAddToPlaylist(null);
          }}
          onCreatePlaylist={(name) => {
            const newPlaylist = createPlaylist(name, [toStoreNashid(showAddToPlaylist)]);
            setShowAddToPlaylist(null);
          }}
          onClose={() => setShowAddToPlaylist(null)}
        />
      )}

      {/* Nashid List */}
      <div className="flex-1 overflow-y-auto p-4 pb-32">
        {filteredNashids.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎵</div>
            <p className="text-gray-600 dark:text-gray-400">
              {selectedCategory === 'favorite'
                ? t('library.noFavorites', { defaultValue: 'No favorite nashids' })
                : t('library.noNashidsFound', { defaultValue: 'No nashids found' })}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNashids.map((nashid) => {
              const nashidIdStr = String(nashid.id || nashid.nashidId || '');
              const isFavorite = favorites.includes(nashidIdStr);
              const isOffline = offlineNashids.includes(nashidIdStr);
              const isCurrentlyPlaying = currentNashid?.id === nashid.id && isPlaying;

              return (
                <NashidCard
                  key={nashid.id}
                  id={nashid.id}
                  title={nashid.title}
                  artist={nashid.artist}
                  duration={formatTime(nashid.duration)}
                  category={nashid.category}
                  coverImage={nashid.coverUrl}
                  isPlaying={isCurrentlyPlaying}
                  isDownloaded={isOffline}
                  isFavorite={isFavorite}
                  onPlay={() => handlePlay(nashid)}
                  onPause={() => {
                    if (audioRef.current) {
                      audioRef.current.pause();
                      setIsPlaying(false);
                    }
                  }}
                  onToggleFavorite={() => handleToggleFavorite(new MouseEvent('click') as any, nashid.id)}
                  onDownload={() => handleToggleOffline(new MouseEvent('click') as any, nashid.id)}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Audio Player */}
      {currentNashid && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4 shadow-lg">
          <div className="max-w-4xl mx-auto">
            {/* Track Info */}
            <div className="flex items-center gap-3 mb-3">
              {currentNashid.coverUrl ? (
                <img
                  src={currentNashid.coverUrl}
                  alt={currentNashid.title}
                  className="w-12 h-12 object-cover rounded-lg"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-accent-700 rounded-lg flex items-center justify-center">
                  <span className="text-2xl text-white">🎵</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                  {currentNashid.title}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  {currentNashid.artist}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={(e) => handleSeek(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={handlePlayPrev}
                disabled={!currentNashid || nashids.findIndex(n => n.id === currentNashid.id) === 0}
                className="text-2xl hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ⏮️
              </button>
              <button
                onClick={() => handlePlay(currentNashid)}
                className="text-4xl hover:scale-110 transition-transform"
              >
                {isPlaying ? '⏸️' : '▶️'}
              </button>
              <button
                onClick={handlePlayNext}
                disabled={!currentNashid || nashids.findIndex(n => n.id === currentNashid.id) === nashids.length - 1}
                className="text-2xl hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ⏭️
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Audio Element */}
      <audio ref={audioRef} />

      {/* Upgrade Prompt Modal */}
      {showUpgradeModal && limitError && (
        <UpgradePromptModal
          isOpen={showUpgradeModal}
          onClose={() => {
            setShowUpgradeModal(false);
            clearLimitError();
          }}
          type={limitError.type || 'general'}
          currentTier={user?.subscription?.tier || 'free'}
          limit={limitError.details?.limit}
          category={limitError.details?.category}
        />
      )}
    </div>
  );
}

// Add to Playlist Modal Component
interface AddToPlaylistModalProps {
  nashid: Nashid;
  playlists: Array<{ id: string; name: string }>;
  onAddToPlaylist: (playlistId: string) => void;
  onCreatePlaylist: (name: string) => void;
  onClose: () => void;
}

function AddToPlaylistModal({
  nashid,
  playlists,
  onAddToPlaylist,
  onCreatePlaylist,
  onClose,
}: AddToPlaylistModalProps) {
  const { t } = useTranslation();
  const [showCreateNew, setShowCreateNew] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const handleCreatePlaylist = () => {
    if (newPlaylistName.trim()) {
      onCreatePlaylist(newPlaylistName.trim());
      setNewPlaylistName('');
      setShowCreateNew(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {t('playlist.addTo', { defaultValue: 'Добавить в плейлист' })}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Nashid Info */}
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="font-medium text-gray-900 dark:text-white truncate">
            {nashid.title}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
            {nashid.artist}
          </p>
        </div>

        {/* Playlists List */}
        <div className="flex-1 overflow-y-auto mb-4">
          {playlists.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t('playlist.noPlaylistsYet', { defaultValue: 'У вас пока нет плейлистов' })}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {playlists.map((playlist) => (
                <button
                  key={playlist.id}
                  onClick={() => onAddToPlaylist(playlist.id)}
                  className="w-full p-3 text-left rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="text-gray-900 dark:text-white">{playlist.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Create New Playlist */}
        {showCreateNew ? (
          <div className="space-y-2">
            <input
              type="text"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              placeholder={t('playlist.namePlaceholder', { defaultValue: 'Название плейлиста' })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              autoFocus
            />
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowCreateNew(false);
                  setNewPlaylistName('');
                }}
                className="flex-1"
              >
                {t('common.cancel')}
              </Button>
              <Button
                variant="primary"
                onClick={handleCreatePlaylist}
                disabled={!newPlaylistName.trim()}
                className="flex-1"
              >
                {t('common.create')}
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="primary"
            onClick={() => setShowCreateNew(true)}
            className="w-full"
          >
            + {t('playlist.createNew', { defaultValue: 'Создать новый плейлист' })}
          </Button>
        )}
      </div>
    </div>
  );
}
