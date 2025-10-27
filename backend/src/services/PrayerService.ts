import Lesson from '../models/Lesson.js';
import type {
  Lesson as LessonType,
  PrayerTimes,
  PrayerCalculationParams,
  QiblaDirection,
} from '@mubarak-way/shared';
import {
  calculatePrayerTimes,
  calculateQibla,
  calculateDistanceToMecca,
  getCalculationMethods,
} from '../utils/prayerTimes.js';

export class PrayerService {
  /**
   * Get all lessons
   */
  static async getAllLessons(category?: string): Promise<LessonType[]> {
    const filter: any = {};
    if (category) filter.category = category;

    return await Lesson.find(filter).sort({ category: 1, 'steps.order': 1 });
  }

  /**
   * Get lesson by slug
   */
  static async getLessonBySlug(slug: string): Promise<LessonType | null> {
    return await Lesson.findOne({ slug });
  }

  /**
   * Get featured lessons
   */
  static async getFeaturedLessons(limit = 5): Promise<LessonType[]> {
    return await Lesson.find({ isFeatured: true }).limit(limit);
  }

  /**
   * Get lessons by category
   */
  static async getLessonsByCategory(category: string): Promise<LessonType[]> {
    return await Lesson.find({ category }).sort({ difficulty: 1 });
  }

  /**
   * Get lessons by difficulty
   */
  static async getLessonsByDifficulty(
    difficulty: 'beginner' | 'intermediate' | 'advanced'
  ): Promise<LessonType[]> {
    return await Lesson.find({ difficulty });
  }

  /**
   * Search lessons
   */
  static async searchLessons(query: string): Promise<LessonType[]> {
    return await Lesson.find({
      $text: { $search: query },
    })
      .sort({ score: { $meta: 'textScore' } })
      .limit(20);
  }

  /**
   * Get prayer statistics
   */
  static async getStats() {
    const totalLessons = await Lesson.countDocuments();
    const obligatoryLessons = await Lesson.countDocuments({
      category: 'obligatory-prayers',
    });
    const optionalLessons = await Lesson.countDocuments({
      category: 'optional-prayers',
    });
    const specialLessons = await Lesson.countDocuments({
      category: 'special-prayers',
    });
    const ablutionLessons = await Lesson.countDocuments({
      category: 'ablution',
    });

    return {
      total: totalLessons,
      byCategory: {
        obligatory: obligatoryLessons,
        optional: optionalLessons,
        special: specialLessons,
        ablution: ablutionLessons,
      },
    };
  }

  /**
   * Calculate prayer times for a location
   */
  static calculatePrayerTimes(
    latitude: number,
    longitude: number,
    date: Date,
    params: PrayerCalculationParams,
    city?: string,
    country?: string
  ): PrayerTimes {
    return calculatePrayerTimes(latitude, longitude, date, params, city, country);
  }

  /**
   * Get all available calculation methods
   */
  static getCalculationMethods() {
    return getCalculationMethods();
  }

  /**
   * Calculate Qibla direction and distance to Mecca
   */
  static calculateQiblaDirection(latitude: number, longitude: number): QiblaDirection {
    const direction = calculateQibla(latitude, longitude);
    const distance = calculateDistanceToMecca(latitude, longitude);

    return {
      direction,
      distance,
      location: {
        latitude,
        longitude,
      },
    };
  }
}
