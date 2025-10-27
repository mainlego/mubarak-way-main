import LessonModel from '../models/Lesson.js';
import UserModel from '../models/User.js';
import type {
  Lesson,
  LessonFilters,
  LessonStats,
  LessonCategory,
  DifficultyLevel,
} from '@mubarak-way/shared';

export class LessonService {
  /**
   * Get lessons with filters
   */
  static async getLessons(filters: LessonFilters = {}): Promise<Lesson[]> {
    const query: any = {};

    // Apply filters
    if (filters.category) query.category = filters.category;
    if (filters.madhab) query.madhab = filters.madhab;
    if (filters.difficulty) query.difficulty = filters.difficulty;
    if (filters.accessLevel) query.accessLevel = filters.accessLevel;
    if (filters.isFeatured !== undefined) query.isFeatured = filters.isFeatured;
    if (filters.isPublished !== undefined) query.isPublished = filters.isPublished;

    // Text search
    if (filters.search) {
      query.$text = { $search: filters.search };
    }

    // Default to published lessons only
    if (filters.isPublished === undefined) {
      query.isPublished = true;
    }

    const lessons = await LessonModel.find(query)
      .sort({ isFeatured: -1, createdAt: -1 })
      .limit(filters.limit || 50)
      .skip(filters.skip || 0)
      .lean();

    return lessons;
  }

  /**
   * Get lessons by madhab
   */
  static async getLessonsByMadhab(
    madhab: 'hanafi' | 'shafi' | 'maliki' | 'hanbali',
    filters: Omit<LessonFilters, 'madhab'> = {}
  ): Promise<Lesson[]> {
    return await this.getLessons({ ...filters, madhab });
  }

  /**
   * Get lessons by category
   */
  static async getLessonsByCategory(
    category: LessonCategory,
    filters: Omit<LessonFilters, 'category'> = {}
  ): Promise<Lesson[]> {
    return await this.getLessons({ ...filters, category });
  }

  /**
   * Get single lesson by slug
   */
  static async getLessonBySlug(slug: string): Promise<Lesson | null> {
    const lesson = await LessonModel.findOne({ slug, isPublished: true });

    if (lesson) {
      // Increment view count
      lesson.viewCount = (lesson.viewCount || 0) + 1;
      await lesson.save();
    }

    return lesson ? lesson.toObject() : null;
  }

  /**
   * Get single lesson by ID
   */
  static async getLessonById(id: string): Promise<Lesson | null> {
    return await LessonModel.findById(id).lean();
  }

