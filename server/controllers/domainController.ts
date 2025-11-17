import { Response } from 'express';
import { DomainService } from '../services/domainService';
import { AuthRequest } from '../middleware/auth';
import { AnalyticsService } from '../services/analyticsService';

const domainService = new DomainService();
const analyticsService = new AnalyticsService();

export class DomainController {
  async getDomains(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { tld, available, minScore, limit, offset } = req.query;

      const result = await domainService.getDomains({
        tld: tld as string,
        available: available === 'true',
        minScore: minScore ? parseInt(minScore as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        offset: offset ? parseInt(offset as string, 10) : undefined,
      });

      // Track analytics
      await analyticsService.trackEvent(
        'domains_list_view',
        { filters: req.query },
        req.user?.userId
      );

      res.json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get domains';
      res.status(400).json({ error: message });
    }
  }

  async getDomainById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const domain = await domainService.getDomainById(id);

      // Track analytics
      await analyticsService.trackEvent(
        'domain_view',
        { domainId: id },
        req.user?.userId
      );

      res.json({ domain });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get domain';
      res.status(404).json({ error: message });
    }
  }

  async getTLDs(req: AuthRequest, res: Response): Promise<void> {
    try {
      const tlds = domainService.getTLDs();
      res.json({ tlds });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get TLDs';
      res.status(400).json({ error: message });
    }
  }

  async updateDomainAvailability(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { available, price } = req.body;

      const domain = await domainService.updateDomainAvailability(
        id,
        available,
        price
      );

      res.json({ domain });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update domain';
      res.status(400).json({ error: message });
    }
  }
}
