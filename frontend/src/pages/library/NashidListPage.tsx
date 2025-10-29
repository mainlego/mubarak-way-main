import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLibraryStore, useUserStore, useAudioStore } from '@shared/store';
import { Card, Spinner, Button } from '@shared/ui';
import { PlaylistManager } from '@widgets/library/PlaylistManager';
import type { Nashid } from '@mubarak-way/shared';

type NashidCategory = 'all' | 'spiritual' | 'family' | 'gratitude' | 'prophet' | 'quran' | 'dua' | 'favorite';

export default function NashidListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, toggleFavorite, toggleOffline } = useUserStore();
  const { nashids, isLoading, error, loadNashids, searchNashids } = useLibraryStore();
  const { favorites, addToPlaylist, playlists, createPlaylist } = useAudioStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<NashidCategory>('all');
  const [currentNashid, setCurrentNashid] = useState<Nashid | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showPlaylistManager, setShowPlaylistManager] = useState(false);
  const [showAddToPlaylist, setShowAddToPlaylist] = useState<Nashid | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const categories: { key: NashidCategory; label: string; icon: string }[] = [
    { key: 'all', label: t('category.all', { defaultValue: 'Все' }), icon: '🎵' },
    { key: 'spiritual', label: t('category.spiritual', { defaultValue: 'Духовные' }), icon: '🕌' },
    { key: 'family', label: t('category.family', { defaultValue: 'Семейные' }), icon: '👨‍👩‍👧‍👦' },
    { key: 'gratitude', label: t('category.gratitude', { defaultValue: 'Благодарность' }), icon: '🤲' },
    { key: 'prophet', label: t('category.prophet', { defaultValue: 'О Пророке ﷺ' }), icon: '☪️' },
    { key: 'quran', label: t('category.quran', { defaultValue: 'Коран' }), icon: '📖' },
    { key: 'dua', label: t('category.dua', { defaultValue: 'Дуа' }), icon: '🤲' },
    { key: 'favorite', label: t('category.favorite', { defaultValue: 'Избранное' }), icon: '⭐' },
  ];

  // Filter nashids based on category
  const filteredNashids = nashids.filter((nashid) => {
    // Filter by category
    if (selectedCategory === 'favorite') {
      return favorites.includes(nashid.id);
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
    if (!user) return;
    await toggleFavorite('nashids', nashidId);
  };

  const handleToggleOffline = async (e: React.MouseEvent, nashidId: number) => {
    e.stopPropagation();
    if (!user) return;

    const limits = user.subscription.limits;
    const currentOffline = user.offline.nashids.length;

    if (!user.offline.nashids.includes(nashidId)) {
      if (limits.offlineNashids !== -1 && currentOffline >= limits.offlineNashids) {
        alert(t('subscription.limitReached'));
        return;
      }
    }

    await toggleOffline('nashids', nashidId);
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
      {/* Header */}
      <header className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex-shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate('/library')}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            ← {t('common.back')}
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            🎵 {t('library.nashids')}
          </h1>
        </div>

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
          {categories.map((category) => (
            <button
              key={category.key}
              onClick={() => setSelectedCategory(category.key)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category.key
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {category.icon} {category.label}
            </button>
          ))}
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
            addToPlaylist(playlistId, showAddToPlaylist);
            setShowAddToPlaylist(null);
          }}
          onCreatePlaylist={(name) => {
            const newPlaylist = createPlaylist(name, [showAddToPlaylist]);
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
          <div className="space-y-2">
            {filteredNashids.map((nashid) => {
              const isFavorite = user?.favorites.nashids.includes(nashid.id) || false;
              const isOffline = user?.offline.nashids.includes(nashid.id) || false;
              const isCurrentlyPlaying = currentNashid?.id === nashid.id && isPlaying;

              return (
                <Card
                  key={nashid.id}
                  hoverable
                  onClick={() => handlePlay(nashid)}
                  className={currentNashid?.id === nashid.id ? 'ring-2 ring-primary-500' : ''}
                >
                  <div className="flex items-center gap-3">
                    {/* Cover */}
                    {nashid.coverUrl ? (
                      <img
                        src={nashid.coverUrl}
                        alt={nashid.title}
                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gradient-to-br from-accent-500 to-accent-700 rounded-lg flex-shrink-0 flex items-center justify-center">
                        <span className="text-3xl text-white">🎵</span>
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                        {nashid.title}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        {nashid.artist}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {formatTime(nashid.duration)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowAddToPlaylist(nashid);
                        }}
                        className="text-xl hover:scale-110 transition-transform"
                        title={t('playlist.addTo', { defaultValue: 'Add to playlist' })}
                      >
                        📋
                      </button>
                      <button
                        onClick={(e) => handleToggleFavorite(e, nashid.id)}
                        className="text-xl hover:scale-110 transition-transform"
                      >
                        {isFavorite ? '⭐' : '☆'}
                      </button>
                      <button
                        onClick={(e) => handleToggleOffline(e, nashid.id)}
                        className="text-xl hover:scale-110 transition-transform"
                      >
                        {isOffline ? '📥' : '📄'}
                      </button>
                      <button className="text-2xl hover:scale-110 transition-transform">
                        {isCurrentlyPlaying ? '⏸️' : '▶️'}
                      </button>
                    </div>
                  </div>
                </Card>
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
