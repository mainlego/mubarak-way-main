# 🧪 MubarakWay Unified - Testing Guide

## 📋 Overview

This guide covers testing strategies, test cases, and quality assurance procedures for the MubarakWay Unified platform.

---

## 🏗️ Testing Strategy

### Testing Levels

1. **Unit Tests** - Individual functions and components
2. **Integration Tests** - API endpoints and service interactions
3. **E2E Tests** - Complete user workflows
4. **Manual Tests** - UI/UX and edge cases
5. **Performance Tests** - Load and stress testing

### Testing Tools

**Frontend:**
- Vitest (unit tests)
- React Testing Library (component tests)
- Playwright (E2E tests)
- Storybook (component development)

**Backend:**
- Jest (unit/integration tests)
- Supertest (API tests)
- MongoDB Memory Server (test database)

---

## 🔧 Setup Testing Environment

### Frontend Tests Setup

```bash
cd frontend

# Install testing dependencies
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
npm install -D @playwright/test
```

**vitest.config.ts:**
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@shared': path.resolve(__dirname, './src/shared'),
    },
  },
});
```

**src/test/setup.ts:**
```typescript
import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});
```

### Backend Tests Setup

```bash
cd backend

# Install testing dependencies
npm install -D jest @types/jest ts-jest supertest @types/supertest mongodb-memory-server
```

**jest.config.js:**
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
```

---

## ✅ Frontend Unit Tests

### Example: Component Test

**src/shared/ui/Button.test.tsx:**
```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDisabled();
  });

  it('applies variant classes correctly', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    expect(screen.getByText('Primary')).toHaveClass('bg-primary-600');

    rerender(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByText('Secondary')).toHaveClass('bg-secondary-600');
  });
});
```

### Example: Store Test

**src/shared/store/userStore.test.ts:**
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { useUserStore } from './userStore';

describe('userStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useUserStore.setState({ user: null, isLoading: false });
  });

  it('initializes with null user', () => {
    const { user } = useUserStore.getState();
    expect(user).toBeNull();
  });

  it('sets user correctly', () => {
    const mockUser = {
      id: '1',
      telegramId: '123456',
      firstName: 'Test',
      lastName: 'User',
    };

    useUserStore.getState().setUser(mockUser);
    expect(useUserStore.getState().user).toEqual(mockUser);
  });

  it('toggles favorite correctly', async () => {
    const mockUser = {
      favorites: { books: [], nashids: [], ayahs: [] }
    };

    useUserStore.setState({ user: mockUser });

    await useUserStore.getState().toggleFavorite('book', 'book-123');

    expect(useUserStore.getState().user?.favorites.books).toContain('book-123');
  });
});
```

### Example: Page Test

**src/pages/quran/SurahListPage.test.tsx:**
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SurahListPage from './SurahListPage';
import * as quranService from '@/services/quranService';

vi.mock('@/services/quranService');

describe('SurahListPage', () => {
  const mockSurahs = [
    {
      _id: '1',
      number: 1,
      name: 'Al-Fatihah',
      nameArabic: 'الفاتحة',
      nameTransliteration: 'Al-Fatihah',
      revelationType: 'meccan',
      numberOfAyahs: 7,
    },
  ];

  beforeEach(() => {
    vi.mocked(quranService.getSurahs).mockResolvedValue(mockSurahs);
  });

  it('renders surah list page', async () => {
    render(
      <BrowserRouter>
        <SurahListPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Al-Fatihah')).toBeInTheDocument();
    });
  });

  it('filters surahs by search query', async () => {
    render(
      <BrowserRouter>
        <SurahListPage />
      </BrowserRouter>
    );

    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: 'Fatihah' } });

    await waitFor(() => {
      expect(screen.getByText('Al-Fatihah')).toBeInTheDocument();
    });
  });
});
```

---

## 🔌 Backend Unit Tests

### Example: Service Test

