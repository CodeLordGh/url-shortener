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
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const aiService_1 = require("../services/aiService");
const Url_1 = __importDefault(require("../models/Url"));
const urlShortener_1 = require("../utils/urlShortener");
const scrapingService_1 = require("../services/scrapingService"); // You'll need to create this service
const router = express_1.default.Router();
router.post('/chat', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { message } = req.body;
        const userId = req.user.userId;
        if (message.startsWith('/')) {
            const [command, ...args] = message.split(' ');
            let result;
            switch (command) {
                case '/add':
                    result = yield handleAddCommand(userId, args[0]);
                    break;
                case '/delete':
                    result = yield handleDeleteCommand(userId, args[0]);
                    break;
                case '/list':
                    result = yield handleListCommand(userId);
                    break;
                case '/scrap':
                    result = yield handleStartScrapCommand(userId, args[0]);
                    break;
                default:
                    result = { success: false, message: 'Unknown command' };
            }
            // Generate AI response based on the command result
            const aiResponse = yield (0, aiService_1.handleAIChat)(userId, `Command result: ${JSON.stringify(result)}`);
            res.json(aiResponse);
        }
        else {
            // If it's not a command, process it as a regular chat message
            const response = yield (0, aiService_1.handleAIChat)(userId, message);
            res.json(response);
        }
    }
    catch (error) {
        console.error('Error in AI chat:', error);
        res.status(500).json({ error: 'Error processing AI chat request' });
    }
}));
function handleAddCommand(userId, url) {
    return __awaiter(this, void 0, void 0, function* () {
        const scrapingSession = (yield (0, scrapingService_1.scrapeWebsite)(userId, url)).data.mainContent;
        try {
            const shortCode = (0, urlShortener_1.generateShortCode)();
            const aiDescription = yield (0, aiService_1.generateAIDescription)(url, scrapingSession);
            const aiTags = yield (0, aiService_1.generateAITags)(url, scrapingSession);
            const advice = yield (0, aiService_1.generateAdvice)(url);
            const newUrl = new Url_1.default({
                userId,
                originalUrl: url,
                shortCode,
                aiDescription,
                aiTags
            });
            yield newUrl.save();
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
        }
        catch (error) {
            console.error('Error adding new link:', error);
            return { success: false, message: 'Error adding new link' };
        }
    });
}
function handleDeleteCommand(userId, shortCode) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield Url_1.default.findOneAndDelete({ shortCode, userId });
            if (result) {
                return { success: true, message: `Link with short code ${shortCode} has been deleted.` };
            }
            else {
                return { success: false, message: `No link found with short code ${shortCode}.` };
            }
        }
        catch (error) {
            console.error('Error deleting link:', error);
            return { success: false, message: 'Error deleting link' };
        }
    });
}
function handleListCommand(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const urls = yield Url_1.default.find({ userId }).sort({ createdAt: -1 });
            return {
                success: true,
                message: 'Links retrieved successfully',
                data: {
                    type: urls.length > 0 ? 'url_list' : 'no_links',
                    urls: urls
                }
            };
        }
        catch (error) {
            console.error('Error fetching user URLs:', error);
            return { success: false, message: 'Error fetching user URLs' };
        }
    });
}
function handleStartScrapCommand(userId, url) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield (0, scrapingService_1.scrapeWebsite)(userId, url);
            return { success: true, message: 'Scraping started', data: result };
        }
        catch (error) {
            console.error('Error starting scraping:', error);
            return { success: false, message: 'Error starting scraping' };
        }
    });
}
exports.default = router;
