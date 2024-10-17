import mongoose from 'mongoose';

const urlSchema = new mongoose.Schema({
  originalUrl: { type: String, required: true },
  shortCode: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  clicks: { type: Number, default: 0 },
  aiDescription: { type: String },
  aiTags: [{ type: String }],
  expiresAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Url', urlSchema);