**src/services/__tests__/quranService.test.ts:**
```typescript
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { QuranService } from '../quranService';
import { Surah, Ayah } from '../../models';

describe('QuranService', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await Surah.deleteMany({});
    await Ayah.deleteMany({});
  });

  it('gets all surahs', async () => {
    await Surah.create({
      number: 1,
      name: 'Al-Fatihah',
      nameArabic: 'الفاتحة',
      revelationType: 'meccan',
      numberOfAyahs: 7,
    });

    const surahs = await QuranService.getSurahs();
    expect(surahs).toHaveLength(1);
    expect(surahs[0].name).toBe('Al-Fatihah');
  });

  it('gets ayahs by surah number', async () => {
    const surah = await Surah.create({
      number: 1,
      name: 'Al-Fatihah',
      numberOfAyahs: 2,
    });

    await Ayah.create([
      {
        surahNumber: 1,
        numberInSurah: 1,
        textArabic: 'بِسْمِ اللَّهِ',
      },
      {
        surahNumber: 1,
        numberInSurah: 2,
        textArabic: 'الْحَمْدُ لِلَّهِ',
      },
    ]);

    const ayahs = await QuranService.getAyahs(1);
    expect(ayahs).toHaveLength(2);
  });

  it('searches surahs by name', async () => {
    await Surah.create([
      { number: 1, name: 'Al-Fatihah', numberOfAyahs: 7 },
      { number: 2, name: 'Al-Baqarah', numberOfAyahs: 286 },
    ]);

    const results = await QuranService.searchSurahs('Fatihah');
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('Al-Fatihah');
  });
});
```

### Example: API Test

**src/routes/__tests__/quran.test.ts:**
```typescript
import request from 'supertest';
import express from 'express';
import { quranRouter } from '../quran';
import { Surah } from '../../models';

const app = express();
app.use(express.json());
app.use('/api/v1/quran', quranRouter);

describe('Quran API', () => {
  describe('GET /api/v1/quran/surahs', () => {
    it('returns all surahs', async () => {
      const response = await request(app)
        .get('/api/v1/quran/surahs')
        .expect(200);

      expect(response.body).toHaveProperty('surahs');
      expect(Array.isArray(response.body.surahs)).toBe(true);
    });
  });

  describe('GET /api/v1/quran/surahs/:number/ayahs', () => {
    it('returns ayahs for specific surah', async () => {
      const response = await request(app)
        .get('/api/v1/quran/surahs/1/ayahs')
        .expect(200);

      expect(response.body).toHaveProperty('ayahs');
      expect(response.body.ayahs.length).toBeGreaterThan(0);
    });

    it('returns 404 for invalid surah number', async () => {
      await request(app)
        .get('/api/v1/quran/surahs/999/ayahs')
        .expect(404);
    });
  });

  describe('GET /api/v1/quran/search', () => {
    it('searches surahs by query', async () => {
      const response = await request(app)
        .get('/api/v1/quran/search?q=Fatihah')
        .expect(200);

      expect(response.body).toHaveProperty('results');
    });

    it('returns 400 when query is missing', async () => {
      await request(app)
        .get('/api/v1/quran/search')
        .expect(400);
    });
  });
});
```

---

## 🎭 E2E Tests

### Setup Playwright

```bash
cd frontend
npm install -D @playwright/test
npx playwright install
```

**playwright.config.ts:**
```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Example E2E Tests

**e2e/quran-flow.spec.ts:**
```typescript
import { test, expect } from '@playwright/test';

test.describe('Quran Module', () => {
  test('user can browse and read surahs', async ({ page }) => {
    await page.goto('/quran');

    // Check surah list loads
    await expect(page.getByText('Al-Fatihah')).toBeVisible();

    // Search for surah
    await page.getByPlaceholder('Search surahs...').fill('Baqarah');
    await expect(page.getByText('Al-Baqarah')).toBeVisible();

    // Click to read
    await page.getByText('Al-Baqarah').click();
    await expect(page).toHaveURL(/\/quran\/surah\/2/);

    // Check ayahs load
    await expect(page.getByText(/بِسْمِ/)).toBeVisible();

    // Toggle translation
    await page.getByRole('button', { name: /translation/i }).click();
    await expect(page.getByText(/In the name of Allah/)).toBeVisible();

    // Bookmark ayah
    await page.getByRole('button', { name: /bookmark/i }).first().click();
    await expect(page.getByRole('button', { name: /bookmarked/i })).toBeVisible();
  });

  test('user can view bookmarks', async ({ page }) => {
    await page.goto('/quran/bookmarks');

    await expect(page.getByText(/bookmarks/i)).toBeVisible();
    // Check bookmarked ayah appears
  });

  test('user can ask AI questions', async ({ page }) => {
    await page.goto('/quran/ai');

    await page.getByPlaceholder('Ask a question...').fill('What is Tawhid?');
    await page.getByRole('button', { name: /send/i }).click();

    // Wait for AI response
    await expect(page.getByText(/Tawhid/)).toBeVisible({ timeout: 10000 });
  });
});
```

**e2e/library-flow.spec.ts:**
```typescript
import { test, expect } from '@playwright/test';

