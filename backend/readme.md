# URL Shortener Backend

## 🚀 Introduction

This is the backend for a powerful URL shortener application. It provides a robust API for shortening URLs, managing user accounts, and offering AI-powered features for link management and analysis.

## 🛠 Tech Stack

- Node.js
- Express.js
- TypeScript
- MongoDB with Mongoose
- JWT for authentication
- OpenAI GPT for AI features
- Cheerio for web scraping

## 🌟 Features

- URL shortening
- User authentication
- AI-powered link descriptions and tags
- Web scraping capabilities
- Analytics for shortened links
- Conversation management with AI

## 🏗 Project Structure


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


## 🚦 Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up environment variables (see [Configuration](#-configuration))
4. Start the development server:
   ```
   npm run dev
   ```

## ⚙ Configuration

Create a `.env` file in the root directory with the following variables:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
OPENROUTER_API_KEY=your_openrouter_api_key
BASE_URL=http://localhost:3000
PORT=3000
```

## 📡 API Endpoints

### Authentication
- `POST /register`: Register a new user
- `POST /login`: Login and receive a JWT

### URL Shortening
- `POST /shorten`: Create a shortened URL
- `GET /:shortCode`: Redirect to the original URL

### Analytics
- `GET /analytics/:shortCode`: Get analytics for a shortened URL

### User URLs
- `GET /user/urls`: Get all URLs for the authenticated user

### AI Features
- `POST /api/ai/chat`: Interact with AI assistant for URL management

## 💡 AI Integration

The backend leverages OpenAI's GPT model to provide intelligent features:

- Generating descriptions for shortened URLs
- Creating relevant tags for URLs
- Offering advice to increase click-through rates
- Powering an AI chat interface for URL management

## 🔒 Authentication

JWT (JSON Web Tokens) are used for user authentication. Include the token in the `Authorization` header for protected routes:

```
Authorization: Bearer <your_jwt_token>
```

## 🕷 Web Scraping

The backend includes a web scraping service to extract content from URLs. This is used to provide context for AI-generated descriptions and tags.

## 📊 Analytics

Basic analytics are provided for each shortened URL, including:
- Click count
- Creation date
- Geographic data of visitors

## 🧠 Conversation Management

The backend maintains conversation history for AI interactions, allowing for context-aware responses in the AI chat feature.

## 🛡 Error Handling

Robust error handling is implemented throughout the application. Errors are logged and appropriate error responses are sent to the client.

## 🔧 Development

To run the project in development mode with hot-reloading:

```
npm run dev
```

## 🏭 Production

For production deployment, build the TypeScript files and start the server:

```
npm run build
npm start
```

## 📚 Further Documentation

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

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the ISC License.
