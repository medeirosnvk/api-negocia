# Comece Aqui - Quick Start Guide

Bem-vindo ao projeto **LucIA** - chatbot de negociacao de dividas com IA!

## Inicio Rapido (5 minutos)

### 1. Instalar dependencias

```bash
# Backend
cd backend && npm install && cd ..

# Frontend
cd frontend && npm install && cd ..
```

### 2. Configurar ambiente

Crie `backend/.env`:

```env
PORT=3001
API_KEY=sua-chave-api
SESSION_SECRET=chave-secreta-desenvolvimento
NODE_ENV=development
```

### 3. Rodar em desenvolvimento

```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```

### 4. Abrir no navegador

```
http://localhost:5173
```

Pronto! A interface estara disponivel.

---

## Documentacao Completa

- **[README.md](../README.md)** - Visao geral, estrutura, endpoints
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Como colocar em producao
- **[COMMANDS.md](./COMMANDS.md)** - Referencia de comandos
- **Backend docs**: `backend/documentation/` - Migracao PHP->TS
- **Frontend docs**: `frontend/documentation/` - Design, componentes

---

## Estrutura do Projeto

```
api-negocia/
├── backend/                    # API Express + TypeScript
│   ├── src/
│   │   ├── core/               # ChatEngine, CalculadoraAcordo
│   │   ├── services/           # ApiService, RagService
│   │   ├── types/index.ts      # Tipos compartilhados
│   │   ├── data/conhecimento/  # Base de conhecimento RAG
│   │   ├── __tests__/          # Testes Jest
│   │   └── index.ts            # Servidor Express
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
├── frontend/                   # React + Vite + Tailwind
│   ├── src/
│   │   ├── components/         # ChatHeader, ChatInput, etc.
│   │   ├── screens/            # ChatScreen
│   │   └── App.tsx
│   └── package.json
├── documentation/              # Docs gerais (este arquivo)
├── package.json                # Orquestrador raiz
└── ecosystem.config.cjs        # PM2 (producao)
```

---

## Principais Comandos

| Comando                | Funcao                          |
| ---------------------- | ------------------------------- |
| `npm run dev:backend`  | Inicia backend (hot-reload)     |
| `npm run dev:frontend` | Inicia frontend (Vite)          |
| `npm run build`        | Compila backend + frontend      |
| `npm run deploy`       | Build + pm2 restart             |
| `npm test`             | Roda testes do backend          |
| `npm run typecheck`    | Verifica tipos do backend       |

---

## O que foi implementado?

### Backend
- Tipagem completa com TypeScript strict
- Modularizacao: `core/`, `services/`, `types/`
- Motor de IA com deteccao de intencao
- Calculadora de acordos com 4 cadencias
- RAG com embeddings Gemini
- Testes automatizados com Jest
- API RESTful com sessoes

### Frontend
- Interface WhatsApp-like com React
- Design system com Tailwind CSS
- Componentes reutilizaveis
- Indicador de digitacao animado
- Tema dark/light
- Totalmente responsivo

---

## Testar a Aplicacao

### Teste 1: Health check

```bash
curl http://localhost:3001/api/health
```

### Teste 2: Negociacao basica

```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"mensagem": "Qual e a primeira opcao?"}'
```

### Teste 3: Rodar testes unitarios

```bash
cd backend && npm test
```

---

## Problemas Comuns

### Porta em uso

```bash
# Mude a porta em backend/.env
PORT=3002

# Ou mate o processo
lsof -i :3001
kill -9 <PID>
```

### "Cannot find module"

```bash
cd backend && rm -rf node_modules && npm install
```

### Frontend nao conecta ao backend

- Certifique-se que o backend esta rodando
- Verifique o proxy em `frontend/vite.config.ts`

---

## Proximos Passos

1. Explore a interface em `http://localhost:5173`
2. Leia o [README.md](../README.md) para entender a arquitetura
3. Veja os [COMMANDS.md](./COMMANDS.md) para referencia de comandos
4. Consulte [DEPLOYMENT.md](./DEPLOYMENT.md) para deploy

---

**Projeto:** LucIA - Negociador de Dividas com IA
**Status:** Totalmente funcional (backend + frontend)