test.describe('Library Module', () => {
  test('user can browse and read books', async ({ page }) => {
    await page.goto('/library/books');

    // Check books load
    await expect(page.getByRole('heading', { name: /books/i })).toBeVisible();

    // Filter by category
    await page.getByRole('button', { name: /fiqh/i }).click();
    await expect(page.getByText(/fiqh/i)).toBeVisible();

    // Click book
    await page.getByRole('article').first().click();
    await expect(page).toHaveURL(/\/library\/books\//);

    // Navigate pages
    await page.getByRole('button', { name: /next/i }).click();
    await expect(page.getByText(/page 2/i)).toBeVisible();

    // Add to favorites
    await page.getByRole('button', { name: /favorite/i }).click();
  });

  test('user can play nashids', async ({ page }) => {
    await page.goto('/library/nashids');

    // Play nashid
    await page.getByRole('button', { name: /play/i }).first().click();
    await expect(page.getByRole('button', { name: /pause/i })).toBeVisible();

    // Check audio controls
    await expect(page.locator('audio')).toBeVisible();
  });
});
```

**e2e/prayer-flow.spec.ts:**
```typescript
import { test, expect } from '@playwright/test';

test.describe('Prayer Module', () => {
  test('user can view prayer times', async ({ page, context }) => {
    // Grant geolocation permission
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: 40.7128, longitude: -74.0060 });

    await page.goto('/prayer/times');

    // Check prayer times load
    await expect(page.getByText(/fajr/i)).toBeVisible();
    await expect(page.getByText(/dhuhr/i)).toBeVisible();

    // Check countdown
    await expect(page.getByText(/next prayer/i)).toBeVisible();
  });

  test('user can access qibla compass', async ({ page, context }) => {
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: 40.7128, longitude: -74.0060 });

    await page.goto('/prayer/qibla');

    // Check compass loads
    await expect(page.getByText(/qibla direction/i)).toBeVisible();
    await expect(page.getByText(/°/)).toBeVisible(); // Degree symbol
  });

  test('user can complete a lesson', async ({ page }) => {
    await page.goto('/prayer/lessons');

    // Select lesson
    await page.getByText(/wudu/i).first().click();
    await expect(page).toHaveURL(/\/prayer\/lessons\//);

    // Navigate through steps
    await page.getByRole('button', { name: /next/i }).click();
    await page.getByRole('button', { name: /next/i }).click();

    // Answer quiz
    await page.getByText(/correct answer/i).click();
    await expect(page.getByText(/correct/i)).toBeVisible();

    // Complete lesson
    await page.getByRole('button', { name: /complete/i }).click();
    await expect(page.getByText(/congratulations/i)).toBeVisible();
  });
});
```

---

## 📊 Manual Test Cases

### Quran Module

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| QR-001 | Open Quran page | 114 surahs displayed |
| QR-002 | Search "Fatihah" | Al-Fatihah appears |
| QR-003 | Click Al-Fatihah | Ayahs load with Arabic text |
| QR-004 | Toggle translation | Translation appears below Arabic |
| QR-005 | Change font size | Arabic text size changes |
| QR-006 | Bookmark ayah | Star icon fills, bookmark saved |
| QR-007 | Open bookmarks | Bookmarked ayahs appear |
| QR-008 | Remove bookmark | Bookmark removed from list |
| QR-009 | View history | Recently read surahs shown |
| QR-010 | Ask AI question | AI responds with relevant answer |

### Library Module

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| LB-001 | Open library | Overview with stats displayed |
| LB-002 | Click Books | Book list loads |
| LB-003 | Filter by category | Only selected category shown |
| LB-004 | Click premium book (free user) | Lock icon, upgrade prompt |
| LB-005 | Open free book | Book reader loads |
| LB-006 | Navigate pages | Content changes, page number updates |
| LB-007 | Add to favorites | Heart icon fills |
| LB-008 | Download offline (within limit) | Success message, offline badge |
| LB-009 | Download offline (over limit) | Error, limit reached message |
| LB-010 | Play nashid | Audio plays, controls work |

### Prayer Module

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| PR-001 | Open prayer page | Categories and progress shown |
| PR-002 | Click lessons | Lesson list loads |
| PR-003 | Filter by difficulty | Only selected difficulty shown |
| PR-004 | Open lesson | First step displayed |
| PR-005 | Complete text step | Next button enabled |
| PR-006 | Watch video step | Video player or placeholder shown |
| PR-007 | Answer quiz correctly | Green checkmark, explanation shown |
| PR-008 | Answer quiz incorrectly | Red X, explanation shown |
| PR-009 | Complete lesson | Congratulations, progress updated |
| PR-010 | View prayer times (location allowed) | 5 prayer times shown with countdown |
| PR-011 | View prayer times (location denied) | Default location used |
| PR-012 | Open qibla (orientation allowed) | Compass rotates with device |
| PR-013 | Open qibla (orientation denied) | Static compass with enable button |

### Progress Module

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| PG-001 | Open progress page | Statistics cards displayed |
| PG-002 | Check streak | Current streak number shown |
| PG-003 | View achievements | 6 achievements with unlock status |
| PG-004 | Locked achievement | Grayscale icon, progress bar |
| PG-005 | Unlocked achievement | Color icon, checkmark badge |

### Settings Module

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| ST-001 | Open settings | User info and preferences shown |
| ST-002 | Change language to English | UI switches to English |
| ST-003 | Change language to Arabic | UI switches to Arabic, RTL |
| ST-004 | Change to dark theme | Dark theme applied |
| ST-005 | Change to light theme | Light theme applied |
| ST-006 | Change to system theme | Matches OS theme |
| ST-007 | View subscription (free) | Free tier, upgrade button |
| ST-008 | View subscription (pro) | Pro tier, usage bars |
| ST-009 | Click prayer settings | Navigates to prayer settings |
| ST-010 | Check app version | 1.0.0 displayed |

---

## ⚡ Performance Tests

### Load Testing with Artillery

```bash
npm install -g artillery
```

**artillery-config.yml:**
```yaml
config:
  target: 'https://your-backend.railway.app'
  phases:
    - duration: 60
      arrivalRate: 10
      name: Warm up
    - duration: 300
      arrivalRate: 50
      name: Sustained load

