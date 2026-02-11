# Quick Start - LucIA Chatbot

Guia rápido para rodar o projeto completo (backend + frontend React).

## Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn

## Instalação

### 1. Instalar dependências do backend

```bash
npm install
```

### 2. Instalar dependências do frontend

```bash
cd frontend
npm install
cd ..
```

## Configuração

### 1. Criar arquivo .env na raiz

```bash
PORT=3000
API_KEY=your-llm-api-key
SESSION_SECRET=your-secret-key-here
NODE_ENV=development
```

## Executar

### Opção 1: Dois terminais separados (recomendado para desenvolvimento)

**Terminal 1 - Backend:**
```bash
npm run dev
# Backend iniciará em http://localhost:3000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Frontend iniciará em http://localhost:5173
```

Acesse: `http://localhost:5173`

### Opção 2: Backend + Frontend HTML legado

```bash
npm run dev
# Acesse http://localhost:3000
```

## Estrutura do Projeto

```
api-negocia/
├── src/                    # Backend TypeScript
│   ├── index.ts           # Express server
│   ├── ChatEngine.ts      # IA conversacional
│   ├── CalculadoraAcordo.ts # Lógica de negociação
│   └── types.ts           # Tipos TypeScript
├── frontend/              # Frontend React novo
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── App.tsx        # App principal
│   │   └── types.ts       # Tipos do frontend
│   ├── vite.config.ts     # Config Vite + Proxy
│   └── package.json
├── public/                # Frontend HTML legado
│   └── index.html
└── package.json          # Backend package.json
```

## Scripts Disponíveis

### Backend (raiz)
```bash
npm run dev         # Dev com hot-reload
npm run build       # Compilar TypeScript
npm start           # Rodar versão compilada
npm test            # Rodar testes
npm run typecheck   # Verificar tipos
```

### Frontend (dentro de frontend/)
```bash
npm run dev         # Dev server Vite
npm run build       # Build de produção
npm run preview     # Preview do build
```

## URLs

- **Frontend React (dev)**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Frontend HTML legado**: http://localhost:3000

## APIs Disponíveis

- `POST /api/chat` - Enviar mensagem ao chatbot
- `POST /api/limpar-sessao` - Limpar histórico
- `GET /api/ofertas` - Ver ofertas atuais (debug)
- `GET /api/health` - Health check

## Troubleshooting

### Backend não inicia
- Verifique se o arquivo `.env` existe
- Confirme que a porta 3000 está livre
- Verifique se `API_KEY` está configurada

### Frontend não conecta ao backend
- Certifique-se de que o backend está rodando
- Verifique a configuração do proxy em `frontend/vite.config.ts`
- Limpe o cache: `rm -rf frontend/node_modules && cd frontend && npm install`

### Erros de TypeScript
```bash
npm run typecheck       # Verificar erros
cd frontend && npm run build  # Build frontend
```

## Design do Frontend React

O novo frontend é uma réplica moderna do WhatsApp Web:
- Interface dark com verde (#075E54, #128C7E, #25D366)
- Background com padrão doodle sutil
- Bolhas de mensagem: usuário verde claro, bot branco
- Animações suaves de entrada
- Totalmente responsivo
- Indicador de "digitando..." animado

## Próximos Passos

1. Configure suas variáveis de ambiente no `.env`
2. Inicie backend e frontend
3. Abra o navegador em `http://localhost:5173`
4. Comece a conversar com a LucIA!

Para mais detalhes:
- Backend: Leia `CLAUDE.md`
- Frontend: Leia `FRONTEND-README.md`
