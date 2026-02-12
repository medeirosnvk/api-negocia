# Mapa do Projeto - LucIA

## Estrutura Completa

```
api-negocia/
│
├── backend/                              # API Express + TypeScript
│   ├── src/
│   │   ├── core/                         # Logica de negocio
│   │   │   ├── ChatEngine.ts             # Motor de IA para negociacao
│   │   │   └── CalculadoraAcordo.ts      # Calculo de dividas e ofertas
│   │   ├── services/                     # Integracoes externas
│   │   │   ├── ApiService.ts             # API Cobrance
│   │   │   ├── RagService.ts             # RAG com Gemini embeddings
│   │   │   └── MessageBatchService.ts    # Processamento em lote
│   │   ├── types/index.ts                # Tipos TypeScript compartilhados
│   │   ├── config/config.example.ts      # Exemplos de configuracao
│   │   ├── data/conhecimento/            # Base de conhecimento RAG
│   │   │   ├── faq.md
│   │   │   ├── politicas.md
│   │   │   └── scripts-negociacao.md
│   │   ├── __tests__/                    # Testes Jest
│   │   │   └── CalculadoraAcordo.test.ts
│   │   └── index.ts                      # Servidor Express
│   ├── documentation/                    # Docs especificos do backend
│   │   ├── MIGRACAO.md                   # PHP <-> TypeScript
│   │   ├── CONVERSAO_COMPLETA.md
│   │   ├── CONVERSAO_FINAL.md
│   │   ├── CORRECAO_DEPRECATION.md
│   │   ├── RESUMO.md
│   │   └── RESUMO_CONVERSAO.md
│   ├── package.json                      # Dependencias backend
│   ├── tsconfig.json                     # Config TypeScript
│   ├── jest.config.js                    # Config Jest
│   └── .env                              # Variaveis de ambiente
│
├── frontend/                             # React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/                   # Componentes reutilizaveis
│   │   │   ├── ChatHeader.tsx
│   │   │   ├── ChatInput.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   ├── MessageList.tsx
│   │   │   └── TypingIndicator.tsx
│   │   ├── contexts/ThemeContext.tsx
│   │   ├── hooks/useTheme.ts
│   │   ├── screens/ChatScreen.tsx
│   │   ├── services/chatService.ts
│   │   ├── types/index.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── documentation/                    # Docs especificos do frontend
│   │   ├── FRONTEND-README.md
│   │   ├── VISUAL-GUIDE.md
│   │   ├── BEFORE-AFTER.md
│   │   ├── FRONTEND-CHECKLIST.md
│   │   ├── SUMMARY.md
│   │   └── README_FRONTEND.md
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── FEATURES.md
│   └── README-FRONTEND.md
│
├── documentation/                        # Docs gerais do projeto
│   ├── COMECE_AQUI.md                    # Start aqui (5 min)
│   ├── QUICK-START.md                    # Instalacao e execucao
│   ├── COMMANDS.md                       # Referencia de comandos
│   ├── DEPLOYMENT.md                     # Deploy em producao
│   ├── DOCUMENTACAO.md                   # Indice detalhado
│   ├── DOCS-INDEX.md                     # Indice geral
│   └── MAPA_PROJETO.md                   # Este arquivo
│
├── public/index.html                     # Interface legada
├── ecosystem.config.cjs                  # PM2 (producao)
├── package.json                          # Orquestrador raiz
├── CLAUDE.md                             # Instrucoes Claude Code
└── README.md                             # README principal
```

---

## Por Onde Comecar?

### 1. Primeiro Arquivo para Ler
-> **[COMECE_AQUI.md](./COMECE_AQUI.md)** (5 minutos)

### 2. Se Quer Entender Tudo
-> **[README.md](../README.md)** (10 minutos)

### 3. Se Quer Ver o Codigo Backend
-> `backend/src/types/index.ts` -> `backend/src/core/CalculadoraAcordo.ts` -> `backend/src/core/ChatEngine.ts`

### 4. Se Quer Ver o Codigo Frontend
-> `frontend/src/App.tsx` -> `frontend/src/screens/ChatScreen.tsx` -> `frontend/src/components/`

### 5. Se Quer Deploiar
-> **[DEPLOYMENT.md](./DEPLOYMENT.md)** (20 minutos)

### 6. Se Vem do PHP
-> **`backend/documentation/MIGRACAO.md`** (15 minutos)

---

## Documentacao por Tipo

### Quick Start
| Arquivo | Tempo | Conteudo |
|---------|-------|----------|
| [COMECE_AQUI.md](./COMECE_AQUI.md) | 5 min | Como comecar |
| [QUICK-START.md](./QUICK-START.md) | 5 min | Instalacao detalhada |

### Referencia
| Arquivo | Tempo | Conteudo |
|---------|-------|----------|
| [README.md](../README.md) | 10 min | Documentacao completa |
| [COMMANDS.md](./COMMANDS.md) | - | Referencia de comandos |
| [CLAUDE.md](../CLAUDE.md) | 10 min | Arquitetura detalhada |

### Deploy
| Arquivo | Tempo | Conteudo |
|---------|-------|----------|
| [DEPLOYMENT.md](./DEPLOYMENT.md) | 20 min | Deploy em producao |

---

## Fluxo de Navegacao

```
START
  |
[COMECE_AQUI.md]
  |
npm install (backend + frontend)
  |
npm run dev:backend + npm run dev:frontend
  |
http://localhost:5173
  |
+-- Entender?     -> [README.md]
+-- Comandos?     -> [COMMANDS.md]
+-- Do PHP?       -> backend/documentation/MIGRACAO.md
+-- Deploiar?     -> [DEPLOYMENT.md]
+-- Ver Backend?  -> backend/src/
+-- Ver Frontend? -> frontend/src/
+-- Mais Docs?    -> [DOCUMENTACAO.md]
```

---

## Estatisticas

| Item | Valor |
|------|-------|
| Pastas de documentacao | 3 (geral, backend, frontend) |
| Docs gerais | 7 arquivos |
| Docs backend | 6 arquivos |
| Docs frontend | 6 arquivos |
| Testes backend | Jest (13 testes) |
| Endpoints API | 5 |
| Tempo setup | 5 min |
