import mongoose, { Document, Schema } from 'mongoose';

export interface IConversation extends Document {
  userId: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  lastUpdated: Date;
}

const ConversationSchema: Schema = new Schema({
  userId: { type: String, required: true, unique: true },
  messages: [{
    role: { type: String, enum: ['system', 'user', 'assistant'], required: true },
    content: { type: String, required: true }
  }],
  lastUpdated: { type: Date, default: Date.now }
});

export default mongoose.model<IConversation>('Conversation', ConversationSchema);
