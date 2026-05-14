import express from 'express';
import { verifyWebhook, handleWebhook } from '../controllers/whatsapp.controller';

const router = express.Router();

router.get('/webhook', verifyWebhook);

router.post('/webhook', express.raw({ type: 'application/json' }), (req: express.Request, _res: express.Response, next: express.NextFunction) => {
  (req as any).rawBody = req.body;
  next();
}, handleWebhook);

export default router;

