export interface Url {
  _id: string;
  originalUrl: string;
  shortCode: string;
  clicks: number;
  aiDescription: string;
  aiTags: string[];
  createdAt: string;
  expiresAt: string | null;
}

export interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
}

export interface AIResponse {
  response: string;
  structured?: {
    type: string;
    shortenedLink: string;
    description: string;
    tags: string[];
    advice?: string[];
  };
}
