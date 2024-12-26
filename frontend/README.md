# URL Shortener Frontend

## Introduction

This is the frontend for a powerful URL shortener application. It provides a user-friendly interface for shortening URLs, managing user accounts, and interacting with AI-powered features for link management and analysis.

## Tech Stack

- React 18 with TypeScript for type-safe development
- Vite for fast development and optimized builds
- Tailwind CSS for utility-first styling
- Framer Motion for smooth animations
- Axios for API communication
- React Router v6 for routing
- React Context API for state management

## Features

- URL shortening
- User authentication (login/register)
- Dashboard for managing shortened URLs
- AI-powered chat interface for URL management
- Dark mode support
- Responsive design

## Project Structure

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

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```

## Configuration

The frontend is configured to work with the backend running on `http://localhost:3000`. If your backend is running on a different URL, update the `API_BASE_URL` in the following file:

## Available Scripts

In the project directory, you can run:

- `npm run dev`: Runs the app in development mode
- `npm run build`: Builds the app for production
- `npm run lint`: Lints the project files
- `npm run preview`: Previews the built app

## Styling

This project uses Tailwind CSS for styling. The configuration can be found in:

## Authentication

Authentication is handled using JWT tokens. The `AuthContext` provides authentication state and methods throughout the application.

## Dark Mode

Dark mode is implemented using Tailwind CSS and can be toggled in the settings. The `SettingsContext` manages the dark mode state.

## Responsive Design

The application is designed to be responsive and work well on both desktop and mobile devices.

## AI Integration

The frontend integrates with the backend's AI features, providing an interactive chat interface for URL management and analysis.

## Development Guidelines

### State Management
- Use React Context for global state (auth, settings, theme)
- Prefer local state for component-specific data
- Implement proper error boundaries for resilient UI

### Component Structure
- Follow atomic design principles
- Keep components focused and reusable
- Implement proper prop typing
- Use custom hooks for shared logic

### Styling Guidelines
- Use Tailwind CSS utility classes
- Follow mobile-first approach
- Maintain consistent spacing using Tailwind's spacing scale
- Use CSS variables for theme colors

### Performance Optimization
- Implement lazy loading for routes
- Use React.memo for expensive components
- Optimize images and assets
- Implement proper caching strategies

### Testing
- Write unit tests for utilities and hooks
- Implement integration tests for key user flows
- Use React Testing Library for component tests
- Maintain good test coverage

## Key Components

### Pages
- `Home.tsx`: Landing page with URL shortening form
- `Dashboard.tsx`: User dashboard with URL management
- `Login.tsx`/`Register.tsx`: Authentication pages
- `Analytics.tsx`: URL analytics and insights

### Features
- `AiChat.tsx`: AI-powered chat interface
- `UrlGrid.tsx`: URL management grid
- `CommandHelp.tsx`: Available AI commands
- `ThemeToggle.tsx`: Dark/light mode toggle

### Contexts
- `AuthContext.tsx`: Authentication state and methods
- `SettingsContext.tsx`: App settings and preferences

### Custom Hooks
- `useAuth.ts`: Authentication utilities
- `useSettings.ts`: App settings management
- `useUrlManagement.ts`: URL operations

## Development

To run the project in development mode with hot-reloading:

```bash
npm run dev
```

## Production

For production deployment, build the project:

```bash
npm run build
```

## Further Documentation

For more detailed information about specific components or contexts, refer to the inline documentation within each file.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the ISC License.
