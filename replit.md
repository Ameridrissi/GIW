# GIW - Global International Wallet

## Overview
GIW is a modern USDC wallet application with AI-powered financial insights. Built with React, Express, PostgreSQL, and OpenAI integration, it provides users with a seamless experience for managing digital assets, tracking transactions, and receiving intelligent financial advice.

## Current State
The application has a complete backend API with authentication, comprehensive frontend UI, and database persistence. Users can authenticate via Replit Auth (supporting Google, GitHub, email/password), manage wallets, track transactions, link payment cards, and interact with an AI financial advisor.

## Recent Changes (November 2, 2025)
- ✅ Set up PostgreSQL database with complete schema
- ✅ Implemented Replit Auth integration for authentication
- ✅ Built complete REST API for wallets, transactions, cards, and automations with resource ownership security
- ✅ Integrated OpenAI for AI chat assistant
- ✅ Connected frontend to all backend APIs across all pages
- ✅ Implemented wallet address auto-generation on the backend
- ✅ End-to-end testing validated: authentication, wallet creation, transaction tracking, error handling all working
- ✅ Application ready for deployment

## Architecture

### Tech Stack
- **Frontend**: React + TypeScript, Wouter (routing), TanStack Query, Shadcn UI
- **Backend**: Express.js, TypeScript
- **Database**: PostgreSQL (Neon) with Drizzle ORM
- **Authentication**: Replit Auth (OpenID Connect)
- **AI**: OpenAI GPT-4o-mini for financial advice

### Database Schema
- **users**: User profiles (Replit Auth managed)
- **sessions**: Session storage for auth
- **wallets**: USDC wallets with balance tracking
- **transactions**: Transaction history (sent/received)
- **payment_cards**: Linked payment methods
- **automations**: Recurring payments and scheduled transfers

### API Endpoints
- `GET /api/auth/user` - Get current user
- `GET /api/wallets` - List user wallets
- `POST /api/wallets` - Create new wallet
- `PATCH /api/wallets/:id/balance` - Update balance
- `GET /api/wallets/:walletId/transactions` - List transactions
- `POST /api/transactions` - Create transaction
- `PATCH /api/transactions/:id/status` - Update transaction status
- `GET /api/cards` - List payment cards
- `POST /api/cards` - Add payment card
- `PATCH /api/cards/:id/default` - Set default card
- `DELETE /api/cards/:id` - Remove card
- `GET /api/automations` - List automations
- `POST /api/automations` - Create automation
- `PATCH /api/automations/:id/status` - Update automation status
- `DELETE /api/automations/:id` - Delete automation
- `POST /api/ai/chat` - AI chat assistant

## Pages
- **Home** (Landing): Hero with features and news (unauthenticated users)
- **Wallet**: Dashboard with balance, transactions, quick actions (default for authenticated)
- **Insights**: AI-powered spending analytics and recommendations
- **Cards**: Payment card management
- **Settings**: User preferences

## Authentication Flow
- Unauthenticated users see the landing page
- Clicking "Get Started" or "Sign In" redirects to `/api/login`
- Replit Auth handles the login flow
- After authentication, users are redirected to the Wallet page
- All protected routes require authentication via `isAuthenticated` middleware

## Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (auto-configured)
- `SESSION_SECRET`: Session encryption key (auto-configured)
- `OPENAI_API_KEY`: OpenAI API key for AI features
- `REPL_ID`: Replit application ID (auto-configured)
- `ISSUER_URL`: OIDC issuer URL (defaults to Replit OIDC)

## Deployment Notes
**IMPORTANT**: Before deploying to production, ensure you configure your OpenAI API key:
1. Set the `OPENAI_API_KEY` environment variable with a valid OpenAI API key
2. Without this key, the AI chat assistant feature will not function
3. All other features (wallet management, transactions, cards) work independently of the OpenAI integration

## Future Enhancements
- Add real-time balance updates with WebSocket support
- Implement deposit/withdraw flows with actual payment integrations
- Add automation creation UI for recurring payments and savings goals
- Optimize AI prompts for more personalized financial advice
- Add transaction filtering and search capabilities
- Implement data export features (CSV, PDF statements)

## Development
- Run: `npm run dev` (starts both Express and Vite)
- Database migration: `npm run db:push` (or `npm run db:push --force`)
- All changes auto-reload via HMR

## Design System
- Color scheme: Blue/purple gradients with professional financial styling
- Dark mode support with theme toggle
- Consistent spacing and typography
- Shadcn UI components with custom theming
- Responsive layout with sidebar navigation
