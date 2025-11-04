import React, { useState, useCallback, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  Download,
  Share2,
  List,
  Minimize2,
  X
} from 'lucide-react';
import { useAudioStore, type Nashid } from '../../shared/store/audioStore';
import { useUserStore } from '../../shared/store';
import { offlineNashids } from '../../shared/lib/offlineStorage';
import { haptic } from '../../shared/lib/telegram';

interface GlobalAudioPlayerProps {
  onClose: () => void;
  isMinimized: boolean;
  onToggleMinimize: () => void;
  audioState: {
    currentTime: number;
    duration: number;
    isLoading: boolean;
    audioError: string | null;
    setCurrentTime: (time: number) => void;
    setVolume: (volume: number) => void;
  };
}

/**
 * Pure UI component for audio player
 * Audio element is managed globally via useGlobalAudio in App.tsx
 */
const GlobalAudioPlayer: React.FC<GlobalAudioPlayerProps> = ({
  onClose,
  isMinimized,
  onToggleMinimize,
  audioState
}) => {
  const { user } = useUserStore();
  const {
    currentPlaying,
    isPlaying,
    playlist,
    favorites,
    isShuffled,
    repeatMode,
    playNashid,
    pauseNashid,
    stopNashid,
    toggleFavorite,
    toggleShuffle,
    cycleRepeatMode,
    playNext,
    playPrevious
  } = useAudioStore();

  const { currentTime, duration, isLoading, audioError, setCurrentTime, setVolume } = audioState;

  const [volume, setVolumeState] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [isOfflineAvailable, setIsOfflineAvailable] = useState(false);

  // Check offline availability
  useEffect(() => {
    const checkOffline = async () => {
      if (currentPlaying) {
        const available = await offlineNashids.isNashidOffline(currentPlaying.id);
        setIsOfflineAvailable(available);
      }
    };
    checkOffline();
  }, [currentPlaying]);

  // Handlers
  const handlePlayPause = useCallback(() => {
    haptic.impact('light');
    if (isPlaying) {
      pauseNashid();
    } else {
      if (currentPlaying) {
        playNashid(currentPlaying);
      }
    }
  }, [isPlaying, currentPlaying, pauseNashid, playNashid]);

  const handleNext = useCallback(() => {
    haptic.impact('light');
    playNext();
  }, [playNext]);

  const handlePrevious = useCallback(() => {
    haptic.impact('light');
    playPrevious();
  }, [playPrevious]);

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;

    setCurrentTime(newTime);
  }, [duration, setCurrentTime]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolumeState(newVolume);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  }, [setVolume]);

  const toggleMute = useCallback(() => {
    haptic.impact('light');
    if (isMuted) {
      setVolume(volume);
      setIsMuted(false);
    } else {
      setVolume(0);
      setIsMuted(true);
    }
  }, [isMuted, volume, setVolume]);

  const handleToggleShuffle = useCallback(() => {
    haptic.impact('light');
    toggleShuffle();
  }, [toggleShuffle]);

  const handleToggleRepeat = useCallback(() => {
    haptic.impact('light');
    cycleRepeatMode();
  }, [cycleRepeatMode]);

  const handleFavorite = useCallback(() => {
    if (!currentPlaying || !user) return;
    haptic.impact('medium');
    toggleFavorite(currentPlaying.id, user.telegramId.toString());
  }, [currentPlaying, user, toggleFavorite]);

  const handleDownload = useCallback(async () => {
    if (!currentPlaying || isOfflineAvailable) return;

    haptic.impact('medium');
    try {
      const audioUrl = currentPlaying.audioUrl || currentPlaying.audio_url || '';
      const response = await fetch(audioUrl);
      const audioBlob = await response.blob();

      await offlineNashids.saveNashid({
        nashidId: currentPlaying.id,
        title: currentPlaying.title,
        artist: currentPlaying.artist,
        audioUrl: audioUrl,
        duration: currentPlaying.duration as number,
        category: currentPlaying.category,
        downloadedAt: new Date(),
        lastPlayed: new Date()
      }, audioBlob);

      setIsOfflineAvailable(true);
      haptic.notification('success');
    } catch (error) {
      console.error('[GlobalAudioPlayer] Error downloading nashid:', error);
      haptic.notification('error');
    }
  }, [currentPlaying, isOfflineAvailable]);

  const handleShare = useCallback(async () => {
    if (!currentPlaying) return;

    haptic.impact('light');
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentPlaying.title,
          text: `Listen to: ${currentPlaying.title} - ${currentPlaying.artist}`,
          url: window.location.href
        });
      } catch (err) {
        console.log('[GlobalAudioPlayer] Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${currentPlaying.title} - ${currentPlaying.artist}`);
    }
  }, [currentPlaying]);

  const handleClose = useCallback(() => {
    haptic.impact('light');
    stopNashid();
    onClose();
  }, [stopNashid, onClose]);

  const formatTime = useCallback((time: number) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  const getRepeatIcon = useCallback(() => {
    switch (repeatMode) {
      case 'one':
        return <Repeat1 className="w-5 h-5" />;
      case 'all':
        return <Repeat className="w-5 h-5" />;
      default:
        return <Repeat className="w-5 h-5 opacity-50" />;
    }
  }, [repeatMode]);

  if (!currentPlaying) return null;

  const isFavorite = favorites.includes(currentPlaying.id);

  // Mini player
  if (isMinimized) {
    return (
      <div className="fixed bottom-20 right-4 z-50 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl p-4 shadow-lg max-w-sm">
        <div className="flex items-center space-x-3">
          <img
            src={currentPlaying.cover || "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"}
            alt={currentPlaying.title}
            className="w-12 h-12 rounded-lg object-cover"
          />
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 truncate">{currentPlaying.title}</h4>
            <p className="text-sm text-gray-600 truncate">{currentPlaying.artist}</p>
          </div>
          <button
            onClick={handlePlayPause}
            disabled={isLoading}
            className={`p-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors touch-manipulation ${
              audioError ? 'bg-red-600' : ''
            }`}
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={onToggleMinimize}
            className="p-2 text-gray-600 hover:text-gray-900 transition-colors touch-manipulation"
            style={{ WebkitTapHighlightColor: 'transparent' }}
            title="Expand"
          >
            <Minimize2 className="w-4 h-4 rotate-180" />
          </button>
          <button
            onClick={handleClose}
            className="p-2 text-gray-600 hover:text-red-600 transition-colors touch-manipulation"
            style={{ WebkitTapHighlightColor: 'transparent' }}
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress bar in mini player */}
        <div className="mt-3">
          <div
            className="w-full h-1 bg-gray-200 rounded-full cursor-pointer"
            onClick={handleSeek}
          >
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-100"
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  // Full player
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end">
      <div className="w-full bg-white rounded-t-3xl p-6 max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Audio Player</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={onToggleMinimize}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors touch-manipulation"
              style={{ WebkitTapHighlightColor: 'transparent' }}
              title="Minimize"
            >
              <Minimize2 className="w-5 h-5" />
            </button>
            <button
              onClick={handleClose}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors touch-manipulation"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Error Display */}
        {audioError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
            {audioError}
          </div>
        )}

        {/* Album Art */}
        <div className="text-center mb-6">
          <img
            src={currentPlaying.cover || "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"}
            alt={currentPlaying.title}
            className="w-64 h-64 mx-auto rounded-2xl object-cover shadow-lg"
          />
        </div>

        {/* Track Info */}
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{currentPlaying.title}</h3>
          {currentPlaying.titleTransliteration && (
            <p className="text-gray-600 mb-1">{currentPlaying.titleTransliteration}</p>
          )}
          <p className="text-lg text-gray-700">{currentPlaying.artist}</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div
            className="w-full h-2 bg-gray-200 rounded-full cursor-pointer"
            onClick={handleSeek}
          >
            <div
              className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-100"
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Main Controls */}
        <div className="flex items-center justify-center space-x-6 mb-6">
          <button
            onClick={handleToggleShuffle}
            className={`p-3 rounded-full transition-colors ${
              isShuffled
                ? 'bg-green-100 text-green-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            title="Shuffle"
          >
            <Shuffle className="w-5 h-5" />
          </button>

          <button
            onClick={handlePrevious}
            disabled={playlist.length === 0}
            className="p-3 text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
            title="Previous"
          >
            <SkipBack className="w-6 h-6" />
          </button>

          <button
            onClick={handlePlayPause}
            disabled={isLoading}
            className={`p-4 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors disabled:opacity-50 touch-manipulation ${
              audioError ? 'bg-red-600' : ''
            }`}
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6" />
            )}
          </button>

          <button
            onClick={handleNext}
            disabled={playlist.length === 0}
            className="p-3 text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
            title="Next"
          >
            <SkipForward className="w-6 h-6" />
          </button>

          <button
            onClick={handleToggleRepeat}
            className={`p-3 rounded-full transition-colors ${
              repeatMode !== 'none'
                ? 'bg-green-100 text-green-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            title="Repeat"
          >
            {getRepeatIcon()}
          </button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={toggleMute}
            className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Additional Controls */}
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={handleFavorite}
            className={`p-3 rounded-full transition-colors ${
              isFavorite
                ? 'bg-red-100 text-red-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            title="Add to favorites"
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={handleDownload}
            className={`p-3 rounded-full transition-colors ${
              isOfflineAvailable
                ? 'bg-green-100 text-green-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            title={isOfflineAvailable ? 'Available offline' : 'Download for offline'}
          >
            <Download className="w-5 h-5" />
          </button>

          <button
            onClick={handleShare}
            className="p-3 text-gray-600 hover:text-gray-900 transition-colors rounded-full"
            title="Share"
          >
            <Share2 className="w-5 h-5" />
          </button>

          <button
            onClick={() => setShowPlaylist(!showPlaylist)}
            className={`p-3 rounded-full transition-colors ${
              showPlaylist
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            title="Show playlist"
          >
            <List className="w-5 h-5" />
          </button>
        </div>

        {/* Playlist */}
        {showPlaylist && playlist.length > 0 && (
          <div className="mt-6 border-t pt-6">
            <h4 className="font-semibold text-gray-900 mb-4">Playlist</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {playlist.map((item: Nashid) => (
                <div
                  key={item.id}
                  onClick={() => {
                    haptic.impact('light');
                    playNashid(item);
                  }}
                  className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    item.id === currentPlaying.id
                      ? 'bg-green-100'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <img
                    src={item.cover || "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"}
                    alt={item.title}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h5 className="font-medium text-gray-900 truncate">{item.title}</h5>
                    <p className="text-sm text-gray-600 truncate">{item.artist}</p>
                  </div>
                  <span className="text-sm text-gray-500">{item.duration}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalAudioPlayer;
