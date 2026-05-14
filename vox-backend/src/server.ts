import express from 'express';
import dotenv from 'dotenv';
import whatsappRoutes from './routes/whatsapp.routes';
import evolutionRoutes from './routes/evolution.routes';

dotenv.config();

const app = express();
app.use(express.json());

// Rotas do Sistema
app.use('/whatsapp', whatsappRoutes);
app.use('/evolution', evolutionRoutes);

// Endpoint de saúde
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Vox-Backend running on port ${PORT}`);
});
