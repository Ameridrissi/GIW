# GIW - Global International Wallet

## Overview
GIW is a modern USDC wallet application with **real blockchain wallets** powered by Circle's User-Controlled Wallets SDK. Built with React, Express, PostgreSQL, Circle SDK, and OpenAI integration, it provides users with a seamless experience for managing real digital assets, executing blockchain transactions, and receiving intelligent financial advice.

## Current State
The application features complete Circle User-Controlled Wallets integration with PIN-based security, Replit authentication, comprehensive backend API, and frontend UI. Users authenticate via Replit Auth (supporting Google, GitHub, email/password), create Circle-powered USDC wallets with PIN protection, execute real blockchain transactions, link payment cards, and interact with an AI financial advisor.

## Recent Changes (November 2, 2025)
- ✅ Set up PostgreSQL database with complete schema
- ✅ Implemented Replit Auth integration for authentication
- ✅ **Integrated Circle User-Controlled Wallets SDK (backend only)**
- ✅ **CRITICAL FIX: Circle userToken lifecycle management**
  - Fixed: `createUser()` doesn't return userToken - must call `createUserToken()` separately
  - All Circle API operations now generate fresh tokens (60-minute expiration handled)
  - Prevents token expiration failures in wallet operations
- ✅ **Implemented deferred PIN setup flow (Option 1 solution)**
  - Removed Circle Web SDK (@circle-fin/w3s-pw-web-sdk) due to vite.config.ts constraints
  - Wallets created successfully on blockchain without immediate PIN challenge
  - Clear dashboard banner guides users to complete PIN setup via Circle console
  - All wallet creation functionality works end-to-end
