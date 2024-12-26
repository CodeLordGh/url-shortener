# URL Shortener Backend

## Introduction

This is the backend for a powerful URL shortener application. It provides a robust API for shortening URLs, managing user accounts, and offering AI-powered features for link management and analysis.

## Tech Stack

- Node.js 18+ with Express.js
- TypeScript for type safety
- MongoDB with Mongoose ODM
- JWT for secure authentication
- OpenAI GPT for AI features
- Cheerio for web scraping
- Jest for testing

## Features

- URL shortening
- User authentication
- AI-powered link descriptions and tags
- Web scraping capabilities
- Analytics for shortened links
- Conversation management with AI

## Project Structure

backend/
├── src/
│ ├── models/
│ ├── routes/
│ ├── services/
│ ├── middleware/
│ ├── utils/
│ ├── types/
│ └── app.ts
├── package.json
└── tsconfig.json

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables (see [Configuration](#-configuration))
4. Start the development server:
   ```bash
   npm run dev
   ```

## Configuration

Create a `.env` file in the root directory with the following variables:

```bash
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
OPENROUTER_API_KEY=your_openrouter_api_key
BASE_URL=http://localhost:3000
PORT=3000
```

## API Endpoints

### Authentication
- `POST /api/auth/register`
  - Register new user
  - Body: `{ username: string, password: string }`
  - Returns: `{ token: string, user: UserType }`

- `POST /api/auth/login`
  - Authenticate user
  - Body: `{ username: string, password: string }`
  - Returns: `{ token: string, user: UserType }`

### URL Management
- `POST /api/shorten`
  - Create shortened URL
  - Auth: Optional
  - Body: `{ url: string, expiresAt?: Date }`
  - Returns: `{ shortUrl: string, originalUrl: string }`

- `GET /api/user/urls`
  - Get user's URLs
  - Auth: Required
  - Returns: `Array<UrlType>`

- `DELETE /api/urls/:shortCode`
  - Delete shortened URL
  - Auth: Required
  - Returns: `{ success: boolean }`

### AI Features
- `POST /api/ai/chat`
  - Interact with AI assistant
  - Auth: Required
  - Body: `{ message: string }`
  - Returns: `{ response: string, suggestedCommand?: string }`

### Analytics
- `GET /api/analytics/:shortCode`
  - Get URL analytics
  - Auth: Required for detailed stats
  - Returns: `{ clicks: number, locations: Array<Location> }`

## Security Measures

### Authentication
- JWT tokens with expiration
- Password hashing with bcrypt
- Rate limiting on auth endpoints
- CORS configuration

### API Security
- Request validation
- Input sanitization
- Rate limiting
- Error handling middleware

## Database Schema

### User Model
```typescript
interface User {
  username: string;
  password: string;
  createdAt: Date;
  urls: Types.ObjectId[];
}
```

### URL Model
```typescript
interface Url {
  originalUrl: string;
  shortCode: string;
  creator?: Types.ObjectId;
  createdAt: Date;
  expiresAt?: Date;
  clicks: number;
}
```

## Testing

### Unit Tests
- Controllers
- Services
- Utilities
- Models

### Integration Tests
- API endpoints
- Authentication flow
- Database operations

## Error Handling

### HTTP Status Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error

### Error Response Format
```typescript
interface ErrorResponse {
  error: string;
  details?: any;
  code?: string;
}
```

## AI Integration

The backend leverages OpenAI's GPT model to provide intelligent features:

- Generating descriptions for shortened URLs
- Creating relevant tags for URLs
- Offering advice to increase click-through rates
- Powering an AI chat interface for URL management

## Web Scraping

The backend includes a web scraping service to extract content from URLs. This is used to provide context for AI-generated descriptions and tags.

## Analytics

Basic analytics are provided for each shortened URL, including:
- Click count
- Creation date
- Geographic data of visitors

## Conversation Management

The backend maintains conversation history for AI interactions, allowing for context-aware responses in the AI chat feature.

## Development

To run the project in development mode with hot-reloading:

```bash
npm run dev
```

## Production

For production deployment, build the TypeScript files and start the server:

```bash
npm run build
npm start
```

## Further Documentation

For more detailed information about specific components:

- [AI Service](```typescript:backend/src/services/aiService.ts
startLine: 1
endLine: 167
```)

- [URL Model](```typescript:backend/src/models/Url.ts
startLine: 1
endLine: 13
```)

- [Authentication Middleware](```typescript:backend/src/middleware/auth.ts
startLine: 1
endLine: 21
```)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the ISC License.
