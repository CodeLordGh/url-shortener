"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.scrapeWebsite = scrapeWebsite;
exports.stopScraping = stopScraping;
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
const Scraping_1 = __importDefault(require("../models/Scraping"));
const mongoose_1 = __importDefault(require("mongoose"));
function scrapeWebsite(userId, url) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`Starting scraping for user ${userId} on URL: ${url}`);
        try {
            // Create a new scraping session
            const scrapingSession = new Scraping_1.default({
                userId: new mongoose_1.default.Types.ObjectId(userId),
                url,
                status: 'in_progress'
            });
            yield scrapingSession.save();
            const response = yield axios_1.default.get(url);
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
            }
            else {
                // If no main section is found, scrape the entire body
                mainContent = $('body').text().trim();
                headings = $('h1, h2, h3').map((i, el) => $(el).text().trim()).get();
            }
            // Update the scraping session with the results
            scrapingSession.pageTitle = pageTitle;
            scrapingSession.mainContent = mainContent;
            scrapingSession.status = 'completed';
            scrapingSession.completedAt = new Date();
            yield scrapingSession.save();
            return {
                message: 'Scraping completed successfully',
                data: { pageTitle, headings, mainContent }
            };
        }
        catch (error) {
            console.error('Error during scraping:', error);
            // Update the scraping session status to 'stopped' in case of an error
            yield Scraping_1.default.findOneAndUpdate({ userId: new mongoose_1.default.Types.ObjectId(userId), status: 'in_progress' }, { status: 'stopped', completedAt: new Date() });
            throw new Error('Failed to scrape the website');
        }
    });
}
function stopScraping(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`Stopping scraping for user ${userId}`);
        try {
            const result = yield Scraping_1.default.findOneAndUpdate({ userId: new mongoose_1.default.Types.ObjectId(userId), status: 'in_progress' }, { status: 'stopped', completedAt: new Date() }, { new: true });
            if (result) {
                return {
                    message: 'Scraping stopped successfully',
                    data: result
                };
            }
            else {
                return {
                    message: 'No active scraping session found for this user'
                };
            }
        }
        catch (error) {
            console.error('Error stopping scraping:', error);
            throw new Error('Failed to stop scraping');
        }
    });
}
