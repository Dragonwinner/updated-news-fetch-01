import { NewsArticle } from '../models/NewsArticle';
import axios from 'axios';

interface RSSItem {
  title: string;
  description: string;
  content: string;
  link: string;
  pubDate: string;
  guid: string;
}

export class NewsService {
  private rssFeeds = [
    { url: 'https://feeds.bbci.co.uk/news/technology/rss.xml', name: 'BBC Tech' },
    { url: 'https://www.wired.com/feed/rss', name: 'Wired' },
    { url: 'https://techcrunch.com/feed/', name: 'TechCrunch' },
  ];

  /**
   * Parse XML to JSON (simplified for server-side)
   */
  private parseXML(xmlText: string): RSSItem[] {
    // Simple regex-based parsing for server-side
    // In production, use a proper XML parser like 'fast-xml-parser'
    const items: RSSItem[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    const matches = xmlText.matchAll(itemRegex);

    for (const match of matches) {
      const itemContent = match[1];
      const title = this.extractTag(itemContent, 'title');
      const description = this.extractTag(itemContent, 'description');
      const link = this.extractTag(itemContent, 'link');
      const pubDate = this.extractTag(itemContent, 'pubDate');
      const guid = this.extractTag(itemContent, 'guid') || link;

      if (title && link) {
        items.push({
          title,
          description: description || '',
          content: description || '',
          link,
          pubDate: pubDate || new Date().toISOString(),
          guid,
        });
      }
    }

    return items;
  }

  /**
   * Extract content from XML tag
   */
  private extractTag(xml: string, tagName: string): string {
    const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\/${tagName}>`, 'i');
    const match = xml.match(regex);
    return match ? match[1].trim() : '';
  }

  /**
   * Strip HTML tags
   */
  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').trim();
  }

  /**
   * Fetch and store news articles
   */
  async fetchAndStoreNews(): Promise<NewsArticle[]> {
    const newArticles: NewsArticle[] = [];

    for (const feed of this.rssFeeds) {
      try {
        const response = await axios.get(feed.url, {
          timeout: 10000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)',
          },
        });

        const items = this.parseXML(response.data);

        for (const item of items) {
          try {
            // Check if article already exists
            const existing = await NewsArticle.findOne({
              where: { url: item.link },
            });

            if (!existing) {
              const article = await NewsArticle.create({
                title: this.stripHtml(item.title),
                description: this.stripHtml(item.description),
                content: this.stripHtml(item.content || item.description),
                url: item.link,
                source: feed.name,
                publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
                extractedKeywords: [],
              });

              newArticles.push(article);
            }
          } catch (error) {
            console.error(`Error saving article from ${feed.name}:`, error);
          }
        }
      } catch (error) {
        console.error(`Error fetching feed ${feed.url}:`, error);
      }
    }

    console.log(`✅ Fetched and stored ${newArticles.length} new articles`);
    return newArticles;
  }

  /**
   * Get recent articles
   */
  async getRecentArticles(limit: number = 50) {
    return NewsArticle.findAll({
      limit,
      order: [['publishedAt', 'DESC']],
    });
  }

  /**
   * Get article by ID
   */
  async getArticleById(id: string) {
    const article = await NewsArticle.findByPk(id);
    if (!article) {
      throw new Error('Article not found');
    }
    return article;
  }
}