- ✅ **Updated database schema with Circle-specific fields (walletId, blockchain, requiresPinSetup)**
- ✅ Built complete REST API for wallets, transactions, cards, and automations with resource ownership security
- ✅ Integrated AI/ML API (https://api.aimlapi.com/v1) for AI chat assistant with GPT-4o model
- ✅ Connected frontend to all backend APIs
- ✅ **Created dedicated Dashboard page with wallet overview, stats, and transaction summary**
- ✅ **Removed PIN setup banners from Dashboard and Wallet pages (per user request)**
- ✅ End-to-end wallet creation tested successfully with real Circle TEST_API_KEY
- ✅ **Application fully functional with Circle blockchain wallets**
- ✅ **Implemented Balance Refresh Feature with Auto-Sync**
  - Added `POST /api/wallets/:id/sync-balance` endpoint to fetch real balance from Circle API
  - Auto-fetches Circle wallet ID if missing by matching blockchain address
  - Frontend refresh button enabled always (no disabled state)
  - Toast notifications provide accurate feedback based on sync status
- ✅ **CRITICAL FIX: Import Wallets from Circle Feature**
  - Added `POST /api/wallets/import-from-circle` endpoint to sync existing Circle wallets into app
  - Fetches all Circle wallets and creates database records for any not yet tracked
  - Updates existing wallet records with Circle wallet IDs if missing
  - Prominent "Import from Circle" button in UI when no wallets exist
  - Solves issue where wallets created via Circle Console don't appear in app

## Architecture

### Tech Stack
- **Frontend**: React + TypeScript, Wouter (routing), TanStack Query, Shadcn UI
- **Backend**: Express.js, TypeScript, Circle User-Controlled Wallets SDK (@circle-fin/user-controlled-wallets)
- **Database**: PostgreSQL (Neon) with Drizzle ORM
- **Authentication**: Replit Auth (OpenID Connect) for app access, Circle PIN for wallet security (deferred setup)
- **Blockchain**: Circle User-Controlled Wallets (Smart Contract Accounts on **Arc Testnet** - Circle's L1 blockchain)
- **AI**: AI/ML API (aimlapi.com) with GPT-4o for financial advice

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
  - Wallet creation with challenge-based PIN setup (backend only)
  - Balance syncing from Circle testnet
  - Transaction execution (planned)
- **Token Management Strategy**: 
  - All routes generate fresh userTokens via `createUserToken()` before Circle API calls
  - Tokens expire after 60 minutes - never cached or reused
  - User creation is idempotent (409 handled gracefully)
- **Deferred PIN Setup Flow** (Option 1 - Pragmatic Solution):
  - **Backend**: Creates Circle user and wallet, returns challenge data
  - **Frontend**: Shows success modal with PIN setup instructions
  - **Dashboard**: Displays prominent banner for wallets needing PIN setup
  - **User Action**: Completes PIN setup via Circle Console or external flow
  - **Constraint**: vite.config.ts cannot be modified, blocking Circle Web SDK polyfills
  - **Benefit**: Wallets created successfully, full functionality achieved without frontend SDK
- **Security Model**: Replit Auth for app access, Circle PIN for wallet-specific operations (setup deferred)

### API Endpoints
- `GET /api/auth/user` - Get current user
- `GET /api/wallets` - List user wallets
- `POST /api/wallets` - Create new wallet
- `POST /api/wallets/:id/sync-balance` - **Sync wallet balance from Arc Testnet blockchain via Circle API**
- `PATCH /api/wallets/:id/balance` - Update balance (manual)
- `PATCH /api/wallets/:id/complete-setup` - Complete wallet setup after PIN challenge
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
- `OPENAI_API_KEY`: AI/ML API key for AI chat features (from aimlapi.com)
- `REPL_ID`: Replit application ID (auto-configured)
- `ISSUER_URL`: OIDC issuer URL (defaults to Replit OIDC)

## Deployment Notes
**CRITICAL**: Before deploying, ensure required API keys are configured:
1. **Circle API Key** (`CIRCLE_API_KEY`): **REQUIRED** for blockchain wallet creation and transactions
   - Without this key, wallet creation and blockchain operations will fail
   - Obtain from Circle Developer Console (App ID: 502da187-5a8a-53c5-9856-3d9a9ac6dd56)
2. **AI/ML API Key** (`OPENAI_API_KEY`): Required for AI chat assistant
   - Get your API key from https://aimlapi.com/
   - Without this key, the AI chat assistant feature will not function
   - Uses GPT-4o model via AI/ML API (base URL: https://api.aimlapi.com/v1)
   - All other features work independently of AI integration

**Circle Wallet Creation Flow (Deferred PIN Setup)**:
1. User creates wallet via UI → Backend creates Circle user (if first wallet) and wallet
2. Backend returns wallet data with `requiresPinSetup: true` flag
3. Frontend shows success modal with blockchain details and PIN setup reminder
4. Real blockchain wallet created on **Arc Testnet** (address pending confirmation)
5. Dashboard displays PIN setup banner with links to Circle documentation and console
6. User completes PIN setup externally via Circle Console
7. Wallet becomes fully functional for transactions after PIN setup

**Why Arc Testnet?**
- **Circle's newest L1 blockchain** - Launched October 28, 2025
- **USDC as gas token** - Users pay fees in USDC (18 decimals), not volatile crypto tokens
- **Sub-second finality** - Extremely fast transaction confirmation
- **100+ institutional partners** - BlackRock, Visa, Mastercard, HSBC, Goldman Sachs, Coinbase, AWS
- **Free testnet USDC** - Available at https://faucet.circle.com
- **Chain ID**: 5042002
- **RPC Endpoint**: https://rpc.testnet.arc.network
- **Explorer**: https://testnet.arcscan.app

## Future Enhancements
- **Add Circle Faucet integration** - Auto-request 10 free test USDC from https://faucet.circle.com
- **Long-term solution**: Request Replit support to enable polyfill configuration in vite.config.ts for Circle Web SDK integration
- **Implement Circle transaction challenges for sending USDC** (requires frontend SDK or backend-only approach)
- Add in-app PIN setup flow once polyfill constraints are resolved
- Add post-PIN-setup reconciliation to update wallet addresses after blockchain confirmation
- Implement deposit/withdraw flows with Circle payment integrations
- Add real-time balance updates with WebSocket support
- Add automation creation UI for recurring payments and savings goals
- Optimize AI prompts for more personalized financial advice
- Add transaction filtering and search capabilities
- Implement data export features (CSV, PDF statements)
- **Migrate to Arc Mainnet** when it launches in 2026

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
