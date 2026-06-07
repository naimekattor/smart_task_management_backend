import { AnalyticsRepository } from '../repositories/analytics.repository.js';

const analyticsRepository = new AnalyticsRepository();

export class AnalyticsService {
  async getDashboardData(userId: string, role: string) {
    return analyticsRepository.getDashboardStats(userId, role);
  }
}
