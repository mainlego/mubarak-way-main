import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLibraryStore, useUserStore } from '@shared/store';
import { Card, Spinner, Button } from '@shared/ui';
import type { Nashid } from '@mubarak-way/shared';

export default function NashidListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, toggleFavorite, toggleOffline } = useUserStore();
  const { nashids, isLoading, error, loadNashids, searchNashids } = useLibraryStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [currentNashid, setCurrentNashid] = useState<Nashid | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

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
      </header>

      {/* Nashid List */}
      <div className="flex-1 overflow-y-auto p-4 pb-32">
        {nashids.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎵</div>
            <p className="text-gray-600 dark:text-gray-400">
              {t('library.noNashidsFound', { defaultValue: 'No nashids found' })}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {nashids.map((nashid) => {
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
