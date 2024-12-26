"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const urlController_1 = require("../controllers/urlController");
const router = express_1.default.Router();
// Use the routes as middleware functions
router.post('/shorten', urlController_1.shortenUrl);
router.get('/redirect/:shortCode', urlController_1.redirectToUrl);
router.get('/analytics/:shortCode', urlController_1.getUrlAnalytics);
exports.default = router;
