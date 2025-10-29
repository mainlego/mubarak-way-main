# Practice Session Feature

## Overview
Интерактивная система практики намаза с пошаговыми инструкциями и отслеживанием прогресса.

## Components

### 1. Practice Store (`frontend/src/shared/store/practiceStore.ts`)
Zustand store для управления состоянием практической сессии:

```typescript
interface PracticeStore {
  lesson_id: string;
  total_rakats: number;
  current_rakat: number;
  current_step: number;
  mistakes: number[];
  isActive: boolean;
  startTime: number | null;

  // Actions
  startSession: (lessonId: string, totalRakats: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  nextRakat: () => void;
  recordMistake: (stepNo: number) => void;
  endSession: () => void;
  reset: () => void;
}
```

**State:**
- `lesson_id` - ID урока/намаза
- `total_rakats` - Общее количество ракаатов
- `current_rakat` - Текущий ракаат (1-based)
- `current_step` - Текущий шаг (1-based)
- `mistakes` - Массив номеров шагов с ошибками
- `isActive` - Активна ли сессия
- `startTime` - Timestamp начала сессии

### 2. StepCard Widget (`frontend/src/widgets/StepCard/`)
Компонент для отображения одного шага намаза:

**Props:**
```typescript
interface StepCardProps {
  step: LessonStep;
  stepNumber: number;
  totalSteps: number;
  language: Language;
  isCompleted?: boolean;
  onPlayAudio?: () => void;
  isAudioPlaying?: boolean;
}
```

**Features:**
- Иконки для разных типов шагов (intention, takbir, ruku, sajdah, etc.)
- Заглушка для иллюстрации с градиентом
- Арабский текст с направлением RTL
- Транслитерация
- Перевод
- Заметки с иконкой 💡
- Аудио плеер для произношения

**Step Kinds:**
- `intention` 🤲 - Намерение
- `takbir` 🙌 - Такбир
- `standing` 🧍 - Стояние
- `recitation` 📖 - Чтение
- `ruku` 🙇 - Руку'
- `qiyam` 🧍 - Кыям
- `sajdah` 🛐 - Саджда
- `sitting` 🧘 - Сидение
- `second_sajdah` 🛐 - Вторая саджда
- `tashahhud` ☝️ - Ташаххуд
- `salam` 👋 - Салам
- `other` 💫 - Другое

### 3. PracticeSessionPage (`frontend/src/pages/prayer/PracticeSessionPage.tsx`)
Главная страница практической сессии:

**Features:**
- Sticky header с прогресс-баром
- Отображение текущего шага через StepCard
- Bottom navigation с кнопками:
  - Previous (←) - переход к предыдущему шагу
  - "Я выполнил" / "Выполнено" - отметить шаг как выполненный
  - Next (→) - переход к следующему шагу
- Автопереход к следующему шагу после отметки
- Modal окно при завершении всех шагов:
  - Celebration icon 🎉
  - Статистика (количество шагов, 100% прогресс)
  - Мотивационное сообщение
  - Кнопки: "Завершить" и "Продолжить практику"

**URL Pattern:**
```
/prayer/practice/:lessonId
```

### 4. PracticePage (`frontend/src/pages/prayer/PracticePage.tsx`)
Страница выбора намаза для практики:

**Features:**
- Quick Start секция с Fajr
- Категории намазов:
  - Obligatory (Обязательные): Fajr, Dhuhr, Asr, Maghrib, Isha
  - Sunnah: Witr, Tahajjud
  - Special (Особые): Juma
- Каждая карточка показывает:
  - Иконку
  - Название на текущем языке
  - Количество ракаатов
- Help section с объяснением
- Multilingual support (RU, EN, AR)

**URL:**
```
/prayer/practice
```

## Data Types

### LessonStep
```typescript
interface LessonStep {
  id: string;
  lesson_id: string;
  step_no: number;
  kind: StepKind;
  image_light_url: string | null;
  image_dark_url: string | null;
  audio_url: string | null;
  arabic_text: string;
  translit_text: string;
  translation_text: string;
  notes_i18n: I18nContent | null;
}
```

## Routes

В `App.tsx`:
```typescript
<Route path="/prayer/practice" element={<PracticePage />} />
<Route path="/prayer/practice/:lessonId" element={<PracticeSessionPage />} />
```

## Usage Flow

1. **Выбор намаза**
   - Пользователь открывает `/prayer/practice`
   - Видит список доступных намазов
   - Нажимает на карточку нужного намаза

2. **Начало сессии**
   - Переход на `/prayer/practice/fajr` (или другой)
   - Store инициализирует сессию через `startSession()`
   - Загружается первый шаг

