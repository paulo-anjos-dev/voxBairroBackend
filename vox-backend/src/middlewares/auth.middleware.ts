import { Request, Response, NextFunction } from 'express';

const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;

/**
 * Middleware para validar a API Key da Evolution API no Webhook
 */
export const validateEvolutionApiKey = (req: Request, res: Response, next: NextFunction) => {
  // A Evolution API pode enviar a chave no header 'apikey' ou no corpo 'apikey'
  const apiKey = req.headers['apikey'] || req.body?.apikey;

  if (!apiKey || apiKey !== EVOLUTION_API_KEY) {
    console.warn('[Security] Webhook da Evolution API recebeu uma requisição com API Key inválida ou ausente.');
    return res.status(401).json({ error: 'Unauthorized: Invalid or missing API Key' });
  }

  next();
};
