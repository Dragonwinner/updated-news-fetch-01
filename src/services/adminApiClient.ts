import { apiClient } from './apiClient';

export interface DashboardStats {
  users: {
    total: number;
    active: number;
    admins: number;
    newToday: number;
    newThisWeek: number;
    newThisMonth: number;
  };
  domains: {
    total: number;
    available: number;
    unavailable: number;
    generatedToday: number;
    generatedThisWeek: number;
    generatedThisMonth: number;
    avgScore: number;
  };
  articles: {
    total: number;
    todayCount: number;
    thisWeekCount: number;
    thisMonthCount: number;
    sources: Array<{ source: string; count: number }>;
  };
  analytics: {
    totalEvents: number;
    uniqueUsers: number;
    uniqueSessions: number;
    topEvents: Array<{ eventType: string; count: number }>;
  };
  system: {
    databaseSize: string;
    redisConnected: boolean;
    uptime: number;
  };
}

export interface UserGrowthData {
  date: string;
  total: number;
  new: number;
}

export interface DomainGenerationData {
  date: string;
  count: number;
  available: number;
}

export interface ActivityMetrics {
  hour: string;
  events: number;
  users: number;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin';
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
}

export interface UserConnection {
  users: User[];
  total: number;
  page: number;
  totalPages: number;
}

class AdminApiClient {
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await apiClient.get('/admin/stats');
    return response.data;
  }

  async getUserGrowth(days: number = 30): Promise<UserGrowthData[]> {
    const response = await apiClient.get(`/admin/stats/user-growth?days=${days}`);
    return response.data;
  }

  async getDomainGeneration(days: number = 30): Promise<DomainGenerationData[]> {
    const response = await apiClient.get(`/admin/stats/domain-generation?days=${days}`);
    return response.data;
  }

  async getActivityMetrics(hours: number = 24): Promise<ActivityMetrics[]> {
    const response = await apiClient.get(`/admin/stats/activity?hours=${hours}`);
    return response.data;
  }

  async getAllUsers(page: number = 1, limit: number = 50): Promise<UserConnection> {
    const response = await apiClient.get(`/admin/users?page=${page}&limit=${limit}`);
    return response.data;
  }

  async updateUserStatus(userId: string, isActive: boolean): Promise<{ message: string; user: User }> {
    const response = await apiClient.patch(`/admin/users/${userId}/status`, { isActive });
    return response.data;
  }

  async updateUserRole(userId: string, role: 'user' | 'admin'): Promise<{ message: string; user: User }> {
    const response = await apiClient.patch(`/admin/users/${userId}/role`, { role });
    return response.data;
  }

  async clearCache(): Promise<{ message: string }> {
    const response = await apiClient.post('/admin/cache/clear');
    return response.data;
  }
}

export const adminApiClient = new AdminApiClient();
