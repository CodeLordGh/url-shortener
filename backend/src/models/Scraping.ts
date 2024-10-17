import mongoose, { Document, Schema } from 'mongoose';

interface IScraping extends Document {
  userId: mongoose.Types.ObjectId;
  url: string;
  status: 'in_progress' | 'completed' | 'stopped';
  pageTitle: string[];
  mainContent: string;
  startedAt: Date;
  completedAt?: Date;
}

const scrapingSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  url: { type: String, required: true },
  status: { type: String, enum: ['in_progress', 'completed', 'stopped'], default: 'in_progress' },
  pageTitle: [{ type: String }],
  mainContent: { type: String },
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
});

export default mongoose.model<IScraping>('Scraping', scrapingSchema);
