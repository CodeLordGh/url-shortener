import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Url from './models/Url';
import User from './models/User';
import { generateShortCode, isValidUrl } from './utils/urlShortener';
import { incrementClicks, getGeographicData } from './services/analiticServices';
import { Request, Response } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authenticateToken } from './middleware/auth';
import { generateAIDescription, generateAITags } from './services/aiService';
import { scheduleUrlDeletion } from './services/schedulerService';
import aiRoutes from './routes/aiRoutes';
import { scrapeWebsite } from './services/scrapingService';

dotenv.config();

const app = express();
app.use(cors())
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Add this near the top of your file, after other middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

mongoose.connect(process.env.MONGODB_URI || '');

app.use('/api/ai', aiRoutes);
app.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error registering user' });
  }
});

app.post('/login', async (req: any, res: any) => {
  try {
    const { username, password } = req.body;
    console.log('Login attempt for username:', username);

    const user = await User.findOne({ username });
    if (!user) {
      console.log('User not found:', username);
      return res.status(400).json({ error: 'User not found' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      console.log('Invalid password for user:', username);
      return res.status(400).json({ error: 'Invalid password' });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not set in the environment variables');
    }

    const token = jwt.sign({ userId: user._id }, jwtSecret);
    console.log('Login successful for user:', username);
    res.json({ token });
  } catch (error) {
    console.error('Error in login route:', error);
    res.status(500).json({ error: 'Error logging in', details: (error as Error).message });
  }
});

app.post('/shorten', async (req: any, res: any) => {
  console.log('Received POST request to /shorten');
  console.log('Request body:', req.body);

  const { url } = req.body;
  let userId = null;

  // Check if the request has a valid token
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
      userId = decoded.userId;
    } catch (error) {
      console.error('Invalid token:', error);
    }
  }

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  if (!isValidUrl(url)) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  // Check if a shortened link already exists for this URL
  const existingUrl = await Url.findOne({ originalUrl: url, userId });

  if (existingUrl) {
    const shortUrl = `${process.env.BASE_URL}/${existingUrl.shortCode}`;
    const analyticsUrl = `${process.env.BASE_URL}/analytics/${existingUrl.shortCode}`;
    return res.json({
      message: 'This URL has already been shortened',
      shortUrl,
      analyticsUrl,
      isAuthenticated: !!userId,
      expiresAt: existingUrl.expiresAt
    });
  }

  const scrapingSession = (await scrapeWebsite(userId as any, url)).data.mainContent;

  const shortCode = generateShortCode();
  const aiDescription = await generateAIDescription(url, scrapingSession);
  const aiTags = await generateAITags(url, scrapingSession);
  
  const newUrl = new Url({
    originalUrl: url,
    shortCode,
    userId,
    aiDescription: aiDescription || undefined,
    aiTags: aiTags.length > 0 ? aiTags : undefined,
    expiresAt: userId ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now for anonymous users
  });
  
  await newUrl.save();

  if (!userId) {
    scheduleUrlDeletion(newUrl._id, 30 * 24 * 60 * 60 * 1000); // Schedule deletion after 30 days for anonymous users
  }

  const shortUrl = `${process.env.BASE_URL}/${shortCode}`;
  const analyticsUrl = `${process.env.BASE_URL}/analytics/${shortCode}`;

  res.json({ 
    shortUrl, 
    analyticsUrl, 
    isAuthenticated: !!userId,
    expiresAt: newUrl.expiresAt
  });
});

app.get('/:shortCode', async (req: any, res: any) => {
  const { shortCode } = req.params;
  const url = await Url.findOne({ shortCode });

  if (!url) {
    return res.status(404).send('URL not found');
  }

  await incrementClicks(shortCode);
  const geoData = await getGeographicData(req.ip);

  res.redirect(url.originalUrl);
});

app.get('/analytics/:shortCode', async (req:any, res:any) => {
  const { shortCode } = req.params;
  const url = await Url.findOne({ shortCode });

  if (!url) {
    return res.status(404).json({ error: 'URL not found' });
  }

  res.json({
    originalUrl: url.originalUrl,
    shortCode: url.shortCode,
    shortUrl: `${process.env.BASE_URL}/${url.shortCode}`,
    clicks: url.clicks,
    createdAt: url.createdAt
  });
});

app.get('/user/urls', authenticateToken, async (req: any, res: any) => {
  try {
    const urls = await Url.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json(urls);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user URLs' });
  }
});

// // Add this new route near the other authenticated routes
// app.post('/ai-chat', authenticateToken, async (req: any, res: any) => {
//   try {
//     const { message } = req.body;
//     const response = await handleAIChat(req.user.userId, message);
//     console.log('AI Chat Response:', response); // Add this line
//     res.json(response);
//   } catch (error) {
//     console.error('Error in AI chat:', error);
//     res.status(500).json({ error: 'Error processing AI chat request' });
//   }
// });

// app.post('/ai-action', authenticateToken, async (req: any, res: any) => {
//   try {
//     const { action, data } = req.body;
//     const response = await performAction(req.user.userId, action, data);
//     res.json({ response });
//   } catch (error) {
//     console.error('Error performing AI action:', error);
//     res.status(500).json({ error: 'Error performing AI action' });
//   }
// });

// Add this at the end of your file, before starting the server
// app.use((req: Request, res: Response) => {
//   res.status(404).json({ error: 'Not Found' });
// });

// app.use((err: Error, req: Request, res: Response, next: Function) => {
//   console.error(err.stack);
//   res.status(500).json({ error: 'Internal Server Error' });
// });

// app.use('/api/ai', aiRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
