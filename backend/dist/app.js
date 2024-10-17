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
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const Url_1 = __importDefault(require("./models/Url"));
const User_1 = __importDefault(require("./models/User"));
const urlShortener_1 = require("./utils/urlShortener");
const analiticServices_1 = require("./services/analiticServices");
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_1 = require("./middleware/auth");
const aiService_1 = require("./services/aiService");
const schedulerService_1 = require("./services/schedulerService");
const aiRoutes_1 = __importDefault(require("./routes/aiRoutes"));
const scrapingService_1 = require("./services/scrapingService");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.static('public'));
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});
mongoose_1.default.connect(process.env.MONGODB_URI || '');
app.use('/api/ai', aiRoutes_1.default);
app.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const user = new User_1.default({ username, password: hashedPassword });
        yield user.save();
        res.status(201).json({ message: 'User registered successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Error registering user' });
    }
}));
app.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        console.log('Login attempt for username:', username);
        const user = yield User_1.default.findOne({ username });
        if (!user) {
            console.log('User not found:', username);
            return res.status(400).json({ error: 'User not found' });
        }
        const validPassword = yield bcrypt_1.default.compare(password, user.password);
        if (!validPassword) {
            console.log('Invalid password for user:', username);
            return res.status(400).json({ error: 'Invalid password' });
        }
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new Error('JWT_SECRET is not set in the environment variables');
        }
        const token = jsonwebtoken_1.default.sign({ userId: user._id }, jwtSecret);
        console.log('Login successful for user:', username);
        res.json({ token });
    }
    catch (error) {
        console.error('Error in login route:', error);
        res.status(500).json({ error: 'Error logging in', details: error.message });
    }
}));
app.post('/shorten', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Received POST request to /shorten');
    console.log('Request body:', req.body);
    const { url } = req.body;
    let userId = null;
    // Check if the request has a valid token
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            userId = decoded.userId;
        }
        catch (error) {
            console.error('Invalid token:', error);
        }
    }
    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }
    if (!(0, urlShortener_1.isValidUrl)(url)) {
        return res.status(400).json({ error: 'Invalid URL' });
    }
    // Check if a shortened link already exists for this URL
    const existingUrl = yield Url_1.default.findOne({ originalUrl: url, userId });
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
    const scrapingSession = (yield (0, scrapingService_1.scrapeWebsite)(userId, url)).data.mainContent;
    const shortCode = (0, urlShortener_1.generateShortCode)();
    const aiDescription = yield (0, aiService_1.generateAIDescription)(url, scrapingSession);
    const aiTags = yield (0, aiService_1.generateAITags)(url, scrapingSession);
    const newUrl = new Url_1.default({
        originalUrl: url,
        shortCode,
        userId,
        aiDescription: aiDescription || undefined,
        aiTags: aiTags.length > 0 ? aiTags : undefined,
        expiresAt: userId ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now for anonymous users
    });
    yield newUrl.save();
    if (!userId) {
        (0, schedulerService_1.scheduleUrlDeletion)(newUrl._id, 30 * 24 * 60 * 60 * 1000); // Schedule deletion after 30 days for anonymous users
    }
    const shortUrl = `${process.env.BASE_URL}/${shortCode}`;
    const analyticsUrl = `${process.env.BASE_URL}/analytics/${shortCode}`;
    res.json({
        shortUrl,
        analyticsUrl,
        isAuthenticated: !!userId,
        expiresAt: newUrl.expiresAt
    });
}));
app.get('/:shortCode', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { shortCode } = req.params;
    const url = yield Url_1.default.findOne({ shortCode });
    if (!url) {
        return res.status(404).send('URL not found');
    }
    yield (0, analiticServices_1.incrementClicks)(shortCode);
    const geoData = yield (0, analiticServices_1.getGeographicData)(req.ip);
    res.redirect(url.originalUrl);
}));
app.get('/analytics/:shortCode', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { shortCode } = req.params;
    const url = yield Url_1.default.findOne({ shortCode });
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
}));
app.get('/user/urls', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const urls = yield Url_1.default.find({ userId: req.user.userId }).sort({ createdAt: -1 });
        res.json(urls);
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching user URLs' });
    }
}));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
exports.default = app;
