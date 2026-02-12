# Indice de Documentacao - LucIA

Bem-vindo! Este arquivo lista toda a documentacao do projeto.

## Comece Aqui

1. **[COMECE_AQUI.md](./COMECE_AQUI.md)** - Guia quick start (5 minutos)
2. **[QUICK-START.md](./QUICK-START.md)** - Instalacao e execucao detalhada

## Documentacao Principal

### [README.md](../README.md)
- Visao geral do projeto
- Estrutura de pastas (monorepo)
- Instalacao e comandos
- Endpoints da API
- Fluxo de dados
- Logica de negociacao

### [CLAUDE.md](../CLAUDE.md)
- Arquitetura detalhada
- Build & Development
- Testing
- Code conventions
- Environment variables

### [DEPLOYMENT.md](./DEPLOYMENT.md)
- Instrucoes de producao
- Setup de servidor Linux
- PM2 e Systemd
- Nginx como reverse proxy
- SSL/TLS (Let's Encrypt)
- Seguranca e monitoramento

### [COMMANDS.md](./COMMANDS.md)
- Todos os comandos de dev/build/deploy
- Troubleshooting
- Atalhos uteis

## Codigo-Fonte

### Backend (`backend/src/`)

**backend/src/types/index.ts**
- Interfaces e tipos compartilhados: Divida, ConfiguracaoAcordo, OfertaCalculada, MensagemChat

**backend/src/core/CalculadoraAcordo.ts**
- Calculo de dividas projetadas
- Geracao de ofertas com 4 periodicidades
- Manipulacao de datas e dias uteis

**backend/src/core/ChatEngine.ts**
- Motor de negociacao com IA
- Deteccao de cadencia e intencao
- Historico de conversa via sessao
- Integracao com LLM (Gemini)

**backend/src/services/ApiService.ts**
- Integracao com API Cobrance
- Validacao de credenciais

**backend/src/services/RagService.ts**
- RAG com embeddings Gemini
- Vector store em memoria

**backend/src/index.ts**
- Servidor Express
- Endpoints REST
- Gerenciamento de sessao

### Frontend (`frontend/src/`)

**frontend/src/components/**
- ChatHeader, ChatInput, MessageBubble, MessageList, TypingIndicator

**frontend/src/screens/ChatScreen.tsx**
- Tela principal do chat

**frontend/src/App.tsx**
- Root com ThemeProvider

### Configuracao

**backend/package.json** - Dependencias e scripts do backend
**frontend/package.json** - Dependencias e scripts do frontend
**package.json (raiz)** - Orquestrador com scripts de conveniencia
**backend/tsconfig.json** - Compilacao TypeScript
**ecosystem.config.cjs** - PM2 para producao

## Documentacao Especifica

### Backend (`backend/documentation/`)
- MIGRACAO.md - Mapeamento PHP <-> TypeScript
- CONVERSAO_COMPLETA.md - Resumo da conversao
- CONVERSAO_FINAL.md - Detalhes finais
- CORRECAO_DEPRECATION.md - Correcoes de APIs deprecadas
- RESUMO.md - Resumo da arquitetura
- RESUMO_CONVERSAO.md - Resumo tecnico

### Frontend (`frontend/documentation/`)
- FRONTEND-README.md - Guia completo do frontend
- VISUAL-GUIDE.md - Guia visual de componentes
- BEFORE-AFTER.md - Comparacao HTML vs React
- FRONTEND-CHECKLIST.md - Checklist de implementacao
- SUMMARY.md - Resumo executivo
- README_FRONTEND.md - Docs locais

## Guias Tematicos

### Para Iniciantes
1. Leia [COMECE_AQUI.md](./COMECE_AQUI.md)
2. Execute `cd backend && npm install && cd ../frontend && npm install`
3. Rode `npm run dev:backend` e `npm run dev:frontend`
4. Abra http://localhost:5173

### Para Desenvolvedores
1. Estude [CLAUDE.md](../CLAUDE.md) - Arquitetura
2. Explore `backend/src/types/index.ts` - Tipos
3. Leia `backend/src/core/CalculadoraAcordo.ts` - Logica
4. Estude `backend/src/core/ChatEngine.ts` - IA

### Para DevOps/Producao
1. Leia [DEPLOYMENT.md](./DEPLOYMENT.md)
2. Configure PM2 com `ecosystem.config.cjs`
3. Setup Nginx + SSL
4. Monitore com `pm2 logs`

### Para quem vem do PHP
1. Veja `backend/documentation/MIGRACAO.md`
2. Leia `backend/documentation/RESUMO_CONVERSAO.md`

## Tarefas Comuns

**"Como iniciar desenvolvimento?"** -> [COMECE_AQUI.md](./COMECE_AQUI.md)

**"Quais sao os endpoints?"** -> [README.md](../README.md#endpoints-da-api)

**"Como deploiar?"** -> [DEPLOYMENT.md](./DEPLOYMENT.md)

**"Como testar?"** -> `cd backend && npm test`

**"Como era em PHP?"** -> `backend/documentation/MIGRACAO.md`

**"Como funciona o frontend?"** -> `frontend/documentation/FRONTEND-README.md`
