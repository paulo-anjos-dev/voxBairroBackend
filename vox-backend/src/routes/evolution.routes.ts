import express from 'express';
import { 
  evolutionWebhook, 
  createInstance, 
  listInstances, 
  getQrCode 
} from '../controllers/evolution.controller';
import { validateEvolutionApiKey } from '../middlewares/auth.middleware';

const router = express.Router();

/**
 * Webhook para receber eventos da Evolution API
 * Protegido por API Key no header
 */
router.post('/webhook/evolution', validateEvolutionApiKey, evolutionWebhook);
router.post('/webhook/evolution/:event', validateEvolutionApiKey, evolutionWebhook);

/**
 * Gerenciamento de Instâncias
 */
router.post('/instance/create', createInstance);
router.get('/instances', listInstances);

/**
 * Utilitários
 */
router.get('/qr', getQrCode);

export default router;
