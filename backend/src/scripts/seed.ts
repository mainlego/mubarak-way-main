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
  console.log('ℹ️  Library data will be added manually via Admin panel');
  // Note: Book and Nashid schemas need to match production data structure
}

async function seedPrayer() {
  console.log('\n🕌 Seeding prayer data...');
  console.log('ℹ️  Prayer lessons will be added manually via Admin panel');
  // Note: Lesson schema needs to match production data structure
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
      surahs: await Surah.countDocuments(),
      plans: await SubscriptionPlan.countDocuments(),
    };

    console.log('📊 Database Summary:');
    console.log(`   Subscription Plans: ${counts.plans}`);
    console.log(`   Surahs: ${counts.surahs}`);
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding error:', error);
    process.exit(1);
  }
}

// Run seeding
seed();
