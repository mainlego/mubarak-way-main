import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function checkLessons() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const lessonsCollection = db.collection('lessons');

    // Count total lessons
    const total = await lessonsCollection.countDocuments();
    console.log(`📊 Total lessons: ${total}\n`);

    // Get all lessons with basic info
    const lessons = await lessonsCollection
      .find({})
      .project({ slug: 1, title: 1, category: 1, difficulty: 1, estimatedMinutes: 1, 'steps.title': 1 })
      .sort({ category: 1 })
      .toArray();

    // Group by category
    const byCategory = lessons.reduce((acc, lesson) => {
      if (!acc[lesson.category]) acc[lesson.category] = [];
      acc[lesson.category].push(lesson);
      return acc;
    }, {});

    // Display by category
    for (const [category, categoryLessons] of Object.entries(byCategory)) {
      console.log(`\n📖 ${category} (${categoryLessons.length} lessons):`);
      console.log('═'.repeat(60));

      for (const lesson of categoryLessons) {
        const stepCount = lesson.steps ? lesson.steps.length : 0;
        console.log(`  • ${lesson.title} (${lesson.slug})`);
        console.log(`    ├─ Difficulty: ${lesson.difficulty}`);
        console.log(`    ├─ Duration: ${lesson.estimatedMinutes} min`);
        console.log(`    └─ Steps: ${stepCount}`);
      }
    }

    // Sample one lesson with full details
    console.log('\n\n📝 Sample Lesson (Fajr) - Full Details:');
    console.log('═'.repeat(60));
    const fajr = await lessonsCollection.findOne({ slug: 'fajr-prayer' });
    if (fajr) {
      console.log(JSON.stringify(fajr, null, 2));
    }

    await mongoose.connection.close();
    console.log('\n✅ Check completed!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkLessons();
