import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLibraryStore, useUserStore, useAudioStore } from '@shared/store';
import { Card, Button, Spinner } from '@shared/ui';
import { Search, Star, Download, Music, Play, Pause } from 'lucide-react';

export default function NashidsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useUserStore();
  const { nashids, isLoading, error, loadNashids } = useLibraryStore();
  const { currentPlaying, isPlaying, playNashid, pauseNashid } = useAudioStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showOfflineOnly, setShowOfflineOnly] = useState(false);

  useEffect(() => {
    if (nashids.length === 0) {
      loadNashids({ page: 1, limit: 50 });
    }
  }, [nashids.length, loadNashids]);

  // Auto-play nashid from URL param
  useEffect(() => {
    const playId = searchParams.get('play');
    if (playId && nashids.length > 0) {
      const nashidToPlay = nashids.find(n => n.id.toString() === playId);
      if (nashidToPlay) {
        playNashid(nashidToPlay as any);
      }
    }
  }, [searchParams, nashids, playNashid]);

  const favoriteNashids = user?.favorites.nashids || [];
  const offlineNashids = user?.offline.nashids || [];

  // Filter nashids
  const filteredNashids = nashids.filter((nashid) => {
    const matchesSearch = nashid.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         nashid.artist.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || nashid.category === selectedCategory;
    const matchesFavorites = !showFavoritesOnly || favoriteNashids.includes(nashid.id);
    const matchesOffline = !showOfflineOnly || offlineNashids.includes(nashid.id);

    return matchesSearch && matchesCategory && matchesFavorites && matchesOffline;
  });

  const categories = [
    { id: 'all', name: t('common.all'), emoji: '🎵' },
    { id: 'praise', name: t('library.categories.praise', { defaultValue: 'Praise' }), emoji: '🕌' },
    { id: 'quran', name: t('library.categories.quranRecitation', { defaultValue: 'Quran Recitation' }), emoji: '📖' },
    { id: 'dua', name: t('library.categories.dua', { defaultValue: 'Dua' }), emoji: '🤲' },
    { id: 'kids', name: t('library.categories.kids', { defaultValue: 'Kids' }), emoji: '👶' },
    { id: 'other', name: t('library.categories.other', { defaultValue: 'Other' }), emoji: '🎶' },
  ];

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  const handlePlayPause = (nashid: any, e: React.MouseEvent) => {
    e.stopPropagation();

    if (currentPlaying?.id === nashid.id.toString()) {
      if (isPlaying) {
        pauseNashid();
      } else {
        playNashid(nashid as any);
      }
    } else {
      playNashid(nashid as any);
    }
  };

  return (
    <div className="page-container p-4 pb-32">
      {/* Header */}
      <header className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            ← {t('common.back')}
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            🎵 {t('library.nashids')}
          </h1>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('library.searchNashids', { defaultValue: 'Search nashids...' })}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors flex items-center gap-2 ${
                selectedCategory === category.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              <span>{category.emoji}</span>
              <span>{category.name}</span>
            </button>
          ))}
        </div>

        {/* Quick Filters */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
              showFavoritesOnly
                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}
          >
            <Star className="w-4 h-4" />
            {t('library.favorites')}
          </button>
          <button
            onClick={() => setShowOfflineOnly(!showOfflineOnly)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
              showOfflineOnly
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}
          >
            <Download className="w-4 h-4" />
            {t('library.offline')}
          </button>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card className="text-center">
          <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            {filteredNashids.length}
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {t('library.nashids')}
          </p>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {favoriteNashids.length}
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {t('library.favorites')}
          </p>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {offlineNashids.length}
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {t('library.offline')}
          </p>
        </Card>
      </div>

      {/* Nashids List */}
      {isLoading && nashids.length === 0 ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <Button onClick={() => loadNashids({ page: 1, limit: 50 })}>
            {t('common.retry')}
          </Button>
        </div>
      ) : filteredNashids.length === 0 ? (
        <div className="text-center py-12">
          <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            {t('library.noNashidsFound', { defaultValue: 'No nashids found' })}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredNashids.map((nashid) => {
            const isFavorite = favoriteNashids.includes(nashid.id);
            const isOffline = offlineNashids.includes(nashid.id);
            const isCurrentlyPlaying = currentPlaying?.id === nashid.id.toString();

            return (
              <Card
                key={nashid.id}
                hoverable
                className={isCurrentlyPlaying ? 'ring-2 ring-primary-500' : ''}
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
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                      {formatDuration(nashid.duration)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isFavorite && <span className="text-lg">⭐</span>}
                    {isOffline && <span className="text-lg">📥</span>}
                    <button
                      onClick={(e) => handlePlayPause(nashid, e)}
                      className="w-10 h-10 bg-primary-600 hover:bg-primary-700 text-white rounded-full flex items-center justify-center transition-colors"
                    >
                      {isCurrentlyPlaying && isPlaying ? (
                        <Pause className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5 ml-0.5" />
                      )}
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
