# ⚠️ Проблема: В базе только 5 сур вместо 114

## Диагностика

Проверил frontend, backend API и базу данных - проблема в том, что:

1. **База данных MongoDB содержит только 5 сур** (Al-Fatihah, Al-Baqarah, Ali 'Imran, An-Nisa, Al-Ma'idah)
2. **Файл `backend/src/data/mockQuran.ts` содержит только 5 сур**
3. **Seed скрипт использует mockQuran.ts** для заполнения базы

## Решения

### ✅ Решение 1: Использовать внешний API (Быстро)

Использовать API https://api.alquran.cloud для получения всех сур:

```bash
# В backend добавить endpoint для импорта
cd backend
npm install axios

# Создать скрипт импорта
node src/scripts/importQuranFromAPI.ts
```

### ✅ Решение 2: Использовать готовый JSON файл (Рекомендуется)

Скачать полные данные Корана:

1. **Quran.com Database**: https://github.com/quran/quran.com-api
2. **Al-Quran Cloud**: https://alquran.cloud/api
3. **Islamic Network**: https://github.com/islamic-network/api.alquran.cloud

Пример импорта:

```typescript
// backend/src/scripts/importFullQuran.ts
import axios from 'axios';
import Surah from '../models/Surah.js';
import Ayah from '../models/Ayah.js';

async function importAllSurahs() {
  console.log('📥 Importing all 114 surahs...');

  for (let i = 1; i <= 114; i++) {
    const response = await axios.get(`https://api.alquran.cloud/v1/surah/${i}`);
    const surahData = response.data.data;

    // Save surah
    await Surah.create({
      number: surahData.number,
      name: surahData.englishName,
      nameArabic: surahData.name,
      nameTransliteration: surahData.englishNameTranslation,
      numberOfAyahs: surahData.numberOfAyahs,
      revelationType: surahData.revelationType.toLowerCase(),
    });

    console.log(`✅ Imported Surah ${i}: ${surahData.englishName}`);
  }

  console.log('✅ All surahs imported!');
}
```

### ✅ Решение 3: Расширить mockQuran.ts (Долго)

Добавить все 114 сур вручную в `backend/src/data/mockQuran.ts`:

```typescript
export const mockSurahs = [
  // Существующие 5 сур...

  // Добавить оставшиеся 109 сур:
  {
    number: 6,
    name: 'Al-An\'am',
    nameArabic: 'الأنعام',
    nameTransliteration: 'Al-An\'am',
    ayahCount: 165,
    revelation: 'meccan',
    revelationOrder: 55,
    bismillahPre: true,
  },
  // ... ещё 108 сур
];
```

## 🚀 Быстрое решение (Рекомендую)

Я могу создать скрипт для автоматического импорта всех 114 сур из API:

```bash
cd backend
npm run import:quran
```

Это добавит:
- ✅ Все 114 сур с правильными данными
- ✅ Арабский текст, транслитерацию, переводы
- ✅ Информацию о мекканских/мединских сурах
- ✅ Количество аятов для каждой суры

## 📊 Текущая статистика

- **Должно быть:** 114 сур
- **Сейчас в БД:** 5 сур
- **Не хватает:** 109 сур

## ⚡ Что делать дальше?

1. Выберите один из 3 вариантов выше
2. Я создам нужный скрипт импорта
3. Запустим импорт
4. Проверим, что все 114 суры появились в приложении

Какой вариант предпочитаете?
