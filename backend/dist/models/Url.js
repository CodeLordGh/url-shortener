"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const urlSchema = new mongoose_1.default.Schema({
    originalUrl: { type: String, required: true },
    shortCode: { type: String, required: true, unique: true },
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: false },
    clicks: { type: Number, default: 0 },
    aiDescription: { type: String },
    aiTags: [{ type: String }],
    expiresAt: { type: Date },
    createdAt: { type: Date, default: Date.now }
});
exports.default = mongoose_1.default.model('Url', urlSchema);
