# 📦 Mock Data Guide - MubarakWay Unified

## 🎯 Overview

This guide explains how to use mock data to run the MubarakWay Unified application **without MongoDB**. This is useful for:
- Quick local development and testing
- Frontend development without backend database setup
- Demonstrations and prototyping
- CI/CD pipelines without database dependencies

---

## ⚡ Quick Start

### 1. Enable Mock Data Mode

Edit `backend/.env`:

```env
USE_MOCK_DATA=true
```

### 2. Start Backend Server

```bash
cd backend
npm run dev
```

You should see:

```
🚀 Server is running!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 Environment: development
🔗 Port: 4000
🌐 Health check: http://localhost:4000/health
📋 API status: http://localhost:4000/api/v1/status
⚠️  Mode: MOCK DATA (no database)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 3. Start Frontend

```bash
cd frontend
npm run dev
```

Frontend will be available at **http://localhost:3001**

---

## 📊 Available Mock Data

### Quran Module

**Location:** `backend/src/data/mockQuran.ts`

**Available Data:**
- **5 Surahs:**
  1. Al-Fatihah (7 ayahs) ✅
  2. Al-Baqarah (2 ayahs sample) ✅
  3. Ali 'Imran
  4. An-Nisa
  5. Al-Ma'idah

**Full Ayahs:**
- Surah 1 (Al-Fatihah): All 7 ayahs with Arabic, transliteration, and translations
- Surah 2 (Al-Baqarah): 2 sample ayahs

**Features:**
- Arabic text (textArabic)
- Transliteration (textTransliteration)
- Translations: English, Russian, Arabic
- Juz, Hizb, and Page numbers

**API Endpoints:**
```bash
# Get all surahs
GET http://localhost:4000/api/v1/quran/surahs

# Get ayahs for surah 1
GET http://localhost:4000/api/v1/quran/surahs/1/ayahs

# Get ayahs for surah 2
GET http://localhost:4000/api/v1/quran/surahs/2/ayahs
```

---

### Library Module

**Location:** `backend/src/data/mockLibrary.ts`

**Available Data:**
- **5 Books:**
  1. Riyadh as-Saliheen (Free, Hadith)
  2. Fiqh us-Sunnah (Premium, Fiqh)
  3. Tafsir Ibn Kathir (Premium, Tafsir)
  4. Fortress of the Muslim (Free, Dua)
  5. The Sealed Nectar (Free, Seerah)

- **4 Nashids:**
  1. Tala al Badru Alayna (Free, Traditional)
  2. Hasbi Rabbi (Free, Sami Yusuf)
  3. Ya Adheeman (Premium, Mishary Rashid)
  4. Assalamu Alayka (Free, Maher Zain)

**Features:**
- Arabic and English titles
- Categories: hadith, fiqh, tafsir, dua, seerah
- Access levels: free, pro, premium
- Ratings and download/play counts
- Cover images and file URLs

**API Endpoints:**
```bash
# Get all books
GET http://localhost:4000/api/v1/library/books?page=1&limit=6

# Get all nashids
GET http://localhost:4000/api/v1/library/nashids?page=1&limit=6
```

---

### Prayer Module

**Location:** `backend/src/data/mockPrayer.ts`

**Available Data:**
- **4 Lessons:**
  1. How to Make Wudu (Free, Beginner, Ablution)
  2. Learning Fajr Prayer (Free, Beginner, Obligatory)
  3. Learning Surah Al-Fatiha (Free, Beginner, Obligatory)
  4. Witr Prayer (Premium, Intermediate, Optional)

- **Prayer Times:**
  - Fajr: 05:30
  - Sunrise: 06:50
  - Dhuhr: 12:45
  - Asr: 16:15
  - Maghrib: 19:20
  - Isha: 20:45

**Features:**
- Step-by-step lessons with multiple content types
- Quizzes with correct answers and explanations
- Images, audio, and video support (placeholder URLs)
- Categories: ablution, obligatory, optional, special
- Difficulty levels: beginner, intermediate, advanced

**API Endpoints:**
```bash
# Get all lessons
GET http://localhost:4000/api/v1/prayer/lessons

