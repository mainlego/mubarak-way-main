import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card } from '@shared/ui';
import { BookOpen, Clock, Library, Sparkles, ChevronRight, ChevronLeft } from 'lucide-react';

interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
}

const slides: OnboardingSlide[] = [
  {
    id: 'welcome',
    title: 'Добро пожаловать в Mubarak Way',
    description: 'Ваш путь к знаниям об Исламе начинается здесь. Изучайте Коран, совершенствуйте намаз и расширяйте свою исламскую библиотеку.',
    icon: BookOpen,
    gradient: 'from-teal-500 to-teal-700',
  },
  {
    id: 'quran',
    title: 'Читайте Священный Коран',
    description: 'Изучайте Коран с переводом на русский язык, делайте закладки, отслеживайте прогресс чтения и слушайте аудио.',
    icon: BookOpen,
    gradient: 'from-blue-500 to-blue-700',
  },
  {
    id: 'prayer',
    title: 'Время намаза и обучение',
    description: 'Получайте точное время намаза для вашего местоположения, учитесь правильно совершать молитву с пошаговыми инструкциями.',
    icon: Clock,
    gradient: 'from-purple-500 to-purple-700',
  },
  {
    id: 'library',
    title: 'Исламская библиотека',
    description: 'Доступ к книгам, статьям и нашидам. Сохраняйте материалы для офлайн-чтения и создавайте свою личную коллекцию.',
    icon: Library,
    gradient: 'from-amber-500 to-amber-700',
  },
  {
    id: 'ai',
    title: 'AI-ассистент для ваших вопросов',
    description: 'Задавайте вопросы об Исламе и получайте ответы на основе достоверных источников. Ваш личный помощник в изучении.',
    icon: Sparkles,
    gradient: 'from-rose-500 to-rose-700',
  },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    // Mark onboarding as completed
    localStorage.setItem('onboarding_completed', 'true');
    navigate('/');
  };

  const handleSkip = () => {
    localStorage.setItem('onboarding_completed', 'true');
    navigate('/');
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;
  const isLastSlide = currentSlide === slides.length - 1;

  return (
    <div className="min-h-screen bg-gradient-primary flex flex-col">
      {/* Skip Button */}
      <div className="container-app pt-6 safe-top flex justify-end">
        <button
          onClick={handleSkip}
          className="text-text-tertiary hover:text-text-primary transition-colors text-sm font-medium"
        >
          Пропустить
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        {/* Logo */}
        <div className="mb-8 animate-fade-in">
          <img
            src="/logo.svg"
            alt="Mubarak Way"
            className="h-24 w-auto"
          />
        </div>

        {/* Slide Content */}
        <div className="w-full max-w-md">
          <Card variant="glass" className="text-center mb-8 animate-fade-in">
            {/* Icon */}
            <div
              className={`w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br ${slide.gradient} flex items-center justify-center shadow-xl`}
            >
              <Icon className="w-10 h-10 text-white" />
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-text-primary mb-4">
              {slide.title}
            </h2>

            {/* Description */}
            <p className="text-text-secondary leading-relaxed">
              {slide.description}
            </p>
          </Card>

          {/* Progress Dots */}
          <div className="flex justify-center gap-2 mb-8">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentSlide
                    ? 'w-8 bg-accent'
                    : 'w-2 bg-text-tertiary/30'
                }`}
                aria-label={`Слайд ${index + 1}`}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-3">
            {currentSlide > 0 && (
              <Button
                variant="secondary"
                onClick={handlePrevious}
                className="flex-shrink-0"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
            )}

            <Button
              variant="primary"
              onClick={handleNext}
              className="flex-1"
            >
              {isLastSlide ? 'Начать' : 'Далее'}
              {!isLastSlide && <ChevronRight className="w-5 h-5 ml-2" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Version Info */}
      <div className="container-app pb-6 safe-bottom text-center">
        <p className="text-xs text-text-tertiary">
          Mubarak Way v1.0.0
        </p>
      </div>
    </div>
  );
}