3. **Прохождение шагов**
   - Пользователь читает инструкции на StepCard
   - Может прослушать аудио произношение
   - Нажимает "Я выполнил" после выполнения
   - Шаг отмечается как completed
   - Автопереход к следующему шагу

4. **Навигация**
   - Previous (←) - вернуться к предыдущему шагу
   - Next (→) - перейти к следующему без отметки выполнения
   - Прогресс-бар показывает общий прогресс

5. **Завершение**
   - После последнего шага открывается modal
   - Показывается статистика сессии
   - Пользователь может:
     - Завершить (→ `/prayer`)
     - Продолжить практику (→ `/prayer/practice`)

## Mock Data

В `PracticeSessionPage.tsx` используются моковые данные:
```typescript
const mockLessonSteps: Record<string, LessonStep[]> = {
  'fajr': [
    { /* step 1: intention */ },
    { /* step 2: takbir */ },
    // ...
  ]
}
```

**TODO:** В будущем заменить на API запросы к backend

## Internationalization

Поддерживаются 3 языка:
- `ru` - Русский
- `en` - English
- `ar` - العربية

Все тексты локализованы:
- Названия намазов
- Типы шагов (intention, takbir, etc.)
- UI элементы (кнопки, заголовки)
- Мотивационные сообщения

## State Management

**Local State (PracticeSessionPage):**
- `currentStepIndex` - индекс текущего шага
- `completedSteps` - Set выполненных шагов
- `showCompletionModal` - показывать ли modal завершения
- `isAudioPlaying` - играет ли аудио

**Global State (practiceStore):**
- Информация о сессии (lesson_id, rakats, timing)
- Текущий прогресс (current_rakat, current_step)
- Ошибки (mistakes array)

## Future Enhancements

1. **Backend Integration**
   - API для загрузки lessons и steps
   - Сохранение прогресса на backend
   - Синхронизация между устройствами

2. **Real Audio Player**
   - Интеграция с аудио файлами
   - Поддержка разных скоростей (0.75x, 1x, 1.25x)
   - Autoplay функция

3. **Images**
   - Иллюстрации для каждого шага
   - Light/Dark режимы для изображений
   - Анимированные переходы

4. **Progress Tracking**
   - История практик
   - Статистика по намазам
   - Streaks и achievements
   - Графики прогресса

5. **Advanced Features**
   - Repeat mode для сложных шагов
   - Slow motion video guides
   - Voice recognition для проверки произношения
   - Madhab variants support

6. **Accessibility**
   - Screen reader support
   - Keyboard navigation
   - High contrast mode
   - Font size adjustment

## Testing

Для тестирования:
1. Запустить dev server: `npm run dev`
2. Перейти на `/prayer/practice`
3. Выбрать любой намаз
4. Проверить:
   - Отображение шагов
   - Навигацию (Previous/Next)
   - Отметку выполнения
   - Прогресс-бар
   - Completion modal
   - Multilingual support

## Dependencies

- `react` - UI framework
- `react-router-dom` - Routing
- `zustand` - State management
- `react-i18next` - Internationalization
- `@shared/ui` - UI components (Card, Button)
- `@shared/types` - TypeScript types
- `lucide-react` - Icons (если используются)

## Files Structure

```
frontend/src/
├── shared/
│   ├── store/
│   │   └── practiceStore.ts        # Zustand store
│   └── types/
│       └── index.ts                 # TypeScript types
├── widgets/
│   └── StepCard/
│       ├── StepCard.tsx            # Step display widget
│       └── index.ts
└── pages/
    └── prayer/
        ├── PracticePage.tsx        # Practice selection
        ├── PracticeSessionPage.tsx # Active session
        └── index.ts                # Exports
```

## API Endpoints (Future)

```typescript
// Get lesson steps
GET /api/v1/lessons/:lessonId/steps
Response: { steps: LessonStep[] }

// Save practice progress
POST /api/v1/practice/progress
Body: {
  lesson_id: string;
  completed_steps: number[];
  mistakes: number[];
  duration_seconds: number;
}

// Get practice history
GET /api/v1/practice/history
Response: { sessions: PracticeSession[] }
```

## Notes

- Система использует 1-based индексацию для step numbers (step_no: 1, 2, 3...)
- Но internal state использует 0-based (currentStepIndex: 0, 1, 2...)
- Conversion: `stepNumber = currentStepIndex + 1`
- Все Arabic text отображается с `dir="rtl"`
- Прогресс считается как: `completedSteps.size / totalSteps * 100`
