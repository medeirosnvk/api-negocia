# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
# From root (orchestrator)
npm run dev:backend    # Start backend dev server with hot-reload
npm run dev:frontend   # Start frontend dev server
npm run build          # Build backend + frontend
npm run deploy         # Build all + pm2 restart

# From backend/
cd backend
npm run dev            # Start dev server with hot-reload (tsx watch)
npm run build          # Compile TypeScript to dist/
npm start              # Run compiled production build
npm run typecheck      # Type checking without emit
```

## Testing

```bash
# From root
npm test               # Run backend tests

# From backend/
cd backend
npm test               # Run all tests
npm run test:watch     # Watch mode
npm run test:coverage  # Coverage report
```

Tests are in `backend/src/__tests__/` using Jest with ts-jest. Run a single test file:

```bash
cd backend && npx jest src/__tests__/CalculadoraAcordo.test.ts
```

## Architecture

This is a debt negotiation chatbot (LucIA) built with Express.js and TypeScript. The project is organized as a monorepo with `backend/` and `frontend/` directories.

### Backend Structure (`backend/src/`)

```
backend/
  src/
    core/            - Business logic (ChatEngine, CalculadoraAcordo)
    services/        - External integrations (ApiService, RagService, MessageBatchService)
    types/           - Shared TypeScript types and interfaces
    config/          - Configuration examples
    data/conhecimento/ - RAG knowledge base (.md files)
    __tests__/       - Jest tests
    index.ts         - Express server entry point
  package.json       - Backend dependencies and scripts
  tsconfig.json      - TypeScript config
  jest.config.js     - Jest config
  .env               - Environment variables (not in git)
```

### Frontend Structure (`frontend/src/`)

```
frontend/src/
  components/      - Reusable UI components (ChatHeader, ChatInput, MessageBubble, MessageList, TypingIndicator)
  contexts/        - React contexts (ThemeContext)
  hooks/           - Custom hooks (useTheme)
  screens/         - Full-screen views (ChatScreen)
  services/        - API service layer (chatService)
  types/           - Frontend TypeScript types
  App.tsx          - Root component with ThemeProvider
  main.tsx         - Entry point
```

### Core Components

**ChatEngine** (`backend/src/core/ChatEngine.ts`)

- Orchestrates AI-powered debt negotiation conversations
- Detects user intent: cadence changes ("semanal", "quinzenal"), date requests, budget constraints
- Integrates with Gemini LLM API
- Maintains conversation history via express-session

**CalculadoraAcordo** (`backend/src/core/CalculadoraAcordo.ts`)

- Calculates debt totals with interest (3%/month), fines (2%), and fees (10%)
- Generates installment offers for 4 cadences: mensal, semanal, quinzenal, diário
- Handles date adjustments (weekends → business days, respects max vencimento date)
- Adds R$11.90 boleto fee per installment

**ApiService** (`backend/src/services/ApiService.ts`)

- External API integration with Cobrance API
- Credential validation, creditor lookup, offer fetching, agreement formalization

**RagService** (`backend/src/services/RagService.ts`)

- RAG (Retrieval-Augmented Generation) with Gemini embeddings
- In-memory vector store with cosine similarity

**Express Server** (`backend/src/index.ts`)

- REST API with session-based state
- Creates new ChatEngine instance per request, restoring history from session

### Data Flow

```
POST /api/chat {mensagem}
    → Express restores session (chat_history, cadencia)
    → ChatEngine (backend/src/core/) detects intent, recalculates offers if needed
    → CalculadoraAcordo.gerarOfertas() computes payment options
    → LLM generates response with available offers context
    → Session updated, response returned
```

### API Endpoints

- `POST /api/chat` - Process negotiation message → `{resposta, status}`
- `POST /api/limpar-sessao` - Clear session/start new conversation
- `POST /api/formalizar-acordo` - Formalize accepted agreement
- `GET /api/ofertas` - Debug: view current offers and cadence
- `GET /api/health` - Health check

## Code Conventions

- **Portuguese identifiers** throughout (e.g., `enviarMensagem`, `calcularDiasAtraso`, `historico`)
- **Backend types** defined in `backend/src/types/index.ts`: `Divida`, `ConfiguracaoAcordo`, `OfertaCalculada`, `MensagemChat`
- **Frontend types** defined in `frontend/src/types/index.ts`: `Mensagem`, `ChatResponse`, `FormalizacaoResponse`
- **Date format**: dd/mm/yyyy for display, internal calculations use timestamps
- **Strict TypeScript** with `noImplicitAny` and `strictNullChecks` enabled
- **Modular organization**: business logic in `core/`, external integrations in `services/`, types in `types/`

## Environment Variables

Backend environment variables are in `backend/.env`:

```
PORT=3001              # Server port
API_KEY=...            # LLM API Bearer token
SESSION_SECRET=...     # Session encryption
NODE_ENV=development   # development | production
```

## Others MCP configs

Always use Context7 MCP when I need library/API documentation, code generation, setup or configuration steps without me having to explicitly ask.
