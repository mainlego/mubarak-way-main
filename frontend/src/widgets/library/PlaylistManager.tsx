import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAudioStore, type Playlist, type Nashid } from '@shared/store';
import { Card, Button } from '@shared/ui';

interface PlaylistManagerProps {
  onClose?: () => void;
}

export function PlaylistManager({ onClose }: PlaylistManagerProps) {
  const { t } = useTranslation();
  const {
    playlists,
    currentPlaylistId,
    playPlaylist,
    deletePlaylist,
    createPlaylist
  } = useAudioStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);

  const handlePlayPlaylist = (playlistId: string) => {
    playPlaylist(playlistId);
    onClose?.();
  };

  const handleDeletePlaylist = (playlistId: string) => {
    if (confirm(t('playlist.confirmDelete', { defaultValue: 'Удалить плейлист?' }))) {
      deletePlaylist(playlistId);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              ← {t('common.back')}
            </button>
          )}
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            🎵 {t('playlist.myPlaylists', { defaultValue: 'Мои плейлисты' })}
          </h2>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          variant="primary"
          size="sm"
        >
          + {t('playlist.create', { defaultValue: 'Создать' })}
        </Button>
      </div>

      {/* Playlists List */}
      <div className="flex-1 overflow-y-auto p-4">
        {playlists.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎵</div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {t('playlist.noPlaylists', { defaultValue: 'У вас пока нет плейлистов' })}
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              {t('playlist.createFirst', { defaultValue: 'Создать первый плейлист' })}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {playlists.map((playlist) => (
              <Card
                key={playlist.id}
                hoverable
                onClick={() => setSelectedPlaylist(playlist)}
                className={currentPlaylistId === playlist.id ? 'ring-2 ring-primary-500' : ''}
              >
                <div className="flex items-center gap-3">
                  {/* Icon */}
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-3xl text-white">🎵</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                      {playlist.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {playlist.nashids.length} {t('nasheed.tracks', { defaultValue: 'треков', count: playlist.nashids.length })}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {t('common.updated', { defaultValue: 'Обновлено' })}: {formatDate(playlist.updatedAt)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayPlaylist(playlist.id);
                      }}
                      className="p-2 text-2xl hover:scale-110 transition-transform"
                    >
                      ▶️
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePlaylist(playlist.id);
                      }}
                      className="p-2 text-xl hover:scale-110 transition-transform"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Current playing indicator */}
                {currentPlaylistId === playlist.id && (
                  <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-primary-500 font-medium">
                      🎵 {t('playlist.nowPlaying', { defaultValue: 'Сейчас играет' })}
                    </p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreatePlaylistModal
          onClose={() => setShowCreateModal(false)}
          onCreate={(name) => {
            createPlaylist(name);
            setShowCreateModal(false);
          }}
        />
      )}

      {/* Playlist Detail Modal */}
      {selectedPlaylist && (
        <PlaylistDetailModal
          playlist={selectedPlaylist}
          onClose={() => setSelectedPlaylist(null)}
        />
      )}
    </div>
  );
}

interface CreatePlaylistModalProps {
  onClose: () => void;
  onCreate: (name: string) => void;
}

function CreatePlaylistModal({ onClose, onCreate }: CreatePlaylistModalProps) {
  const { t } = useTranslation();
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreate(name.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          {t('playlist.create', { defaultValue: 'Создать плейлист' })}
        </h3>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('playlist.namePlaceholder', { defaultValue: 'Название плейлиста' })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent mb-4"
            autoFocus
          />

          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={!name.trim()}
              className="flex-1"
            >
              {t('common.create')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface PlaylistDetailModalProps {
  playlist: Playlist;
  onClose: () => void;
}

function PlaylistDetailModal({ playlist, onClose }: PlaylistDetailModalProps) {
  const { t } = useTranslation();
  const {
    removeFromPlaylist,
    playNashid,
    playPlaylist,
    currentPlaying
  } = useAudioStore();

  const handlePlayNashid = (nashid: Nashid) => {
    playPlaylist(playlist.id);
    playNashid(nashid);
  };

  const handleRemoveNashid = (nashidId: string) => {
    if (confirm(t('playlist.confirmRemoveTrack', { defaultValue: 'Удалить трек из плейлиста?' }))) {
      removeFromPlaylist(playlist.id, nashidId);
    }
  };

  const formatDuration = (duration: string | number | undefined) => {
    if (!duration) return '0:00';
    const seconds = typeof duration === 'string' ? parseInt(duration, 10) : duration;
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {playlist.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {playlist.nashids.length} {t('nasheed.tracks', { defaultValue: 'треков', count: playlist.nashids.length })}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => playPlaylist(playlist.id)}
              variant="primary"
              size="sm"
            >
              ▶️ {t('common.play')}
            </Button>
            <button
              onClick={onClose}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-2xl"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tracks List */}
        <div className="flex-1 overflow-y-auto space-y-2">
          {playlist.nashids.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">
                {t('playlist.empty', { defaultValue: 'Плейлист пуст' })}
              </p>
            </div>
          ) : (
            playlist.nashids.map((nashid, index) => (
              <div
                key={nashid.id}
                className={`p-3 rounded-lg border ${
                  currentPlaying?.id === nashid.id
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900'
                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                } cursor-pointer transition-colors`}
                onClick={() => handlePlayNashid(nashid)}
              >
                <div className="flex items-center gap-3">
                  {/* Index */}
                  <span className="text-gray-500 dark:text-gray-400 text-sm w-6">
                    {index + 1}
                  </span>

                  {/* Cover */}
                  {nashid.cover ? (
                    <img
                      src={nashid.cover}
                      alt={nashid.title}
                      className="w-12 h-12 object-cover rounded"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-accent-700 rounded flex items-center justify-center">
                      <span className="text-xl text-white">🎵</span>
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 dark:text-white truncate">
                      {nashid.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {nashid.artist}
                    </p>
                  </div>

                  {/* Duration */}
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDuration(nashid.duration)}
                  </span>

                  {/* Remove button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveNashid(nashid.id);
                    }}
                    className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-1"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
