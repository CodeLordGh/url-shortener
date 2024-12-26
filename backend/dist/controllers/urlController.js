"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUrlAnalytics = exports.redirectToUrl = exports.shortenUrl = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Url_1 = __importDefault(require("../models/Url"));
const urlShortener_1 = require("../utils/urlShortener");
const analiticServices_1 = require("../services/analiticServices");
const aiService_1 = require("../services/aiService");
const schedulerService_1 = require("../services/schedulerService");
const scrapingService_1 = require("../services/scrapingService");
const mongoose_1 = __importDefault(require("mongoose"));
// General user ID for non-authenticated requests
const GENERAL_USER_ID = '676caa3c762bdc94c11e3979';
const shortenUrl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { url } = req.body;
    let userId = null;
    let isAuthenticated = false;
    // Check if the request has a valid token
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token && process.env.JWT_SECRET) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            userId = decoded.userId;
            isAuthenticated = true;
        }
        catch (error) {
            userId = GENERAL_USER_ID;
        }
    }
    else {
        userId = GENERAL_USER_ID;
    }
    if (!url) {
        res.status(400).json({ error: 'URL is required' });
    }
    if (!(0, urlShortener_1.isValidUrl)(url)) {
        res.status(400).json({ error: 'Invalid URL' });
    }
    try {
        // First, check if URL exists for general user
        const existingGeneralUrl = yield Url_1.default.findOne({
            originalUrl: url,
            userId: GENERAL_USER_ID
        });
        // If authenticated user, also check for their specific URL
        const existingUserUrl = isAuthenticated ?
            yield Url_1.default.findOne({
                originalUrl: url,
                userId: new mongoose_1.default.Types.ObjectId(userId)
            }) : null;
        // Return existing URL if found
        if (existingUserUrl || existingGeneralUrl) {
            const existingUrl = existingUserUrl || existingGeneralUrl;
            // Add null check to satisfy TypeScript
            if (!existingUrl) {
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            const shortUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/${existingUrl.shortCode}`;
            const analyticsUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/api/analytics/${existingUrl.shortCode}`;
            res.json({
                shortUrl,
                analyticsUrl,
                isAuthenticated,
                expiresAt: existingUrl.expiresAt
            });
            return;
        }
        const shortCode = (0, urlShortener_1.generateShortCode)();
        // Different handling for authenticated vs non-authenticated users
        if (isAuthenticated) {
            // Full process for authenticated users
            let aiDescription = '';
            let aiTags = [];
            try {
                const scrapingResult = yield (0, scrapingService_1.scrapeWebsite)(userId, url);
                aiDescription = yield (0, aiService_1.generateAIDescription)(url, scrapingResult.data.mainContent);
                aiTags = yield (0, aiService_1.generateAITags)(url, scrapingResult.data.mainContent);
            }
            catch (error) {
                console.error('Error during content analysis:', error);
            }
            const newUrl = new Url_1.default({
                originalUrl: url,
                shortCode,
                userId: new mongoose_1.default.Types.ObjectId(userId),
                aiDescription: aiDescription || 'No description available',
                aiTags: aiTags.length > 0 ? aiTags : ['untagged'],
                expiresAt: null,
                createdAt: new Date()
            });
            yield newUrl.save();
            const shortUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/${shortCode}`;
            const analyticsUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/api/analytics/${shortCode}`;
            res.json({
                shortUrl,
                analyticsUrl,
                isAuthenticated: true,
                expiresAt: null
            });
            return;
        }
        else {
            // Simplified process for non-authenticated users
            const newUrl = new Url_1.default({
                originalUrl: url,
                shortCode,
                userId: new mongoose_1.default.Types.ObjectId(GENERAL_USER_ID),
                aiDescription: 'No description available',
                aiTags: ['untagged'],
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days expiration
                createdAt: new Date()
            });
            yield newUrl.save();
            // Schedule deletion for non-authenticated users' URLs
            try {
                yield (0, schedulerService_1.scheduleUrlDeletion)(newUrl._id, 30 * 24 * 60 * 60 * 1000);
                console.log('URL deletion scheduled');
            }
            catch (schedulerError) {
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
            return;
        }
    }
    catch (error) {
        console.error('Error creating shortened URL:', error);
        if (!isAuthenticated) {
            console.error('Error occurred for non-authenticated user request:', {
                originalUrl: url,
                timestamp: new Date().toISOString(),
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
        res.status(500).json({ error: 'Error creating shortened URL' });
        return;
    }
});
exports.shortenUrl = shortenUrl;
const redirectToUrl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { shortCode } = req.params;
    console.log('Redirecting shortCode:', shortCode);
    try {
        // Find URL regardless of userId (handles both authenticated and anonymous URLs)
        const url = yield Url_1.default.findOne({ shortCode }).lean();
        if (!url) {
            console.log('URL not found for shortCode:', shortCode);
            res.status(404).send('URL not found');
            return;
        }
        // Check if URL has expired
        if (url.expiresAt && new Date(url.expiresAt) < new Date()) {
            console.log('URL has expired. Expiry date:', url.expiresAt);
            yield Url_1.default.deleteOne({ _id: url._id });
            res.status(404).send('URL has expired');
            return;
        }
        // Increment clicks asynchronously to not delay the redirect
        Promise.all([
            (0, analiticServices_1.incrementClicks)(shortCode),
            (0, analiticServices_1.getGeographicData)(req.ip || '')
        ]).catch(error => {
            console.error('Error updating analytics:', error);
        });
        res.redirect(url.originalUrl);
    }
    catch (error) {
        console.error('Error redirecting to URL:', error);
        res.status(500).send('Error redirecting to URL');
    }
});
exports.redirectToUrl = redirectToUrl;
const getUrlAnalytics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { shortCode } = req.params;
    try {
        const url = yield Url_1.default.findOne({ shortCode });
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
    }
    catch (error) {
        console.error('Error fetching URL analytics:', error);
        res.status(500).json({ error: 'Error fetching URL analytics' });
    }
});
exports.getUrlAnalytics = getUrlAnalytics;
