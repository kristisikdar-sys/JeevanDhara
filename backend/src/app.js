import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/authRoutes.js';
import donorRoutes from './routes/donorRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import driveRoutes from './routes/driveRoutes.js';
import integrationRoutes from './routes/integrationRoutes.js';
import predictRoutes from './routes/predictRoutes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const limiter = rateLimit({
	windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
	max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10)
});
app.use('/api/auth', limiter);
app.use('/api/requests', limiter);

app.get('/health', (req, res) => res.json({ ok: true, service: 'backend', ts: Date.now() }));

app.use('/api/auth', authRoutes);
app.use('/api/donors', donorRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/drives', driveRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/predict', predictRoutes);

export default app;