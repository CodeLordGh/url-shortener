import axios from 'axios';
import * as cheerio from 'cheerio';
import Scraping from '../models/Scraping';
import mongoose from 'mongoose';

export async function scrapeWebsite(userId: string, url: string) {
  console.log(`Starting scraping for user ${userId} on URL: ${url}`);
  try {
    // Create a new scraping session
    const scrapingSession = new Scraping({
      userId: new mongoose.Types.ObjectId(userId),
      url,
      status: 'in_progress'
    });
    await scrapingSession.save();

    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    
    // Get the page title
    const pageTitle = $('title').text().trim();

    // Try to find the main content area
    const mainSelector = 'main, #main, .main, [role="main"]';
    const $main = $(mainSelector);
    
    let mainContent, headings;
    
    if ($main.length > 0) {
      // If a main section is found, scrape within it
      mainContent = $main.text().trim();
      headings = $main.find('h1, h2, h3').map((i, el) => $(el).text().trim()).get();
    } else {
      // If no main section is found, scrape the entire body
      mainContent = $('body').text().trim();
      headings = $('h1, h2, h3').map((i, el) => $(el).text().trim()).get();
    }
    
    // Update the scraping session with the results
    scrapingSession.pageTitle = pageTitle as any;
    scrapingSession.mainContent = mainContent;
    scrapingSession.status = 'completed';
    scrapingSession.completedAt = new Date();
    await scrapingSession.save();

    return {
      message: 'Scraping completed successfully',
      data: { pageTitle, headings, mainContent }
    };
  } catch (error) {
    console.error('Error during scraping:', error);
    // Update the scraping session status to 'stopped' in case of an error
    await Scraping.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(userId), status: 'in_progress' },
      { status: 'stopped', completedAt: new Date() }
    );
    throw new Error('Failed to scrape the website');
  }
}

export async function stopScraping(userId: string) {
  console.log(`Stopping scraping for user ${userId}`);
  try {
    const result = await Scraping.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(userId), status: 'in_progress' },
      { status: 'stopped', completedAt: new Date() },
      { new: true }
    );

    if (result) {
      return {
        message: 'Scraping stopped successfully',
        data: result
      };
    } else {
      return {
        message: 'No active scraping session found for this user'
      };
    }
  } catch (error) {
    console.error('Error stopping scraping:', error);
    throw new Error('Failed to stop scraping');
  }
}
