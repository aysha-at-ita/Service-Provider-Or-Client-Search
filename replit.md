# SearchEngine

A search application that returns top hits based on queries, using PostgreSQL for data storage and session-based authentication.

## Overview

- **Frontend**: React with Vite, TailwindCSS, shadcn/ui components
- **Backend**: Python Flask (API), Express.js (static serving & proxy)
- **Database**: PostgreSQL with SQLAlchemy (Flask) / Drizzle ORM (schema)
- **Authentication**: Session-based with email/password (Flask-managed)

## Architecture

The application uses a hybrid architecture:
1. Flask runs on port 5001 handling all API requests
2. Express runs on port 5000 serving the frontend and proxying API requests to Flask
3. Vite provides HMR for frontend development

## Project Structure

```
├── app.py                   # Flask backend (API + auth)
├── client/                  # Frontend (React)
│   └── src/
│       ├── pages/          # Page components (Home.tsx)
│       ├── components/     # Reusable UI components
│       ├── hooks/          # Custom hooks (use-auth, use-search)
│       └── lib/            # Utilities
├── server/                  # Express (proxy + static serving)
│   ├── routes.ts           # API proxy to Flask
│   ├── index.ts            # Express server entry
│   └── vite.ts             # Vite integration
└── shared/                  # Shared types
    ├── schema.ts           # Database schemas (Drizzle)
    ├── routes.ts           # API route definitions
    └── models/
        └── auth.ts         # Auth-related schemas
```

## API Endpoints (Flask)

- `POST /api/auth/register` - Register new user (email, password, firstName, lastName)
- `POST /api/auth/login` - Login with email/password
- `GET /api/auth/user` - Get current authenticated user
- `POST /api/logout` - Logout user
- `POST /api/search` - Perform a search query (requires auth)
- `GET /api/history` - Get search history (requires auth)

## Database Tables

- `users` - User accounts with password hash
- `queries` - Search queries (with userId for history)
- `hits` - Search results linked to queries

## Running the Application

The workflow runs `npm run dev` which starts:
1. Flask server on port 5001 (spawned by Express)
2. Express server on port 5000 (with Vite for HMR)

## Recent Changes

- Rewrote backend from Express to Python Flask
- Implemented session-based authentication with password hashing
- Express now proxies all /api/* requests to Flask
- Updated frontend with login/register forms
