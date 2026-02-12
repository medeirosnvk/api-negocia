# LucIA - Negociador de Dividas com IA

Chatbot de negociacao de dividas com IA, construido com Express.js + TypeScript (backend) e React + Tailwind CSS (frontend).

## Estrutura do Projeto

```
api-negocia/
├── backend/                        # API Express + TypeScript
│   ├── src/
│   │   ├── core/                   # Logica de negocio
│   │   │   ├── ChatEngine.ts       # Motor de IA para negociacao
│   │   │   └── CalculadoraAcordo.ts # Calculo de dividas e ofertas
│   │   ├── services/               # Integracoes externas
│   │   │   ├── ApiService.ts       # API Cobrance
│   │   │   ├── RagService.ts       # RAG com Gemini embeddings
│   │   │   └── MessageBatchService.ts
│   │   ├── types/index.ts          # Tipos TypeScript compartilhados
│   │   ├── config/                 # Exemplos de configuracao
│   │   ├── data/conhecimento/      # Base de conhecimento RAG (.md)
│   │   ├── __tests__/              # Testes Jest
│   │   └── index.ts                # Servidor Express
│   ├── package.json
│   ├── tsconfig.json
│   ├── jest.config.js
│   └── .env                        # Variaveis de ambiente (nao versionado)
│
├── frontend/                       # React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/             # ChatHeader, ChatInput, MessageBubble, etc.
│   │   ├── contexts/               # ThemeContext
│   │   ├── hooks/                  # useTheme
│   │   ├── screens/                # ChatScreen
│   │   ├── services/               # chatService
│   │   └── types/index.ts          # Tipos do frontend
│   ├── package.json
│   └── vite.config.ts
│
├── documentation/                  # Documentacao geral do projeto
├── public/                         # Assets estaticos legados
├── ecosystem.config.cjs            # PM2 config (producao)
├── package.json                    # Orquestrador (scripts raiz)
└── CLAUDE.md                       # Instrucoes para Claude Code
```

## Inicio Rapido

### Pre-requisitos

- Node.js 18+
- npm

### Instalacao

```bash
# Backend
cd backend && npm install && cd ..

# Frontend
cd frontend && npm install && cd ..
```

### Configuracao

Crie `backend/.env`:

```env
PORT=3001
API_KEY=sua-chave-llm
SESSION_SECRET=sua-chave-secreta
NODE_ENV=development
```

### Desenvolvimento

```bash
# Terminal 1 - Backend (porta 3001)
npm run dev:backend

# Terminal 2 - Frontend (porta 5173)
npm run dev:frontend
```

Acesse: `http://localhost:5173`

### Build para producao

```bash
npm run build    # Compila backend + frontend
npm run deploy   # Build + pm2 restart
```

## Endpoints da API

### POST `/api/chat`

Processa uma mensagem de negociacao.

```json
// Request
{ "mensagem": "Qual e o valor a vista?" }

// Response
{ "resposta": "Ola! O valor a vista e...", "status": "negociando" }
```

### POST `/api/limpar-sessao`

Limpa o historico e inicia nova conversa.

### POST `/api/formalizar-acordo`

Formaliza o acordo aceito pelo devedor.

### GET `/api/ofertas`

Debug: visualiza ofertas e cadencia atuais.

### GET `/api/health`

Health check do servidor.

## Scripts Disponiveis

### Raiz (orquestrador)

| Comando              | Funcao                           |
| -------------------- | -------------------------------- |
| `npm run dev:backend`  | Inicia backend em desenvolvimento  |
| `npm run dev:frontend` | Inicia frontend em desenvolvimento |
| `npm run build`        | Build backend + frontend           |
| `npm run deploy`       | Build + pm2 restart                |
| `npm test`             | Roda testes do backend             |
| `npm run typecheck`    | Verifica tipos do backend          |

### Backend (`cd backend`)

| Comando              | Funcao                          |
| -------------------- | ------------------------------- |
| `npm run dev`        | Dev com hot-reload (tsx watch)  |
| `npm run build`      | Compila TypeScript              |
| `npm start`          | Roda versao compilada           |
| `npm test`           | Roda testes Jest                |
| `npm run typecheck`  | Verifica tipos sem compilar     |

### Frontend (`cd frontend`)

| Comando              | Funcao                          |
| -------------------- | ------------------------------- |
| `npm run dev`        | Dev server Vite (porta 5173)    |
| `npm run build`      | Build de producao               |
| `npm run preview`    | Preview do build                |

## Logica de Negociacao

A IA (LucIA) segue esta estrategia:

1. **Abertura**: Apresenta opcao a vista
2. **Sondagem**: Pergunta se cliente prefere a vista ou parcelado
3. **Flexibilizacao**:
   - Se pedir semanal/quinzenal -> recalcula ofertas
   - Se falar de valores -> encontra opcao que cabe no orcamento
   - Se pedir adiamento -> posterga ate data maxima
4. **Fechamento**: Ao aceitar, formaliza acordo

## Fluxo de Dados

```
Frontend React (localhost:5173)
    |
POST /api/chat {mensagem}
    |
Express Server (backend/src/index.ts)
    |
ChatEngine.enviarMensagem()
    |-- Detecta cadencia/data
    |-- CalculadoraAcordo.gerarOfertas()
    |-- Envia para LLM com historico e ofertas
    |-- Retorna {resposta, status}
    |
Frontend renderiza resposta
    |
Sessao salva no servidor
```

## Documentacao

| Pasta                      | Conteudo                                   |
| -------------------------- | ------------------------------------------ |
| `documentation/`           | Docs gerais: quick start, deploy, comandos |
| `backend/documentation/`   | Migracao PHP->TS, conversao, arquitetura   |
| `frontend/documentation/`  | Design, componentes React, checklist       |

### Leitura recomendada

1. Este README - Visao geral
2. `documentation/QUICK-START.md` - Rodar em 5 minutos
3. `documentation/COMMANDS.md` - Referencia de comandos
4. `documentation/DEPLOYMENT.md` - Deploy em producao

## Licenca

MIT
