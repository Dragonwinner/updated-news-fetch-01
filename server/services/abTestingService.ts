import { ABTest } from '../models/ABTest.js';
import { getRedisClient } from '../config/redis.js';
import { config } from '../config/index.js';

export class ABTestingService {
  private redis;

  constructor() {
    this.redis = getRedisClient();
  }

  /**
   * Create a new A/B test
   */
  async createTest(
    name: string,
    description: string,
    variants: Array<{ id: string; name: string; weight: number }>
  ) {
    if (!config.abTesting.enabled) {
      throw new Error('A/B testing is disabled');
    }

    // Validate weights sum to 100
    const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0);
    if (Math.abs(totalWeight - 100) > 0.01) {
      throw new Error('Variant weights must sum to 100');
    }

    return ABTest.create({
      name,
      description,
      variants,
      isActive: true,
      startDate: new Date(),
      metrics: {},
    });
  }

  /**
   * Get variant for a user/session
   */
  async getVariant(testName: string, userId: string): Promise<string> {
    if (!config.abTesting.enabled) {
      return 'control';
    }

    // Check cache first
    const cached = await this.redis.get(`abtest:${testName}:${userId}`);
    if (cached) {
      return cached;
    }

    // Get test
    const test = await ABTest.findOne({
      where: { name: testName, isActive: true },
    });

    if (!test) {
      return 'control';
    }

    // Select variant based on weights
    const random = Math.random() * 100;
    let cumulative = 0;

    for (const variant of test.variants) {
      cumulative += variant.weight;
      if (random <= cumulative) {
        // Cache the assignment
        await this.redis.setex(`abtest:${testName}:${userId}`, 86400, variant.id);
        return variant.id;
      }
    }

    return test.variants[0]?.id || 'control';
  }

  /**
   * Track conversion for a variant
   */
  async trackConversion(testName: string, variantId: string, metricName: string) {
    if (!config.abTesting.enabled) {
      return;
    }

    const test = await ABTest.findOne({
      where: { name: testName, isActive: true },
    });

    if (!test) {
      return;
    }

    // Update metrics
    const metrics = test.metrics || {};
    if (!metrics[variantId]) {
      metrics[variantId] = {};
    }
    if (!metrics[variantId][metricName]) {
      metrics[variantId][metricName] = 0;
    }

    metrics[variantId][metricName]++;
    test.metrics = metrics;
    await test.save();

    // Update Redis counter
    await this.redis.hincrby(`abtest:${testName}:conversions`, `${variantId}:${metricName}`, 1);
  }

  /**
   * Get test results
   */
  async getTestResults(testName: string) {
    const test = await ABTest.findOne({
      where: { name: testName },
    });

    if (!test) {
      throw new Error('Test not found');
    }

    return {
      id: test.id,
      name: test.name,
      description: test.description,
      isActive: test.isActive,
      startDate: test.startDate,
      endDate: test.endDate,
      variants: test.variants,
      metrics: test.metrics,
    };
  }

  /**
   * End a test
   */
  async endTest(testName: string) {
    const test = await ABTest.findOne({
      where: { name: testName },
    });

    if (!test) {
      throw new Error('Test not found');
    }

    test.isActive = false;
    test.endDate = new Date();
    await test.save();

    return test;
  }

  /**
   * Get all active tests
   */
  async getActiveTests() {
    return ABTest.findAll({
      where: { isActive: true },
      order: [['startDate', 'DESC']],
    });
  }
}