scenarios:
  - name: 'Get surahs'
    flow:
      - get:
          url: '/api/v1/quran/surahs'

  - name: 'Get ayahs'
    flow:
      - get:
          url: '/api/v1/quran/surahs/1/ayahs'

  - name: 'Search'
    flow:
      - get:
          url: '/api/v1/quran/search?q=Fatihah'
```

Run test:
```bash
artillery run artillery-config.yml
```

### Frontend Performance (Lighthouse)

```bash
npm install -g lighthouse

lighthouse https://your-app.vercel.app --output html --output-path ./lighthouse-report.html
```

**Target Metrics:**
- Performance: >90
- Accessibility: >95
- Best Practices: >90
- SEO: >90

---

## 📝 Test Coverage

### Run Coverage Reports

**Frontend:**
```bash
npm run test -- --coverage
```

**Backend:**
```bash
npm test -- --coverage
```

### Coverage Targets

- **Statements:** 80%+
- **Branches:** 75%+
- **Functions:** 80%+
- **Lines:** 80%+

---

## 🐛 Bug Reporting Template

```markdown
## Bug Description
[Clear description of the issue]

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior
[What you expected to happen]

## Actual Behavior
[What actually happened]

## Screenshots
[If applicable]

## Environment
- OS: [e.g. iOS 16, Windows 11]
- Browser: [e.g. Chrome 120, Safari 17]
- Device: [e.g. iPhone 14, Desktop]
- App Version: [e.g. 1.0.0]

## Console Errors
[Any errors from browser console]

## Additional Context
[Any other relevant information]
```

---

## ✅ Pre-Deployment Checklist

- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] All E2E tests pass
- [ ] Test coverage meets thresholds
- [ ] No console errors in production build
- [ ] Lighthouse scores meet targets
- [ ] Manual tests completed
- [ ] Cross-browser testing done (Chrome, Safari, Firefox)
- [ ] Mobile responsive testing done
- [ ] Performance testing shows acceptable load times
- [ ] Security audit completed
- [ ] Accessibility audit completed

---

**Last Updated:** 26 October 2025
**Version:** 1.0.0