  /**
   * Get featured lessons
   */
  static async getFeaturedLessons(limit: number = 10): Promise<Lesson[]> {
    return await LessonModel.find({ isFeatured: true, isPublished: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  /**
   * Get lessons by difficulty
   */
  static async getLessonsByDifficulty(
    difficulty: DifficultyLevel,
    filters: Omit<LessonFilters, 'difficulty'> = {}
  ): Promise<Lesson[]> {
    return await this.getLessons({ ...filters, difficulty });
  }

  /**
   * Get user's lesson progress
   */
  static async getUserProgress(userId: string, lessonId: string) {
    const user = await UserModel.findById(userId);
    if (!user) return null;

    const progress = user.learningProgress.find((p) => p.lessonId === lessonId);
    return progress || null;
  }

  /**
   * Update user's lesson progress
   */
  static async updateUserProgress(
    userId: string,
    lessonId: string,
    completedSteps: number,
    totalSteps: number
  ) {
    const user = await UserModel.findById(userId);
    if (!user) throw new Error('User not found');

    const progressIndex = user.learningProgress.findIndex(
      (p) => p.lessonId === lessonId
    );

    const isCompleted = completedSteps >= totalSteps;

    if (progressIndex >= 0) {
      // Update existing progress
      user.learningProgress[progressIndex].completedSteps = completedSteps;
      user.learningProgress[progressIndex].totalSteps = totalSteps;
      user.learningProgress[progressIndex].lastPracticed = new Date();
      user.learningProgress[progressIndex].completed = isCompleted;
    } else {
      // Add new progress
      user.learningProgress.push({
        lessonId,
        completedSteps,
        totalSteps,
        lastPracticed: new Date(),
        completed: isCompleted,
        mistakes: 0,
      });
    }

    await user.save();

    // If lesson completed, increment completion count
    if (isCompleted) {
      await LessonModel.findByIdAndUpdate(lessonId, {
        $inc: { completionCount: 1 },
      });
    }

    return user.learningProgress.find((p) => p.lessonId === lessonId);
  }

  /**
   * Rate a lesson
   */
  static async rateLesson(
    lessonId: string,
    rating: number
  ): Promise<Lesson | null> {
    if (rating < 0 || rating > 5) {
      throw new Error('Rating must be between 0 and 5');
    }

    const lesson = await LessonModel.findById(lessonId);
    if (!lesson) return null;

    // Calculate new average rating
    const totalRating = (lesson.rating || 0) * (lesson.ratingCount || 0);
    const newRatingCount = (lesson.ratingCount || 0) + 1;
    const newRating = (totalRating + rating) / newRatingCount;

    lesson.rating = Math.round(newRating * 100) / 100; // Round to 2 decimals
    lesson.ratingCount = newRatingCount;

    await lesson.save();
    return lesson.toObject();
  }

  /**
   * Get lesson statistics
   */
  static async getLessonStats(): Promise<LessonStats> {
    const lessons = await LessonModel.find({ isPublished: true }).lean();

    const byCategory: any = {};
    const byMadhab: any = {
      hanafi: 0,
      shafi: 0,
      maliki: 0,
      hanbali: 0,
      general: 0,
    };
    const byDifficulty: any = {
      beginner: 0,
      intermediate: 0,
      advanced: 0,
    };

    lessons.forEach((lesson) => {
      // By category
      byCategory[lesson.category] = (byCategory[lesson.category] || 0) + 1;

      // By madhab
      if (lesson.madhab) {
        byMadhab[lesson.madhab]++;
      }

      // By difficulty
      byDifficulty[lesson.difficulty]++;
    });

    // Most viewed
    const mostViewed = lessons
      .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
      .slice(0, 10);

    // Most completed
    const mostCompleted = lessons
      .sort((a, b) => (b.completionCount || 0) - (a.completionCount || 0))
      .slice(0, 10);

    // Recently added
    const recentlyAdded = lessons
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);

    return {
      totalLessons: lessons.length,
      byCategory,
      byMadhab,
      byDifficulty,
      mostViewed,
      mostCompleted,
      recentlyAdded,
    };
  }

  /**
   * Search lessons
   */
  static async searchLessons(
    query: string,
    filters: Omit<LessonFilters, 'search'> = {}
  ): Promise<Lesson[]> {
    return await this.getLessons({ ...filters, search: query });
  }

  /**
   * Get lessons with prerequisites
   */
  static async getLessonsWithPrerequisites(
    lessonId: string
  ): Promise<{ lesson: Lesson; prerequisites: Lesson[] } | null> {
    const lesson = await LessonModel.findById(lessonId).lean();
    if (!lesson) return null;

    const prerequisites = lesson.prerequisites
      ? await LessonModel.find({
          _id: { $in: lesson.prerequisites },
          isPublished: true,
        }).lean()
      : [];

    return { lesson, prerequisites };
  }

  /**
   * Get recommended lessons based on user's madhab and progress
   */
  static async getRecommendedLessons(
    userId: string,
    limit: number = 10
  ): Promise<Lesson[]> {
    const user = await UserModel.findById(userId);
    if (!user) return [];

    const userMadhab = user.prayerSettings?.madhab || 'hanafi';
    const completedLessonIds = user.learningProgress
      .filter((p) => p.completed)
      .map((p) => p.lessonId);

    // Find lessons matching user's madhab that they haven't completed
    const recommended = await LessonModel.find({
      isPublished: true,
      madhab: { $in: [userMadhab, 'general'] },
      _id: { $nin: completedLessonIds },
    })
      .sort({ rating: -1, viewCount: -1 })
      .limit(limit)
      .lean();

    return recommended;
  }
}
