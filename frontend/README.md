# URL Shortener Frontend

## 🚀 Introduction

This is the frontend for a powerful URL shortener application. It provides a user-friendly interface for shortening URLs, managing user accounts, and interacting with AI-powered features for link management and analysis.

## 🛠 Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Axios
- React Router

## 🌟 Features

- URL shortening
- User authentication (login/register)
- Dashboard for managing shortened URLs
- AI-powered chat interface for URL management
- Dark mode support
- Responsive design

## 🏗 Project Structure

frontend/
├── src/
│ ├── components/
│ ├── contexts/
│ ├── pages/
│ ├── App.tsx
│ └── main.tsx
├── public/
├── index.html
├── package.json
└── tsconfig.json

## 🚦 Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```

## ⚙ Configuration

The frontend is configured to work with the backend running on `http://localhost:3000`. If your backend is running on a different URL, update the `API_BASE_URL` in the following file:

## 📄 Available Scripts

In the project directory, you can run:

- `npm run dev`: Runs the app in development mode
- `npm run build`: Builds the app for production
- `npm run lint`: Lints the project files
- `npm run preview`: Previews the built app

## 🎨 Styling

This project uses Tailwind CSS for styling. The configuration can be found in:

## 🔒 Authentication

Authentication is handled using JWT tokens. The `AuthContext` provides authentication state and methods throughout the application.

## 🌓 Dark Mode

Dark mode is implemented using Tailwind CSS and can be toggled in the settings. The `SettingsContext` manages the dark mode state.

## 📱 Responsive Design

The application is designed to be responsive and work well on both desktop and mobile devices.

## 🧠 AI Integration

The frontend integrates with the backend's AI features, providing an interactive chat interface for URL management and analysis.

## 🔑 Key Components

### Home Page
```typescript:frontend/src/pages/Home.tsx
startLine: 10
endLine: 121
```

### Dashboard
```typescript:frontend/src/pages/Dashboard.tsx
startLine: 36
endLine: 367
```

### Navbar
```typescript:frontend/src/components/Navbar.tsx
startLine: 1
endLine: 48
```

## 🛠 Development

To run the project in development mode with hot-reloading:

```
npm run dev
```

## 🏭 Production

For production deployment, build the project:

```
npm run build
```

## 📚 Further Documentation

For more detailed information about specific components or contexts, refer to the inline documentation within each file.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the ISC License.
