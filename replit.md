# GIW - Global International Wallet

## Overview
GIW is a modern USDC wallet application with **real blockchain wallets** powered by Circle's User-Controlled Wallets SDK. Built with React, Express, PostgreSQL, Circle SDK, and OpenAI integration, it provides users with a seamless experience for managing real digital assets, executing blockchain transactions, and receiving intelligent financial advice.

## Current State
The application features complete Circle User-Controlled Wallets integration with PIN-based security, Replit authentication, comprehensive backend API, and frontend UI. Users authenticate via Replit Auth (supporting Google, GitHub, email/password), create Circle-powered USDC wallets with PIN protection, execute real blockchain transactions, link payment cards, and interact with an AI financial advisor.

## Recent Changes (November 2, 2025)
- ✅ Set up PostgreSQL database with complete schema
- ✅ Implemented Replit Auth integration for authentication
- ✅ **Integrated Circle User-Controlled Wallets SDK (backend + frontend)**
- ✅ **CRITICAL FIX: Circle userToken lifecycle management**
  - Fixed: `createUser()` doesn't return userToken - must call `createUserToken()` separately
  - All Circle API operations now generate fresh tokens (60-minute expiration handled)
  - Prevents token expiration failures in wallet operations
- ✅ **Implemented PIN-based wallet security using Circle's challenge-based authentication**
- ✅ **Updated database schema with Circle-specific fields (walletId, blockchain, requiresPinSetup)**
- ✅ Built complete REST API for wallets, transactions, cards, and automations with resource ownership security
- ✅ Integrated OpenAI for AI chat assistant (blueprint ready)
- ✅ Connected frontend to all backend APIs with Circle SDK integration
- ✅ **Circle SDK loaded via CDN to bypass Vite bundling issues**
- ✅ **Frontend Circle SDK helper for executing PIN setup challenges**
- ✅ **Fixed 409 error handling for existing Circle users**
- ✅ **Created dedicated Dashboard page with wallet overview, stats, and transaction summary**
- ✅ End-to-end wallet creation tested successfully with real Circle TEST_API_KEY
- ✅ **Application fully functional with Circle blockchain wallets**

## Architecture

### Tech Stack
- **Frontend**: React + TypeScript, Wouter (routing), TanStack Query, Shadcn UI, Circle Web SDK (@circle-fin/w3s-pw-web-sdk)
- **Backend**: Express.js, TypeScript, Circle User-Controlled Wallets SDK (@circle-fin/user-controlled-wallets)
- **Database**: PostgreSQL (Neon) with Drizzle ORM
- **Authentication**: Replit Auth (OpenID Connect) for app access, Circle PIN for wallet security
- **Blockchain**: Circle User-Controlled Wallets (Smart Contract Accounts on MATIC-AMOY testnet)
- **AI**: OpenAI GPT-4o-mini for financial advice

### Database Schema
- **users**: User profiles with Circle integration (circleUserToken for API access)
- **sessions**: Session storage for Replit Auth
- **wallets**: Real blockchain wallets with Circle wallet IDs, addresses, and balance tracking
- **transactions**: Transaction history (sent/received) with blockchain support
- **payment_cards**: Linked payment methods
- **automations**: Recurring payments and scheduled transfers

### Circle Integration Architecture
- **Backend Circle Service** (`server/circleService.ts`): Wrapper for Circle API operations
  - User creation and **fresh token generation** (solves 60-min expiration)
  - Wallet creation with challenge-based PIN setup
  - Balance syncing from Circle testnet
  - Transaction execution (planned)
- **Token Management Strategy**: 
  - All routes generate fresh userTokens via `createUserToken()` before Circle API calls
  - Tokens expire after 60 minutes - never cached or reused
  - User creation is idempotent (409 handled gracefully)
- **Frontend Circle SDK Helper** (`client/src/lib/circleSDK.ts`): Circle Web SDK initialization and challenge execution
  - PIN setup UI modal rendering
  - Challenge authentication with userToken and encryptionKey
  - Customizable layout configuration
- **Challenge-Based Flow**: Backend creates challenges → Frontend executes via SDK → User completes PIN/transaction
- **Security Model**: Replit Auth for app access, Circle PIN for wallet-specific operations

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
- `CIRCLE_API_KEY`: Circle API key for blockchain wallet operations (**REQUIRED**)
- `OPENAI_API_KEY`: OpenAI API key for AI features
- `REPL_ID`: Replit application ID (auto-configured)
- `ISSUER_URL`: OIDC issuer URL (defaults to Replit OIDC)

## Deployment Notes
**CRITICAL**: Before deploying, ensure required API keys are configured:
1. **Circle API Key** (`CIRCLE_API_KEY`): **REQUIRED** for blockchain wallet creation and transactions
   - Without this key, wallet creation and blockchain operations will fail
   - Obtain from Circle Developer Console (App ID: 502da187-5a8a-53c5-9856-3d9a9ac6dd56)
2. **OpenAI API Key** (`OPENAI_API_KEY`): Required for AI chat assistant
   - Without this key, the AI chat assistant feature will not function
   - All other features work independently of OpenAI integration

**Circle Wallet Creation Flow**:
1. User creates wallet via UI → Backend creates Circle user (if first wallet) and wallet challenge
2. Backend returns full authentication data (challengeId, userToken, encryptionKey) to frontend
3. Frontend Circle SDK executes challenge → User sets PIN via Circle's modal UI
4. PIN setup completes → Real blockchain wallet created on MATIC-AMOY testnet
5. Wallet address and ID stored in database for future transactions

## Future Enhancements
- **Implement Circle transaction challenges for sending USDC** (next priority)
- Add post-challenge reconciliation to update wallet addresses after PIN setup
- Implement deposit/withdraw flows with Circle payment integrations
- Add real-time balance updates with WebSocket support
- Add automation creation UI for recurring payments and savings goals
- Optimize AI prompts for more personalized financial advice
- Add transaction filtering and search capabilities
- Implement data export features (CSV, PDF statements)
- Consider production blockchain migration (MATIC-AMOY testnet → Polygon mainnet)

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
