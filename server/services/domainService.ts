import { Domain } from '../models/Domain.js';
import { NewsArticle } from '../models/NewsArticle.js';
import { config } from '../config/index.js';
import { Op } from 'sequelize';

export class DomainService {
  private tlds: string[];

  constructor() {
    this.tlds = config.domain.tlds;
  }

  /**
   * Extract keywords from text
   */
  private extractKeywords(text: string): string[] {
    const words = text.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length >= 3 && word.length <= 15);

    // Filter out common words
    const commonWords = new Set([
      'the', 'and', 'for', 'that', 'this', 'with', 'from', 'have', 'has',
      'had', 'was', 'were', 'been', 'are', 'will', 'can', 'could', 'would',
      'should', 'may', 'might', 'must', 'into', 'about', 'than', 'then',
    ]);

    return words.filter(word => !commonWords.has(word));
  }

  /**
   * Calculate domain score
   */
  private calculateDomainScore(keyword: string): number {
    const baseScore = 50;
    const lengthScore = Math.min(keyword.length * 5, 30);
    const hasNumbers = /\d/.test(keyword) ? -10 : 0;
    const isAllLetters = /^[a-zA-Z]+$/.test(keyword) ? 20 : 0;
    const memorabilityScore = keyword.length >= 4 && keyword.length <= 12 ? 15 : 0;
    
    return baseScore + lengthScore + hasNumbers + isAllLetters + memorabilityScore;
  }

  /**
   * Generate domains from news articles
   */
  async generateDomainsFromNews(): Promise<Domain[]> {
    try {
      // Get recent news articles that haven't been processed
      const articles = await NewsArticle.findAll({
        where: {
          processedAt: null,
        },
        limit: 50,
        order: [['publishedAt', 'DESC']],
      });

      const generatedDomains: Domain[] = [];

      for (const article of articles) {
        // Extract keywords from title and description
        const titleKeywords = this.extractKeywords(article.title);
        const descKeywords = this.extractKeywords(article.description);
        const allKeywords = [...new Set([...titleKeywords, ...descKeywords])];

        // Store keywords in article
        article.extractedKeywords = allKeywords;
        article.processedAt = new Date();
        await article.save();

        // Generate domains for each keyword
        for (const keyword of allKeywords) {
          for (const tld of this.tlds) {
            // Check if domain already exists
            const existingDomain = await Domain.findOne({
              where: {
                name: keyword,
                tld: tld,
              },
            });

            if (!existingDomain) {
              const score = this.calculateDomainScore(keyword);
              
              const domain = await Domain.create({
                name: keyword,
                tld: tld,
                available: false, // Will be checked later
                keywords: [keyword],
                score: score,
                generatedAt: new Date(),
                sourceArticleId: article.id,
                currency: 'USD',
                popularity: 0,
              });

              generatedDomains.push(domain);
            }
          }
        }
      }

      console.log(`✅ Generated ${generatedDomains.length} new domains from ${articles.length} articles`);
      return generatedDomains;
    } catch (error) {
      console.error('❌ Error generating domains:', error);
      throw error;
    }
  }

  /**
   * Get domains with filters
   */
  async getDomains(filters: {
    tld?: string;
    available?: boolean;
    minScore?: number;
    limit?: number;
    offset?: number;
  }) {
    const where: Record<string, unknown> = {};

    if (filters.tld) {
      where.tld = filters.tld;
    }

    if (filters.available !== undefined) {
      where.available = filters.available;
    }

    if (filters.minScore) {
      where.score = { [Op.gte]: filters.minScore };
    }

    const domains = await Domain.findAll({
      where,
      limit: filters.limit || 20,
      offset: filters.offset || 0,
      order: [['score', 'DESC'], ['generatedAt', 'DESC']],
    });

    const count = await Domain.count({ where });

    return {
      domains,
      total: count,
      limit: filters.limit || 20,
      offset: filters.offset || 0,
    };
  }

  /**
   * Get domain by ID
   */
  async getDomainById(id: string) {
    const domain = await Domain.findByPk(id);
    if (!domain) {
      throw new Error('Domain not found');
    }
    return domain;
  }

  /**
   * Update domain availability
   */
  async updateDomainAvailability(id: string, available: boolean, price?: number) {
    const domain = await Domain.findByPk(id);
    if (!domain) {
      throw new Error('Domain not found');
    }

    domain.available = available;
    domain.checkedAt = new Date();

    if (price !== undefined) {
      // Update price history
      const priceHistory = domain.priceHistory || [];
      priceHistory.push({ price, date: new Date() });
      domain.priceHistory = priceHistory;
      domain.price = price;
    }

    await domain.save();
    return domain;
  }

  /**
   * Get configurable TLDs
   */
  getTLDs(): string[] {
    return this.tlds;
  }

  /**
   * Update configurable TLDs
   */
  updateTLDs(tlds: string[]): void {
    this.tlds = tlds;
  }
}
