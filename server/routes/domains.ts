import { Router } from 'express';
import { DomainController } from '../controllers/domainController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();
const domainController = new DomainController();

router.get('/', (req, res) => domainController.getDomains(req, res));
router.get('/tlds', (req, res) => domainController.getTLDs(req, res));
router.get('/:id', (req, res) => domainController.getDomainById(req, res));
router.put('/:id/availability', authenticate, requireAdmin, (req, res) => 
  domainController.updateDomainAvailability(req, res)
);

export default router;
