import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import Url from '../models/Url';
import { generateShortCode, isValidUrl } from '../utils/urlShortener';
import { incrementClicks, getGeographicData } from '../services/analiticServices';
import { generateAIDescription, generateAITags } from '../services/aiService';
import { scheduleUrlDeletion } from '../services/schedulerService';
import { scrapeWebsite } from '../services/scrapingService';
import mongoose from 'mongoose';

// General user ID for non-authenticated requests
const GENERAL_USER_ID = '676caa3c762bdc94c11e3979';

export const shortenUrl = async (req: Request, res: Response) => {
  const { url } = req.body;
  let userId: string | null = null;
  let isAuthenticated = false;

  // Check if the request has a valid token
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token && process.env.JWT_SECRET) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: string };
      userId = decoded.userId;
      isAuthenticated = true;
    } catch (error) {
      userId = GENERAL_USER_ID;
    }
  } else {
    userId = GENERAL_USER_ID;
  }

  if (!url) {
    res.status(400).json({ error: 'URL is required' });
  }

  if (!isValidUrl(url)) {
    res.status(400).json({ error: 'Invalid URL' });
  }

  try {

    // First, check if URL exists for general user
    const existingGeneralUrl = await Url.findOne({ 
      originalUrl: url,
      userId: GENERAL_USER_ID
    });

    // If authenticated user, also check for their specific URL
    const existingUserUrl = isAuthenticated ? 
      await Url.findOne({ 
        originalUrl: url,
        userId: new mongoose.Types.ObjectId(userId)
      }) : null;

    // Return existing URL if found
    if (existingUserUrl || existingGeneralUrl) {
      const existingUrl = existingUserUrl || existingGeneralUrl;
      
      // Add null check to satisfy TypeScript
      if (!existingUrl) {
        res.status(500).json({ error: 'Internal server error' });
        return
      }

      const shortUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/${existingUrl.shortCode}`;
      const analyticsUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/api/analytics/${existingUrl.shortCode}`;
      
      res.json({
        shortUrl,
        analyticsUrl,
        isAuthenticated,
        expiresAt: existingUrl.expiresAt
      });
      return
    }

    const shortCode = generateShortCode();

    // Different handling for authenticated vs non-authenticated users
    if (isAuthenticated) {
      // Full process for authenticated users
      let aiDescription = '';
      let aiTags: string[] = [];

      try {
        const scrapingResult = await scrapeWebsite(userId, url);
        aiDescription = await generateAIDescription(url, scrapingResult.data.mainContent);
        aiTags = await generateAITags(url, scrapingResult.data.mainContent);
      } catch (error) {
        console.error('Error during content analysis:', error);
      }

      const newUrl = new Url({
        originalUrl: url,
        shortCode,
        userId: new mongoose.Types.ObjectId(userId),
        aiDescription: aiDescription || 'No description available',
        aiTags: aiTags.length > 0 ? aiTags : ['untagged'],
        expiresAt: null,
        createdAt: new Date()
      });

      await newUrl.save();

      const shortUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/${shortCode}`;
      const analyticsUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/api/analytics/${shortCode}`;

       res.json({
        shortUrl,
        analyticsUrl,
        isAuthenticated: true,
        expiresAt: null
      });
      return

    } else {
      // Simplified process for non-authenticated users
      const newUrl = new Url({
        originalUrl: url,
        shortCode,
        userId: new mongoose.Types.ObjectId(GENERAL_USER_ID),
        aiDescription: 'No description available',
        aiTags: ['untagged'],
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days expiration
        createdAt: new Date()
      });

      await newUrl.save();

      // Schedule deletion for non-authenticated users' URLs
      try {
        await scheduleUrlDeletion(newUrl._id, 30 * 24 * 60 * 60 * 1000);
        console.log('URL deletion scheduled');
      } catch (schedulerError) {
        console.error('Failed to schedule URL deletion:', schedulerError);
      }

      const shortUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/${shortCode}`;
      const analyticsUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/api/analytics/${shortCode}`;

      res.json({
        shortUrl,
        analyticsUrl,
        isAuthenticated: false,
        expiresAt: newUrl.expiresAt
      });
      return
    }

  } catch (error) {
    console.error('Error creating shortened URL:', error);
    if (!isAuthenticated) {
      console.error('Error occurred for non-authenticated user request:', {
        originalUrl: url,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
     res.status(500).json({ error: 'Error creating shortened URL' });
     return
  }
};

export const redirectToUrl = async (req: Request, res: Response) => {
  const { shortCode } = req.params;
  console.log('Redirecting shortCode:', shortCode);
  
  try {
    // Find URL regardless of userId (handles both authenticated and anonymous URLs)
    const url = await Url.findOne({ shortCode }).lean();

    if (!url) {
      console.log('URL not found for shortCode:', shortCode);
      res.status(404).send('URL not found');
      return;
    }

    // Check if URL has expired
    if (url.expiresAt && new Date(url.expiresAt) < new Date()) {
      console.log('URL has expired. Expiry date:', url.expiresAt);
      await Url.deleteOne({ _id: url._id });
      res.status(404).send('URL has expired');
      return;
    }


    // Increment clicks asynchronously to not delay the redirect
    Promise.all([
      incrementClicks(shortCode),
      getGeographicData(req.ip || '')
    ]).catch(error => {
      console.error('Error updating analytics:', error);
    });

    res.redirect(url.originalUrl);
  } catch (error) {
    console.error('Error redirecting to URL:', error);
    res.status(500).send('Error redirecting to URL');
  }
};

export const getUrlAnalytics = async (req: Request, res: Response) => {
  const { shortCode } = req.params;
  try {
    const url = await Url.findOne({ shortCode });

    if (!url) {
      res.status(404).json({ error: 'URL not found' });
      return;
    }

    res.json({
      originalUrl: url.originalUrl,
      shortCode: url.shortCode,
      clicks: url.clicks,
      createdAt: url.createdAt,
      aiDescription: url.aiDescription,
      aiTags: url.aiTags
    });
  } catch (error) {
    console.error('Error fetching URL analytics:', error);
    res.status(500).json({ error: 'Error fetching URL analytics' });
  }
};
