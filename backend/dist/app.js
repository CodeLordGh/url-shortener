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
const dotenv_1 = __importDefault(require("dotenv"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const database_1 = require("./config/database");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const urlRoutes_1 = __importDefault(require("./routes/urlRoutes"));
const aiRoutes_1 = __importDefault(require("./routes/aiRoutes"));
const auth_1 = require("./middleware/auth");
const Url_1 = __importDefault(require("./models/Url"));
const urlController_1 = require("./controllers/urlController");
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.static('public'));
// Request logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});
// Connect to database
(0, database_1.connectDatabase)();
// Handle shortened URL redirects at the root level
app.get('/:shortCode', urlController_1.redirectToUrl);
// Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api', urlRoutes_1.default);
app.use('/api/ai', aiRoutes_1.default);
// User-specific routes
app.get('/api/user/urls', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