# Get lesson by slug
GET http://localhost:4000/api/v1/prayer/lessons/how-to-make-wudu

# Get prayer times
GET http://localhost:4000/api/v1/prayer/times?lat=40.7128&lon=-74.0060
```

---

## 🔄 Switching Between Mock and Real Data

### To Use Mock Data (No MongoDB Required)

```env
# backend/.env
USE_MOCK_DATA=true
```

### To Use Real Database

```env
# backend/.env
USE_MOCK_DATA=false
MONGODB_URI=mongodb://localhost:27017/mubarak-way-unified
# or
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/mubarak-way-unified
```

**Note:** Restart backend server after changing `.env` file.

---

## 🧪 Testing with Mock Data

### Manual Testing

1. **Test Quran Module:**
   ```bash
   curl http://localhost:4000/api/v1/quran/surahs
   curl http://localhost:4000/api/v1/quran/surahs/1/ayahs
   ```

2. **Test Library Module:**
   ```bash
   curl "http://localhost:4000/api/v1/library/books?page=1&limit=10"
   curl "http://localhost:4000/api/v1/library/nashids?page=1&limit=10"
   ```

3. **Test Frontend:**
   - Open http://localhost:3001
   - Navigate to Quran → Should see 5 surahs
   - Open Al-Fatihah → Should see 7 ayahs
   - Navigate to Library → Should see 5 books and 4 nashids
   - Navigate to Prayer → Should see 4 lessons

### Automated Testing

Mock data is automatically used when `USE_MOCK_DATA=true` is set:

```bash
# Run tests with mock data
USE_MOCK_DATA=true npm test
```

---

## 📝 Adding More Mock Data

### Adding Surahs

Edit `backend/src/data/mockQuran.ts`:

```typescript
export const mockSurahs = [
  // Existing surahs...
  {
    _id: '6',
    number: 6,
    name: 'Al-An\'am',
    nameArabic: 'الأنعام',
    nameTransliteration: 'Al-An\'am',
    nameTranslation: 'The Cattle',
    revelationType: 'meccan',
    numberOfAyahs: 165,
    bismillahPre: true,
  },
];
```

### Adding Ayahs

```typescript
export const mockAyahs: Record<number, any[]> = {
  1: [/* Al-Fatihah ayahs */],
  2: [/* Al-Baqarah ayahs */],
  6: [ // New surah
    {
      _id: '6:1',
      surahNumber: 6,
      numberInSurah: 1,
      textArabic: 'ٱلْحَمْدُ لِلَّهِ...',
      textTransliteration: 'Alhamdu lillahi...',
      translations: {
        en: 'Praise be to Allah...',
        ru: 'Хвала Аллаху...',
        ar: 'ٱلْحَمْدُ لِلَّهِ...',
      },
      juzNumber: 7,
      hizbNumber: 13,
      pageNumber: 128,
    },
  ],
};
```

### Adding Books

Edit `backend/src/data/mockLibrary.ts`:

```typescript
export const mockBooks = [
  // Existing books...
  {
    _id: 'book6',
    title: 'Your New Book',
    titleArabic: 'كتابك الجديد',
    author: 'Author Name',
    authorArabic: 'اسم المؤلف',
    description: 'Book description',
    descriptionArabic: 'وصف الكتاب',
    category: 'fiqh',
    language: 'ar',
    pages: 500,
    coverUrl: '/images/books/your-book.jpg',
    fileUrl: '/books/your-book.pdf',
    accessLevel: 'free',
    isPremium: false,
    rating: 4.5,
    downloadCount: 1000,
    tags: ['tag1', 'tag2'],
  },
];
```

### Adding Lessons

Edit `backend/src/data/mockPrayer.ts`:

```typescript
export const mockLessons = [
  // Existing lessons...
  {
    _id: 'lesson5',
    slug: 'your-new-lesson',
    title: 'Your New Lesson',
    titleArabic: 'درسك الجديد',
    description: 'Lesson description',
    descriptionArabic: 'وصف الدرس',
    category: 'obligatory',
    difficulty: 'beginner',
    duration: 15,
    accessLevel: 'free',
    isPremium: false,
    order: 5,
    steps: [
      {
        order: 1,
        title: 'Step Title',
        titleArabic: 'عنوان الخطوة',
        content: 'Step content',
        contentArabic: 'محتوى الخطوة',
        type: 'text',
      },
    ],
    tags: ['tag1', 'tag2'],
    viewCount: 100,
    completionCount: 50,
  },
];
```

---

## ⚠️ Limitations of Mock Data

### What Works

✅ Basic API endpoints
✅ Frontend page rendering
✅ Data fetching and display
✅ Navigation between pages
✅ Search and filter (basic)
✅ UI/UX testing

### What Doesn't Work

❌ User authentication and sessions
❌ User-specific data (favorites, history, progress)
❌ Data persistence (changes are lost on restart)
❌ Complex queries and aggregations
❌ Full-text search
❌ AI features (requires Anthropic API key)
❌ Admin operations
❌ File uploads
❌ Statistics and analytics

---

## 🔧 Implementation Details

### How It Works

1. **Environment Check:**
   ```typescript
   const USE_MOCK_DATA = process.env.USE_MOCK_DATA === 'true';
   ```

2. **Conditional Data Source:**
   ```typescript
   const surahs = USE_MOCK_DATA
     ? mockSurahs
     : await QuranService.getAllSurahs();
   ```

3. **No Database Connection:**
   ```typescript
   if (process.env.USE_MOCK_DATA !== 'true') {
     await connectDatabase();
   } else {
     console.log('⚠️  Using mock data - MongoDB connection skipped');
   }
   ```

### Modified Routes

**Quran Routes:** `backend/src/routes/quran.ts`
- `GET /quran/surahs` - Returns mockSurahs
- `GET /quran/surahs/:number/ayahs` - Returns mockAyahs[number]

**Library Routes:** `backend/src/routes/library.ts`
- `GET /library/books` - Returns mockBooks
- `GET /library/nashids` - Returns mockNashids

**Prayer Routes:** (To be implemented)
- `GET /prayer/lessons` - Should return mockLessons
- `GET /prayer/times` - Should return mockPrayerTimes

---

## 🚀 Production Use

**WARNING:** Mock data is for **development and testing only**.

**Never use mock data in production!**

### Production Checklist

- [ ] `USE_MOCK_DATA=false` in production `.env`
- [ ] Real MongoDB connection configured
- [ ] Database seeded with actual content
- [ ] All mock data imports removed from production build (optional)
- [ ] Environment variable validation in place

---

## 📚 Related Documentation

- [QUICK_START.md](QUICK_START.md) - Getting started guide
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Production deployment
- [TESTING_GUIDE.md](TESTING_GUIDE.md) - Testing strategies
- [PROJECT_COMPLETE.md](PROJECT_COMPLETE.md) - Complete project overview

---

## 🐛 Troubleshooting

### Backend Still Tries to Connect to MongoDB

**Problem:** Server crashes with MongoDB connection error even with `USE_MOCK_DATA=true`

**Solution:**
1. Check `.env` file has `USE_MOCK_DATA=true` (no spaces)
2. Restart backend server completely
3. Clear Node cache: `npm run clean` or delete `node_modules/.cache`

### API Returns Empty Data

**Problem:** API calls return empty arrays or null

**Solution:**
1. Verify mock data files exist in `backend/src/data/`
2. Check import paths in route files
3. Ensure TypeScript is compiling correctly: `npm run build`
4. Check browser/terminal console for errors

### Frontend Shows "Network Error"

**Problem:** Frontend can't connect to backend

**Solution:**
1. Verify backend is running on port 4000
2. Check `frontend/.env` has correct `VITE_API_URL=http://localhost:4000/api/v1`
3. Check CORS settings allow localhost:3001
4. Test API directly with curl/Postman

---

**Last Updated:** 26 October 2025
**Version:** 1.0.0
**Status:** Active ✅
