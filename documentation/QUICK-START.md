# Quick Start - LucIA Chatbot

Guia rapido para rodar o projeto completo (backend + frontend React).

## Pre-requisitos

- Node.js 18+
- npm

## Instalacao

### 1. Instalar dependencias do backend

```bash
cd backend
npm install
cd ..
```

### 2. Instalar dependencias do frontend

```bash
cd frontend
npm install
cd ..
```

## Configuracao

### Criar arquivo `backend/.env`

```env
PORT=3001
API_KEY=your-llm-api-key
SESSION_SECRET=your-secret-key-here
NODE_ENV=development
```

## Executar

### Opcao 1: Dois terminais separados (recomendado)

**Terminal 1 - Backend:**
```bash
npm run dev:backend
# Backend iniciara em http://localhost:3001
```

**Terminal 2 - Frontend:**
```bash
npm run dev:frontend
# Frontend iniciara em http://localhost:5173
```

Acesse: `http://localhost:5173`

### Opcao 2: Comandos diretos nas pastas

```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

## Estrutura do Projeto

```
api-negocia/
├── backend/                # Backend TypeScript
│   ├── src/
│   │   ├── core/           # ChatEngine, CalculadoraAcordo
│   │   ├── services/       # ApiService, RagService
│   │   ├── types/          # Tipos TypeScript
│   │   ├── __tests__/      # Testes Jest
│   │   └── index.ts        # Express server
│   ├── package.json
│   └── .env
├── frontend/               # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── screens/        # ChatScreen
│   │   └── App.tsx
│   ├── vite.config.ts      # Config Vite + Proxy
│   └── package.json
├── documentation/          # Docs gerais
├── package.json            # Orquestrador raiz
└── ecosystem.config.cjs    # PM2 (producao)
```

## Scripts Disponiveis

### Raiz (orquestrador)
```bash
npm run dev:backend    # Dev backend com hot-reload
npm run dev:frontend   # Dev frontend Vite
npm run build          # Build backend + frontend
npm run deploy         # Build + pm2 restart
npm test               # Testes do backend
npm run typecheck      # Verificar tipos
```

### Backend (`cd backend`)
```bash
npm run dev            # Dev com hot-reload
npm run build          # Compilar TypeScript
npm start              # Rodar versao compilada
npm test               # Rodar testes
npm run typecheck      # Verificar tipos
```

### Frontend (`cd frontend`)
```bash
npm run dev            # Dev server Vite
npm run build          # Build de producao
npm run preview        # Preview do build
```

## URLs

- **Frontend React (dev)**: http://localhost:5173
- **Backend API**: http://localhost:3001

## APIs Disponiveis

- `POST /api/chat` - Enviar mensagem ao chatbot
- `POST /api/limpar-sessao` - Limpar historico
- `POST /api/formalizar-acordo` - Formalizar acordo
- `GET /api/ofertas` - Ver ofertas atuais (debug)
- `GET /api/health` - Health check

## Troubleshooting

### Backend nao inicia
- Verifique se `backend/.env` existe
- Confirme que a porta 3001 esta livre
- Verifique se `API_KEY` esta configurada

### Frontend nao conecta ao backend
- Certifique-se de que o backend esta rodando
- Verifique a configuracao do proxy em `frontend/vite.config.ts`
- Limpe o cache: `cd frontend && rm -rf node_modules/.vite && npm run dev`

### Erros de TypeScript
```bash
cd backend && npm run typecheck   # Verificar erros backend
cd frontend && npm run build      # Build frontend
```

## Proximos Passos

1. Configure suas variaveis de ambiente em `backend/.env`
2. Inicie backend e frontend
3. Abra o navegador em `http://localhost:5173`
4. Comece a conversar com a LucIA!

Para mais detalhes:
- Backend: Leia `CLAUDE.md`
- Comandos: Leia `documentation/COMMANDS.md`
- Deploy: Leia `documentation/DEPLOYMENT.md`
- Frontend docs: Veja `frontend/documentation/`
- Backend docs: Veja `backend/documentation/`
