import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';
import { connectDatabase } from './config/database';
import authRoutes from './routes/authRoutes';
import urlRoutes from './routes/urlRoutes';
import aiRoutes from './routes/aiRoutes';
import { authenticateToken } from './middleware/auth';
import Url from './models/Url';
import { redirectToUrl } from './controllers/urlController';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Connect to database
connectDatabase();

// Handle shortened URL redirects at the root level
app.get('/:shortCode', redirectToUrl);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', urlRoutes);
app.use('/api/ai', aiRoutes);

// User-specific routes
app.get('/api/user/urls', authenticateToken, async (req: any, res: any) => {
  try {
    const urls = await Url.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json(urls);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user URLs' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
