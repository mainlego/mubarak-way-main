import { Card, Button } from '@shared/ui';
import { RefreshCw, X } from 'lucide-react';

interface UpdatePromptProps {
  onUpdate: () => void;
  onDismiss: () => void;
}

export default function UpdatePrompt({ onUpdate, onDismiss }: UpdatePromptProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 pointer-events-none">
      <Card
        variant="gradient"
        className="w-full max-w-md pointer-events-auto animate-slide-up shadow-2xl"
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-white" />
            </div>
          </div>

          <div className="flex-1">
            <h3 className="font-bold text-white mb-1">
              Доступно обновление
            </h3>
            <p className="text-sm text-white/80 mb-3">
              Новая версия приложения готова. Обновите, чтобы получить последние улучшения и исправления.
            </p>

            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={onUpdate}
                className="flex-1 bg-white text-primary-600 hover:bg-white/90"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Обновить сейчас
              </Button>
              <button
                onClick={onDismiss}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Закрыть"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
