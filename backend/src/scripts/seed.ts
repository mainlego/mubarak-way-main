/**
 * Database Seeding Script
 * Seeds the MongoDB database with initial data from mock files
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Surah from '../models/Surah.js';
import Book from '../models/Book.js';
import Nashid from '../models/Nashid.js';
import Lesson from '../models/Lesson.js';
import SubscriptionPlan from '../models/SubscriptionPlan.js';
import { mockSurahs } from '../data/mockQuran.js';
import { mockBooks, mockNashids } from '../data/mockLibrary.js';
import { mockLessons } from '../data/mockPrayer.js';
import { prayerLessons } from '../data/prayerLessonsData.js';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mubarak-way-unified';

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function clearDatabase() {
  console.log('\n🗑️  Clearing existing data...');

  await Promise.all([
    Surah.deleteMany({}),
    Book.deleteMany({}),
    Nashid.deleteMany({}),
    Lesson.deleteMany({}),
    SubscriptionPlan.deleteMany({}),
  ]);

  // Drop indexes to ensure they're recreated with new settings
  try {
    await Book.collection.dropIndexes();
    await Nashid.collection.dropIndexes();
    console.log('✅ Indexes dropped');
  } catch (error) {
    // Ignore errors if indexes don't exist
  }

  console.log('✅ Database cleared');
}

async function seedSubscriptionPlans() {
  console.log('\n💎 Seeding subscription plans...');

  const plans = [
    {
      tier: 'free',
      name: 'Free',
      description: 'Basic access to Quran and prayer features',
      price: {
        amount: 0,
        currency: 'RUB',
        period: 'monthly',
      },
      limits: {
        booksOffline: 2,
        booksFavorites: 10,
        nashidsOffline: 5,
        nashidsFavorites: 10,
        aiRequestsPerDay: 10,
      },
      access: {
        freeContent: true,
        proContent: false,
        premiumContent: false,
        exclusiveContent: false,
      },
    },
    {
      tier: 'pro',
      name: 'Pro',
      description: 'Full access to all content and features',
      price: {
        amount: 499,
        currency: 'RUB',
        period: 'monthly',
      },
      limits: {
        booksOffline: 50,
        booksFavorites: 100,
        nashidsOffline: 100,
        nashidsFavorites: 100,
        aiRequestsPerDay: 100,
      },
      access: {
        freeContent: true,
        proContent: true,
        premiumContent: false,
        exclusiveContent: false,
      },
    },
    {
      tier: 'premium',
      name: 'Premium',
      description: 'Unlimited access to everything with exclusive content',
      price: {
        amount: 999,
        currency: 'RUB',
        period: 'monthly',
      },
      limits: {
        booksOffline: -1,
        booksFavorites: -1,
        nashidsOffline: -1,
        nashidsFavorites: -1,
        aiRequestsPerDay: -1,
      },
      access: {
        freeContent: true,
        proContent: true,
        premiumContent: true,
        exclusiveContent: true,
      },
    },
  ];

  await SubscriptionPlan.insertMany(plans);
  console.log(`✅ Seeded ${plans.length} subscription plans`);
}

async function seedQuran() {
  console.log('\n📖 Seeding Quran data...');

  // Seed Surahs
  await Surah.insertMany(mockSurahs);
  console.log(`✅ Seeded ${mockSurahs.length} surahs`);

  // Note: Ayahs not seeded - will be loaded from external API in production
  console.log('ℹ️  Ayahs will be loaded from external Quran API');
}

async function seedLibrary() {
  console.log('\n📚 Seeding library data...');

  // Seed Books
  const booksToSeed = mockBooks.map((book: any, index: number) => ({
    bookId: index + 1,
    title: book.title,
    titleArabic: book.titleArabic || book.title,
    author: book.author,
    authorArabic: book.authorArabic || book.author,
    description: book.description || `Description for ${book.title}`,
    cover: book.coverUrl || `/images/books/book-${index + 1}.jpg`,
    content: book.fileUrl || `/books/book-${index + 1}.pdf`,
    category: mapCategory(book.category),
    genre: book.category || 'general',
    language: book.language || 'ar',
    pageCount: book.pages || 100,
    isPro: book.isPremium || book.accessLevel === 'pro',
    accessLevel: book.accessLevel || 'free',
    isNew: index < 3, // Mark first 3 as new
    rating: {
      average: book.rating || 4.5,
      count: book.downloadCount || 0,
    },
  }));

  if (booksToSeed.length > 0) {
    await Book.insertMany(booksToSeed);
    console.log(`✅ Seeded ${booksToSeed.length} books`);
  }

  // Seed Nashids
  const nashidsToSeed = mockNashids.map((nashid: any, index: number) => ({
    nashidId: index + 1,
    title: nashid.title,
    titleArabic: nashid.titleArabic || nashid.title,
    artist: nashid.artist || 'Unknown Artist',
    artistArabic: nashid.artistArabic || nashid.artist,
    description: nashid.description || `Description for ${nashid.title}`,
    cover: nashid.coverUrl || nashid.cover || `/images/nashids/nashid-${index + 1}.jpg`,
    audioUrl: nashid.audioUrl || `/audio/nashid-${index + 1}.mp3`,
    duration: nashid.duration || 180,
    category: mapNashidCategory(nashid.category) || 'general',
    language: nashid.language || 'ar',
    isPro: nashid.isPremium || nashid.accessLevel === 'pro',
    accessLevel: nashid.accessLevel || 'free',
    isNew: index < 3,
    rating: {
      average: nashid.rating || 4.5,
      count: nashid.playCount || 0,
    },
  }));

  if (nashidsToSeed.length > 0) {
    await Nashid.insertMany(nashidsToSeed);
    console.log(`✅ Seeded ${nashidsToSeed.length} nashids`);
  }
}

// Helper function to map mock categories to schema enums
function mapCategory(category: string): string {
  const categoryMap: any = {
    'hadith': 'religious',
    'fiqh': 'religious',
    'tafsir': 'religious',
    'aqidah': 'religious',
    'seerah': 'biography',
    'history': 'history',
    'education': 'education',
    'spiritual': 'spiritual',
  };
  return categoryMap[category] || 'religious';
}

// Helper function to map nashid categories to schema enums
function mapNashidCategory(category: string): string {
  const categoryMap: any = {
    'praise': 'nasheed',
    'worship': 'nasheed',
    'devotional': 'nasheed',
    'spiritual': 'religious',
    'quranic': 'quran-recitation',
    'dua': 'dua',
  };
  return categoryMap[category] || 'general';
}

async function seedPrayer() {
  console.log('\n🕌 Seeding prayer lessons...');

  if (prayerLessons.length > 0) {
    await Lesson.insertMany(prayerLessons);
    console.log(`✅ Seeded ${prayerLessons.length} prayer lessons`);

    // Count by category
    const obligatory = prayerLessons.filter(l => l.category === 'obligatory-prayers').length;
    const optional = prayerLessons.filter(l => l.category === 'optional-prayers').length;
    const special = prayerLessons.filter(l => l.category === 'special-prayers').length;

    console.log(`   ├─ Obligatory prayers: ${obligatory}`);
    console.log(`   ├─ Optional prayers: ${optional}`);
    console.log(`   └─ Special prayers: ${special}`);
  } else {
    console.log('⚠️  No prayer lessons found to seed');
  }
}

async function seed() {
  try {
    console.log('🌱 Starting database seeding...\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    await connectDB();
    await clearDatabase();

    await seedSubscriptionPlans();
    await seedQuran();
    await seedLibrary();
    await seedPrayer();

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Database seeding completed successfully!\n');

    // Display summary
    const counts = {
      plans: await SubscriptionPlan.countDocuments(),
      surahs: await Surah.countDocuments(),
      books: await Book.countDocuments(),
      nashids: await Nashid.countDocuments(),
      lessons: await Lesson.countDocuments(),
    };

    console.log('📊 Database Summary:');
    console.log(`   Subscription Plans: ${counts.plans}`);
    console.log(`   Surahs: ${counts.surahs}`);
    console.log(`   Books: ${counts.books}`);
    console.log(`   Nashids: ${counts.nashids}`);
    console.log(`   Prayer Lessons: ${counts.lessons}`);
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding error:', error);
    process.exit(1);
  }
}

// Run seeding
seed();
