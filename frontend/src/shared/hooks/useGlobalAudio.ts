import { useEffect, useRef, useState, useCallback } from 'react';
import { useAudioStore } from '../store/audioStore';
import { getApiUrl } from '../lib/apiConfig';

/**
 * Global audio hook - manages single audio element for entire app
 * Should be used ONCE at the top level (App.tsx)
 */
export const useGlobalAudio = () => {
  const { currentPlaying, isPlaying, playNext } = useAudioStore();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  // Get correct audio URL
  const getAudioUrl = useCallback((nashid: typeof currentPlaying) => {
    if (!nashid) return '';
    return nashid.audioUrl || nashid.audio_url || '';
  }, []);

  // Get full audio URL with API base
  const getFullAudioUrl = useCallback((audioUrl: string): string => {
    if (!audioUrl) return '';

    // If already a full URL, return as is
    if (audioUrl.startsWith('http://') || audioUrl.startsWith('https://')) {
      return audioUrl;
    }

    // If relative URL, prepend API base
    const apiUrl = getApiUrl().replace('/api', '');
    return `${apiUrl}${audioUrl.startsWith('/') ? audioUrl : '/' + audioUrl}`;
  }, []);

  // Initialize global audio element
  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.preload = 'auto';
      audio.crossOrigin = 'anonymous';
      audioRef.current = audio;

      console.log('[useGlobalAudio] Global audio element created');
    }

    const audio = audioRef.current;

    // Event handlers
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);

    const handleDurationChange = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleLoadStart = () => {
      setIsLoading(true);
      setAudioError(null);
    };

    const handleLoadedData = () => {
      setIsLoading(false);
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleCanPlay = () => setIsLoading(false);
    const handleWaiting = () => setIsLoading(true);
    const handlePlaying = () => setIsLoading(false);

    const handleEnded = () => {
      console.log('[useGlobalAudio] Track ended, playing next');
      playNext();
    };

    const handleError = (e: Event) => {
      const target = e.target as HTMLAudioElement;
      console.error('[useGlobalAudio] Audio error:', target.error);
      setIsLoading(false);
      setAudioError(`Error loading audio: ${target.error?.message || 'Unknown error'}`);
      useAudioStore.getState().pauseNashid();
    };

    // Subscribe to events
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [playNext]);

  // Manage playback based on store state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentPlaying) return;

    const audioUrl = getAudioUrl(currentPlaying);
    if (!audioUrl) {
      setAudioError('Audio URL not found');
      return;
    }

    const fullAudioUrl = getFullAudioUrl(audioUrl);
    console.log('[useGlobalAudio] Audio URL:', audioUrl);
    console.log('[useGlobalAudio] Full Audio URL:', fullAudioUrl);

    // Set source only if changed
    if (audio.src !== fullAudioUrl) {
      audio.src = fullAudioUrl;
      audio.load();
    }

    // Control playback
    if (isPlaying && audio.paused) {
      console.log('[useGlobalAudio] Starting playback...');
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('[useGlobalAudio] Playback started successfully');
            setAudioError(null);
            setIsLoading(false);
          })
          .catch(error => {
            console.error('[useGlobalAudio] Playback error:', error);
            setAudioError(`Failed to play audio: ${error.message}`);
            setIsLoading(false);
            useAudioStore.getState().pauseNashid();
          });
      }
    } else if (!isPlaying && !audio.paused) {
      console.log('[useGlobalAudio] Pausing...');
      audio.pause();
    }
  }, [isPlaying, currentPlaying, getAudioUrl, getFullAudioUrl]);

  // Media Session API for background playback
  useEffect(() => {
    if ('mediaSession' in navigator && currentPlaying) {
      try {
        const { playNext, playPrevious, pauseNashid, playNashid } = useAudioStore.getState();

        navigator.mediaSession.metadata = new MediaMetadata({
          title: currentPlaying.title,
          artist: currentPlaying.artist,
          album: 'Islamic Nashids',
          artwork: currentPlaying.cover ? [
            { src: currentPlaying.cover, sizes: '512x512', type: 'image/jpeg' }
          ] : []
        });

        // Set action handlers
        navigator.mediaSession.setActionHandler('play', () => {
          if (currentPlaying) playNashid(currentPlaying);
        });
        navigator.mediaSession.setActionHandler('pause', pauseNashid);
        navigator.mediaSession.setActionHandler('previoustrack', playPrevious);
        navigator.mediaSession.setActionHandler('nexttrack', playNext);

        // Update position state
        if (duration > 0 && currentTime >= 0) {
          try {
            navigator.mediaSession.setPositionState({
              duration: duration,
              playbackRate: 1,
              position: Math.min(currentTime, duration)
            });
          } catch (error) {
            console.warn('[useGlobalAudio] Failed to set position state:', error);
          }
        }
      } catch (error) {
        console.warn('[useGlobalAudio] Media Session API error:', error);
      }
    }
  }, [currentPlaying, currentTime, duration]);

  // Return API for controlling audio
  return {
    audioRef,
    currentTime,
    duration,
    isLoading,
    audioError,
    setCurrentTime: useCallback((time: number) => {
      if (audioRef.current) {
        audioRef.current.currentTime = time;
        setCurrentTime(time);
      }
    }, []),
    setVolume: useCallback((volume: number) => {
      if (audioRef.current) {
        audioRef.current.volume = volume;
      }
    }, [])
  };
};
