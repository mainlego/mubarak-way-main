import SearchHistoryModel from '../models/SearchHistory.js';
import type {
  SearchHistory,
  CreateSearchHistoryInput,
  UpdateSearchHistoryInput,
  SearchHistoryStats,
  SearchSuggestion,
  SearchType,
  SearchSource,
} from '@mubarak-way/shared';

export class SearchHistoryService {
  /**
   * Create or update search history entry
   * If same query exists within last hour, increment accessCount instead
   */
  static async createOrUpdateSearch(
    userId: string,
    input: CreateSearchHistoryInput
  ): Promise<SearchHistory> {
    // Check if same query was searched recently (within 1 hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const existingSearch = await SearchHistoryModel.findOne({
      userId,
      query: input.query,
      type: input.type,
      timestamp: { $gte: oneHourAgo },
    });

    if (existingSearch) {
      // Update existing search
      existingSearch.accessCount += 1;
      existingSearch.lastAccessed = new Date();
      if (input.resultsCount !== undefined) {
        existingSearch.resultsCount = input.resultsCount;
      }
      return await existingSearch.save();
    }

    // Create new search history entry
    const search = new SearchHistoryModel({
      userId,
      ...input,
      timestamp: new Date(),
      accessCount: 1,
    });

    return await search.save();
  }

  /**
   * Get user's search history with optional filters
   */
  static async getUserSearchHistory(
    userId: string,
    filters?: {
      type?: SearchType;
      source?: SearchSource;
      favorite?: boolean;
      limit?: number;
      skip?: number;
    }
  ): Promise<SearchHistory[]> {
    const query: any = { userId };

    if (filters?.type) query.type = filters.type;
    if (filters?.source) query.source = filters.source;
    if (filters?.favorite !== undefined) query.favorite = filters.favorite;

    return await SearchHistoryModel.find(query)
      .sort({ timestamp: -1 })
      .limit(filters?.limit || 50)
      .skip(filters?.skip || 0)
      .lean();
  }

  /**
   * Get search suggestions based on user's history
   */
  static async getSearchSuggestions(
    userId: string,
    query: string,
    type?: SearchType,
    limit: number = 5
  ): Promise<SearchSuggestion[]> {
    const searchQuery: any = {
      userId,
      query: { $regex: query, $options: 'i' },
    };

    if (type) searchQuery.type = type;

    // Get matching searches, group by query
    const results = await SearchHistoryModel.aggregate([
      { $match: searchQuery },
      {
        $group: {
          _id: { query: '$query', type: '$type' },
          count: { $sum: '$accessCount' },
          lastUsed: { $max: '$timestamp' },
          source: { $first: '$source' },
        },
      },
      { $sort: { count: -1, lastUsed: -1 } },
      { $limit: limit },
    ]);

    return results.map((r) => ({
      query: r._id.query,
      type: r._id.type,
      source: r.source,
      count: r.count,
      lastUsed: r.lastUsed,
    }));
  }

  /**
   * Get single search history entry
   */
  static async getSearchById(
    searchId: string,
    userId: string
  ): Promise<SearchHistory | null> {
    return await SearchHistoryModel.findOne({ _id: searchId, userId }).lean();
  }

  /**
   * Update search history entry
   */
  static async updateSearch(
    searchId: string,
    userId: string,
    update: UpdateSearchHistoryInput
  ): Promise<SearchHistory | null> {
    return await SearchHistoryModel.findOneAndUpdate(
      { _id: searchId, userId },
      { $set: update },
      { new: true }
    ).lean();
  }

  /**
   * Delete search history entry
   */
  static async deleteSearch(searchId: string, userId: string): Promise<boolean> {
    const result = await SearchHistoryModel.deleteOne({ _id: searchId, userId });
    return result.deletedCount > 0;
  }

  /**
   * Clear all search history for user (except favorites)
   */
  static async clearHistory(
    userId: string,
    options?: {
      type?: SearchType;
      keepFavorites?: boolean;
    }
  ): Promise<number> {
    const query: any = { userId };

    if (options?.type) query.type = options.type;
    if (options?.keepFavorites) query.favorite = false;

    const result = await SearchHistoryModel.deleteMany(query);
    return result.deletedCount;
  }

  /**
   * Toggle favorite status
   */
  static async toggleFavorite(
    searchId: string,
    userId: string
  ): Promise<SearchHistory | null> {
    const search = await SearchHistoryModel.findOne({ _id: searchId, userId });
    if (!search) return null;

    search.favorite = !search.favorite;
    return await search.save();
  }

  /**
   * Add tag to search history
   */
  static async addTag(
    searchId: string,
    userId: string,
    tag: string
  ): Promise<SearchHistory | null> {
    return await SearchHistoryModel.findOneAndUpdate(
      { _id: searchId, userId },
      { $addToSet: { tags: tag } },
      { new: true }
    ).lean();
  }

  /**
   * Remove tag from search history
   */
  static async removeTag(
    searchId: string,
    userId: string,
    tag: string
  ): Promise<SearchHistory | null> {
    return await SearchHistoryModel.findOneAndUpdate(
      { _id: searchId, userId },
      { $pull: { tags: tag } },
      { new: true }
    ).lean();
  }

  /**
   * Get search history statistics
   */
  static async getSearchStats(userId: string): Promise<SearchHistoryStats> {
    const searches = await SearchHistoryModel.find({ userId }).lean();

    // Calculate stats
    const byType: Record<SearchType, number> = {
      quran: 0,
      library: 0,
      prayer: 0,
      general: 0,
    };

    const bySource: Record<SearchSource, number> = {
      quran_reader: 0,
      surah_list: 0,
      library_page: 0,
      ai_chat: 0,
      global_search: 0,
    };

    const queryCount: Map<string, { count: number; type: SearchType }> = new Map();
    const tagCount: Map<string, number> = new Map();
    let favoriteCount = 0;

    searches.forEach((search) => {
      // By type
      byType[search.type]++;

      // By source
      if (search.source) {
        bySource[search.source]++;
      }

      // Query count
      const key = `${search.query}:${search.type}`;
      const existing = queryCount.get(key);
      if (existing) {
        existing.count += search.accessCount;
      } else {
        queryCount.set(key, { count: search.accessCount, type: search.type });
      }

      // Tags
      search.tags?.forEach((tag) => {
        tagCount.set(tag, (tagCount.get(tag) || 0) + 1);
      });

      // Favorites
      if (search.favorite) favoriteCount++;
    });

    // Top searches
    const topSearches = Array.from(queryCount.entries())
      .map(([key, value]) => ({
        query: key.split(':')[0],
        type: value.type,
        count: value.count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Popular tags
    const popularTags = Array.from(tagCount.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Recent searches
    const recentSearches = searches
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);

    return {
      total: searches.length,
      byType,
      bySource,
      favoriteCount,
      recentSearches,
      topSearches,
      popularTags,
    };
  }

  /**
   * Record search result click
   */
  static async recordClick(
    searchId: string,
    userId: string,
    clickedResultId: string
  ): Promise<SearchHistory | null> {
    return await SearchHistoryModel.findOneAndUpdate(
      { _id: searchId, userId },
      {
        $set: {
          clicked: true,
          clickedResultId,
        },
      },
      { new: true }
    ).lean();
  }
}
