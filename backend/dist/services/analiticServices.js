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
exports.incrementClicks = incrementClicks;
exports.getGeographicData = getGeographicData;
const Url_1 = __importDefault(require("../models/Url"));
const axios_1 = __importDefault(require("axios"));
function incrementClicks(shortCode) {
    return __awaiter(this, void 0, void 0, function* () {
        yield Url_1.default.findOneAndUpdate({ shortCode }, { $inc: { clicks: 1 } });
    });
}
function getGeographicData(ip) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(`https://ipapi.co/${ip}/json/`);
            return {
                country: response.data.country_name,
                city: response.data.city,
                region: response.data.region
            };
        }
        catch (error) {
            console.error('Error fetching geographic data:', error);
            return null;
        }
    });
}
