import cron from 'node-cron';
import { DomainService } from '../services/domainService';
import { NewsService } from '../services/newsService';
import { config } from '../config';

const domainService = new DomainService();
const newsService = new NewsService();

/**
 * Hourly job to fetch news and generate domains
 */
export const startDomainGenerationJob = () => {
  if (!config.cron.enabled) {
    console.log('⏭️  Cron jobs are disabled');
    return;
  }

  console.log('🕐 Starting hourly domain generation job...');

  // Run every hour (or as configured)
  cron.schedule(config.cron.schedule, async () => {
    try {
      console.log('⏰ Running hourly domain generation job...');

      // Step 1: Fetch latest news
      const articles = await newsService.fetchAndStoreNews();
      console.log(`   Fetched ${articles.length} new articles`);

      // Step 2: Generate domains from news
      const domains = await domainService.generateDomainsFromNews();
      console.log(`   Generated ${domains.length} new domains`);

      console.log('✅ Hourly job completed successfully');
    } catch (error) {
      console.error('❌ Error in hourly job:', error);
    }
  });

  console.log(`✅ Cron job scheduled: ${config.cron.schedule}`);
};

/**
 * Run the job immediately (for testing or manual trigger)
 */
export const runDomainGenerationNow = async () => {
  try {
    console.log('🚀 Running domain generation job now...');
    
    const articles = await newsService.fetchAndStoreNews();
    console.log(`   Fetched ${articles.length} new articles`);
    
    const domains = await domainService.generateDomainsFromNews();
    console.log(`   Generated ${domains.length} new domains`);
    
    console.log('✅ Manual job completed successfully');
    return { articles: articles.length, domains: domains.length };
  } catch (error) {
    console.error('❌ Error in manual job:', error);
    throw error;
  }
};
