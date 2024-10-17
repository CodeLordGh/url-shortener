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
exports.generateAIDescription = generateAIDescription;
exports.generateAITags = generateAITags;
exports.generateAdvice = generateAdvice;
exports.handleAIChat = handleAIChat;
const axios_1 = __importDefault(require("axios"));
const Url_1 = __importDefault(require("../models/Url"));
function fetchWebsiteContent(url) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(url);
            return response.data;
        }
        catch (error) {
            console.error('Error fetching website content:', error);
            return '';
        }
    });
}
function generateAIDescription(url, scrapedContent) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("generateAIDescription");
        try {
            if (!scrapedContent) {
                return 'Unable to generate description due to content retrieval issues.';
            }
            const response = yield axios_1.default.post('https://openrouter.ai/api/v1/chat/completions', {
                model: 'openai/gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: 'You are a helpful assistant that generates brief descriptions of websites.' },
                    { role: 'user', content: `Generate a brief description of the following website content: ${scrapedContent.substring(0, 1000)}` }
                ]
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });
            const generatedDescription = response.data.choices[0].message.content.trim();
            return generatedDescription || 'No description available';
        }
        catch (error) {
            console.error('Error generating AI description:', error);
            return 'Unable to generate description at this time.';
        }
    });
}
function generateAITags(url, scrapedContent) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("generateAITags");
        try {
            if (!scrapedContent) {
                return ['Unable to generate tags'];
            }
            const response = yield axios_1.default.post('https://openrouter.ai/api/v1/chat/completions', {
                model: 'openai/gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: 'You are a helpful assistant that generates relevant tags for websites.' },
                    { role: 'user', content: `Generate 5 relevant tags for the following website content. Respond with only the tags, separated by commas: ${scrapedContent.substring(0, 1000)}` }
                ]
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });
            const tags = response.data.choices[0].message.content.split(',').map((tag) => tag.trim());
            return tags.length > 0 ? tags : ['No tags available'];
        }
        catch (error) {
            console.error('Error generating AI tags:', error);
            return ['Unable to generate tags'];
        }
    });
}
function generateAdvice(url) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.post('https://openrouter.ai/api/v1/chat/completions', {
                model: 'openai/gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: 'You are a helpful assistant that provides advice on increasing clicks for shortened URLs.' },
                    { role: 'user', content: `Provide 3 to 5 brief pieces of advice to increase clicks for this URL: ${url}` }
                ]
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });
            const advice = response.data.choices[0].message.content
                .split('\n')
                .filter((item) => item.trim() !== '')
                .map((item) => item.replace(/^\d+\.\s*/, '').trim());
            return advice.slice(0, 3); // Ensure we only return up to 3 pieces of advice
        }
        catch (error) {
            console.error('Error generating advice:', error);
            return 'Unable to generate advice at this time.';
        }
    });
}
function handleAIChat(userId, message) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Handling AI chat for user:", userId);
        try {
            // Fetch user's URLs
            const userUrls = yield Url_1.default.find({ userId });
            // Check if the message is a command result
            const isCommandResult = message.startsWith('Command result:');
            let commandResult;
            if (isCommandResult) {
                commandResult = JSON.parse(message.replace('Command result:', '').trim());
            }
            // Prepare messages for AI request
            const aiMessages = [
                {
                    role: 'system',
                    content: `You are an AI assistant that helps users manage their shortened URLs. 
                  The user has ${userUrls} links. 
                  You can provide information about links and suggest actions.
                  Users can delete links with /delete [shortCode], add new links with /add [url], list their links with /list, start scraping with /startscrap [url], and stop scraping with /stopscrap.`
                },
                {
                    role: 'user',
                    content: isCommandResult
                        ? `The user executed a command. Here's the result: ${JSON.stringify(commandResult)}`
                        : message
                }
            ];
            const response = yield axios_1.default.post('https://openrouter.ai/api/v1/chat/completions', {
                model: 'openai/gpt-3.5-turbo',
                messages: aiMessages
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });
            const aiResponse = response.data.choices[0].message.content.trim();
            if (isCommandResult && commandResult.success && commandResult.data) {
                return {
                    response: aiResponse,
                    structured: commandResult.data
                };
            }
            return { response: aiResponse };
        }
        catch (error) {
            console.error('Error in AI chat:', error);
            return { response: 'Sorry, I encountered an error while processing your request.' };
        }
    });
}
