import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { handleAIChat, generateAIDescription, generateAITags, generateAdvice } from '../services/aiService';
import Url from '../models/Url';
import { generateShortCode } from '../utils/urlShortener';
import { scrapeWebsite } from '../services/scrapingService'; // You'll need to create this service

const router = express.Router();

router.post('/chat', authenticateToken, async (req:any, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.userId;

    if (message.startsWith('/')) {
      const [command, ...args] = message.split(' ');
      let result;

      switch (command) {
        case '/add':
          result = await handleAddCommand(userId, args[0]);
          break;
        case '/delete':
          result = await handleDeleteCommand(userId, args[0]);
          break;
        case '/list':
          result = await handleListCommand(userId);
          break;
        case '/scrap':
          result = await handleStartScrapCommand(userId, args[0]);
          break;
        default:
          result = { success: false, message: 'Unknown command' };
      }

      // Generate AI response based on the command result
      const aiResponse = await handleAIChat(userId, `Command result: ${JSON.stringify(result)}`);
      res.json(aiResponse);
    } else {
      // If it's not a command, process it as a regular chat message
      const response = await handleAIChat(userId, message);
      res.json(response);
    }
  } catch (error) {
    console.error('Error in AI chat:', error);
    res.status(500).json({ error: 'Error processing AI chat request' });
  }
});



async function handleAddCommand(userId: string, url: string) {
  const scrapingSession = (await scrapeWebsite(userId as any, url)).data.mainContent;
  try {
    const shortCode = generateShortCode();
    const aiDescription = await generateAIDescription(url, scrapingSession);
    const aiTags = await generateAITags(url, scrapingSession);
    const advice = await generateAdvice(url);

    const newUrl = new Url({
      userId,
      originalUrl: url,
      shortCode,
      aiDescription,
      aiTags
    });

    await newUrl.save();

    return {
      success: true,
      message: 'New link added successfully',
      data: {
        type: 'new_link',
        shortenedLink: `http://localhost:3000/${shortCode}`,
        description: aiDescription,
        tags: aiTags,
        advice: advice
      }
    };
  } catch (error) {
    console.error('Error adding new link:', error);
    return { success: false, message: 'Error adding new link' };
  }
}

async function handleDeleteCommand(userId: string, shortCode: string) {
  try {
    const result = await Url.findOneAndDelete({ shortCode, userId });
    if (result) {
      return { success: true, message: `Link with short code ${shortCode} has been deleted.` };
    } else {
      return { success: false, message: `No link found with short code ${shortCode}.` };
    }
  } catch (error) {
    console.error('Error deleting link:', error);
    return { success: false, message: 'Error deleting link' };
  }
}

async function handleListCommand(userId: string) {
  try {
    const urls = await Url.find({ userId }).sort({ createdAt: -1 });
    return {
      success: true,
      message: 'Links retrieved successfully',
      data: {
        type: urls.length > 0 ? 'url_list' : 'no_links',
        urls: urls
      }
    };
  } catch (error) {
    console.error('Error fetching user URLs:', error);
    return { success: false, message: 'Error fetching user URLs' };
  }
}

async function handleStartScrapCommand(userId: string, url: string) {
  try {
    const result = await scrapeWebsite(userId, url);
    return { success: true, message: 'Scraping started', data: result };
  } catch (error) {
    console.error('Error starting scraping:', error);
    return { success: false, message: 'Error starting scraping' };
  }
}


export default router;
