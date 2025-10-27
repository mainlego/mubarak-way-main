import UserModel from '../models/User.js';
import BookmarkModel from '../models/Bookmark.js';
import SearchHistoryModel from '../models/SearchHistory.js';
import type { User, UserRole, SubscriptionTier } from '@mubarak-way/shared';

export interface AdminStats {
  users: {
    total: number;
    active: number; // Active in last 7 days
    new: number; // Registered in last 30 days
    byRole: Record<UserRole, number>;
  };
  subscriptions: {
    total: number;
    byTier: Record<SubscriptionTier, number>;
    active: number;
    expired: number;
  };
  activity: {
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
  };
  usage: {
    totalBookmarks: number;
    totalSearches: number;
    avgBookmarksPerUser: number;
    avgSearchesPerUser: number;
  };
  topUsers: Array<{
    user: User;
    bookmarkCount: number;
    searchCount: number;
  }>;
}

export interface UserManagementFilters {
  role?: UserRole;
  subscriptionTier?: SubscriptionTier;
  search?: string;
  isActive?: boolean;
  limit?: number;
  skip?: number;
}

export class AdminService {
  /**
   * Get comprehensive admin statistics
   */
  static async getAdminStats(): Promise<AdminStats> {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get all users
    const allUsers = await UserModel.find().lean();
    const totalUsers = allUsers.length;

    // Active users (last 7 days)
    const activeUsers = allUsers.filter(
      (u) => u.lastActive && new Date(u.lastActive) >= oneWeekAgo
    ).length;

    // New users (last 30 days)
    const newUsers = allUsers.filter(
      (u) => u.createdAt && new Date(u.createdAt) >= oneMonthAgo
    ).length;

    // By role
    const byRole: Record<UserRole, number> = {
      user: 0,
      admin: 0,
      moderator: 0,
    };
    allUsers.forEach((u) => {
      byRole[u.role]++;
    });

    // Subscriptions
    const byTier: Record<SubscriptionTier, number> = {
      free: 0,
      pro: 0,
      premium: 0,
    };
    let activeSubscriptions = 0;
    let expiredSubscriptions = 0;

    allUsers.forEach((u) => {
      byTier[u.subscription.tier]++;
      if (u.subscription.isActive) {
        activeSubscriptions++;
      } else {
        expiredSubscriptions++;
      }
    });

    // Daily/Weekly/Monthly active users
    const dailyActiveUsers = allUsers.filter(
      (u) => u.lastActive && new Date(u.lastActive) >= oneDayAgo
    ).length;

    const weeklyActiveUsers = allUsers.filter(
      (u) => u.lastActive && new Date(u.lastActive) >= oneWeekAgo
    ).length;

    const monthlyActiveUsers = allUsers.filter(
      (u) => u.lastActive && new Date(u.lastActive) >= oneMonthAgo
    ).length;

    // Usage statistics
    const totalBookmarks = await BookmarkModel.countDocuments();
    const totalSearches = await SearchHistoryModel.countDocuments();

    const avgBookmarksPerUser = totalUsers > 0 ? totalBookmarks / totalUsers : 0;
    const avgSearchesPerUser = totalUsers > 0 ? totalSearches / totalUsers : 0;

    // Top users by activity
    const userBookmarkCounts = await BookmarkModel.aggregate([
      {
        $group: {
          _id: '$userId',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    const userSearchCounts = await SearchHistoryModel.aggregate([
      {
        $group: {
          _id: '$userId',
          count: { $sum: '$accessCount' },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Create a map for quick lookup
    const searchCountMap = new Map(
      userSearchCounts.map((s) => [s._id, s.count])
    );

    // Get top users
    const topUserIds = userBookmarkCounts.map((u) => u._id);
    const topUsersData = await UserModel.find({
      telegramId: { $in: topUserIds },
    }).lean();

    const topUsers = userBookmarkCounts.map((u) => {
      const user = topUsersData.find((usr) => usr.telegramId === u._id);
      return {
        user: user!,
        bookmarkCount: u.count,
        searchCount: searchCountMap.get(u._id) || 0,
      };
    });

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        new: newUsers,
        byRole,
      },
      subscriptions: {
        total: totalUsers,
        byTier,
        active: activeSubscriptions,
        expired: expiredSubscriptions,
      },
      activity: {
        dailyActiveUsers,
        weeklyActiveUsers,
        monthlyActiveUsers,
      },
      usage: {
        totalBookmarks,
        totalSearches,
        avgBookmarksPerUser: Math.round(avgBookmarksPerUser * 100) / 100,
        avgSearchesPerUser: Math.round(avgSearchesPerUser * 100) / 100,
      },
      topUsers,
    };
  }

  /**
   * Get list of users with filters
   */
  static async getUsers(filters: UserManagementFilters): Promise<{
    users: User[];
    total: number;
  }> {
    const query: any = {};

    if (filters.role) query.role = filters.role;
    if (filters.subscriptionTier) query['subscription.tier'] = filters.subscriptionTier;
    if (filters.isActive !== undefined) {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      if (filters.isActive) {
        query.lastActive = { $gte: sevenDaysAgo };
      } else {
        query.lastActive = { $lt: sevenDaysAgo };
      }
    }

    if (filters.search) {
      query.$or = [
        { firstName: { $regex: filters.search, $options: 'i' } },
        { lastName: { $regex: filters.search, $options: 'i' } },
        { username: { $regex: filters.search, $options: 'i' } },
        { telegramId: { $regex: filters.search, $options: 'i' } },
      ];
    }

    const total = await UserModel.countDocuments(query);
    const users = await UserModel.find(query)
      .sort({ createdAt: -1 })
      .limit(filters.limit || 50)
      .skip(filters.skip || 0)
      .lean();

    return { users, total };
  }

  /**
   * Get single user details
   */
  static async getUserById(userId: string): Promise<User | null> {
    return await UserModel.findById(userId).lean();
  }

  /**
   * Update user role
   */
  static async updateUserRole(
    userId: string,
    role: UserRole
  ): Promise<User | null> {
    return await UserModel.findByIdAndUpdate(
      userId,
      { $set: { role } },
      { new: true }
    ).lean();
  }

  /**
   * Update user subscription
   */
  static async updateUserSubscription(
    userId: string,
    tier: SubscriptionTier,
    isActive: boolean,
    expiresAt?: Date
  ): Promise<User | null> {
    return await UserModel.findByIdAndUpdate(
      userId,
      {
        $set: {
          'subscription.tier': tier,
          'subscription.isActive': isActive,
          'subscription.expiresAt': expiresAt,
        },
      },
      { new: true }
    ).lean();
  }

  /**
   * Get user activity details
   */
  static async getUserActivity(userId: string): Promise<{
    bookmarks: number;
    searches: number;
    recentActivity: Array<{
      type: string;
      timestamp: Date;
      details: any;
    }>;
  }> {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const bookmarkCount = await BookmarkModel.countDocuments({
      userId: user.telegramId,
    });

    const searchCount = await SearchHistoryModel.countDocuments({
      userId: user.telegramId,
    });

    // Get recent bookmarks
    const recentBookmarks = await BookmarkModel.find({
      userId: user.telegramId,
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Get recent searches
    const recentSearches = await SearchHistoryModel.find({
      userId: user.telegramId,
    })
      .sort({ timestamp: -1 })
      .limit(5)
      .lean();

    // Combine and sort by timestamp
    const recentActivity = [
      ...recentBookmarks.map((b) => ({
        type: 'bookmark',
        timestamp: b.createdAt,
        details: { title: b.title, type: b.type, collection: b.collection },
      })),
      ...recentSearches.map((s) => ({
        type: 'search',
        timestamp: s.timestamp,
        details: { query: s.query, type: s.type, resultsCount: s.resultsCount },
      })),
    ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return {
      bookmarks: bookmarkCount,
      searches: searchCount,
      recentActivity,
    };
  }

  /**
   * Get public bookmarks for moderation
   */
  static async getPublicBookmarks(limit: number = 50, skip: number = 0) {
    const bookmarks = await BookmarkModel.find({ isPublic: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    const total = await BookmarkModel.countDocuments({ isPublic: true });

    return { bookmarks, total };
  }

  /**
   * Delete user (admin action)
   */
  static async deleteUser(userId: string): Promise<boolean> {
    const user = await UserModel.findById(userId);
    if (!user) return false;

    // Delete user's bookmarks
    await BookmarkModel.deleteMany({ userId: user.telegramId });

    // Delete user's search history
    await SearchHistoryModel.deleteMany({ userId: user.telegramId });

    // Delete user
    await UserModel.findByIdAndDelete(userId);

    return true;
  }

  /**
   * Get activity timeline (recent actions across all users)
   */
  static async getActivityTimeline(limit: number = 50): Promise<
    Array<{
      type: string;
      user: { id: string; name: string; username?: string };
      timestamp: Date;
      details: any;
    }>
  > {
    // Get recent users
    const recentUsers = await UserModel.find()
      .sort({ lastActive: -1 })
      .limit(limit)
      .lean();

    // Get recent bookmarks
    const recentBookmarks = await BookmarkModel.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    // Get recent searches
    const recentSearches = await SearchHistoryModel.find()
      .sort({ timestamp: -1 })
      .limit(20)
      .lean();

    // Map user data
    const userMap = new Map(
      recentUsers.map((u) => [
        u.telegramId,
        {
          id: u._id.toString(),
          name: `${u.firstName} ${u.lastName || ''}`.trim(),
          username: u.username,
        },
      ])
    );

    // Combine activities
    const activities = [
      ...recentBookmarks.map((b) => ({
        type: 'bookmark_created',
        user: userMap.get(b.userId) || {
          id: '',
          name: 'Unknown',
          username: undefined,
        },
        timestamp: b.createdAt,
        details: { title: b.title, type: b.type, collection: b.collection },
      })),
      ...recentSearches.map((s) => ({
        type: 'search_performed',
        user: userMap.get(s.userId) || {
          id: '',
          name: 'Unknown',
          username: undefined,
        },
        timestamp: s.timestamp,
        details: { query: s.query, type: s.type },
      })),
    ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return activities.slice(0, limit);
  }
}
