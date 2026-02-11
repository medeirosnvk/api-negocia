# Comandos Úteis - LucIA Frontend React

Referência rápida de comandos para desenvolvimento, build e deploy.

## 🚀 Start Rápido

```bash
# Terminal 1: Backend
npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev

# Acesse: http://localhost:5173
```

---

## 📦 Instalação

### Primeira Vez

```bash
# Backend
npm install

# Frontend
cd frontend
npm install
cd ..
```

### Reinstalar (limpar cache)

```bash
# Backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
cd ..
```

---

## 🛠️ Desenvolvimento

### Backend

```bash
# Dev com hot-reload
npm run dev

# Build TypeScript
npm run build

# Rodar versão compilada
npm start

# Type checking
npm run typecheck

# Rodar testes
npm test

# Testes em watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

### Frontend

```bash
cd frontend

# Dev server (porta 5173)
npm run dev

# Build de produção
npm run build

# Preview do build
npm run preview

# Lint
npm run lint

# Type checking
npx tsc --noEmit
```

---

## 🏗️ Build

### Desenvolvimento

```bash
# Backend
npm run build

# Frontend
cd frontend && npm run build
```

### Produção (otimizado)

```bash
# Frontend
cd frontend
NODE_ENV=production npm run build
# Output: frontend/dist/

# Backend
npm run build
# Output: dist/
```

---

## 🧪 Testes

### Backend

```bash
# Todos os testes
npm test

# Arquivo específico
npx jest src/__tests__/CalculadoraAcordo.test.ts

# Watch mode
npm run test:watch

# Com coverage
npm run test:coverage
```

### Frontend (configurar no futuro)

```bash
cd frontend

# Unit tests (Vitest)
npm run test

# E2E tests (Playwright)
npm run test:e2e
```

---

## 🔍 Debug

### Verificar Portas

```bash
# Backend (deve estar em 3000)
lsof -i :3000

# Frontend (deve estar em 5173)
lsof -i :5173

# Matar processo na porta 3000
kill -9 $(lsof -t -i:3000)
```

### Ver Logs

```bash
# Backend logs
npm run dev | tee backend.log

# Frontend logs
cd frontend && npm run dev | tee frontend.log
```

### Diagnóstico

```bash
# Versões
node --version
npm --version

# Dependências do backend
npm list --depth=0

# Dependências do frontend
cd frontend && npm list --depth=0

# Verificar TypeScript
npx tsc --version

# Verificar build
cd frontend && npm run build -- --debug
```

---

## 🎨 Tailwind

### Rebuild CSS

```bash
cd frontend

# Force rebuild
rm -rf node_modules/.vite
npm run dev
```

### Ver classes geradas

```bash
cd frontend
npx tailwindcss -o output.css --watch
```

### Configuração

```bash
# Editar cores
vim tailwind.config.js

# Editar estilos globais
vim src/index.css
```

---

## 📊 Análise

### Bundle Size

```bash
cd frontend

# Build e ver tamanhos
npm run build

# Análise detalhada
npm install -D rollup-plugin-visualizer
# Adicionar ao vite.config.ts:
# import { visualizer } from 'rollup-plugin-visualizer'
# plugins: [react(), visualizer()]
```

### Performance

```bash
# Lighthouse
npx lighthouse http://localhost:5173 --view

# Web Vitals
npm install -D web-vitals
```

---

## 🔧 Manutenção

### Atualizar Dependências

```bash
# Backend
npm outdated
npm update

# Frontend
cd frontend
npm outdated
npm update
```

### Limpar Cache

```bash
# Frontend (Vite cache)
cd frontend
rm -rf node_modules/.vite
rm -rf dist

# Backend (build cache)
rm -rf dist
```

### Verificar Segurança

```bash
# Backend
npm audit
npm audit fix

# Frontend
cd frontend
npm audit
npm audit fix
```

---

## 🚢 Deploy

### Build Final

```bash
# Backend
npm run build

# Frontend
cd frontend
npm run build

# Resultado:
# - Backend: dist/
# - Frontend: frontend/dist/
```

### Deploy Vercel (Frontend)

```bash
cd frontend

# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production
vercel --prod
```

### Deploy Backend (Heroku exemplo)

```bash
# Login
heroku login

# Criar app
heroku create lucia-api

# Deploy
git push heroku main

# Ver logs
heroku logs --tail
```

### Docker

```bash
# Backend Dockerfile
cat > Dockerfile <<'EOF'
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
CMD ["node", "dist/index.js"]
EOF

# Build
docker build -t lucia-api .

# Run
docker run -p 3000:3000 lucia-api
```

---

## 🐛 Troubleshooting

### Erro: "Cannot find module"

```bash
# Backend
npm install

# Frontend
cd frontend && npm install
```

### Erro: "Port 3000 already in use"

```bash
# Matar processo
kill -9 $(lsof -t -i:3000)

# Ou mudar porta no .env
echo "PORT=3001" >> .env
```

### Erro: TypeScript compilation

```bash
# Verificar erros
npm run typecheck

# Limpar e rebuildar
rm -rf dist node_modules
npm install
npm run build
```

### Frontend não conecta ao backend

```bash
# 1. Verificar backend rodando
curl http://localhost:3000/api/health

# 2. Verificar proxy no vite.config.ts
cat frontend/vite.config.ts

# 3. Reiniciar frontend
cd frontend
pkill -f vite
npm run dev
```

### Estilos Tailwind não aparecem

```bash
cd frontend

# 1. Verificar config
cat tailwind.config.js

# 2. Limpar cache
rm -rf node_modules/.vite

# 3. Reinstalar
npm install

# 4. Rebuild
npm run dev
```

---

## 📝 Git

### Commit

```bash
# Add files
git add .

# Commit
git commit -m "feat: add React frontend with WhatsApp design"

# Push
git push origin main
```

### Branches

```bash
# Criar branch
git checkout -b feature/frontend-react

# Mudar branch
git checkout main

# Merge
git merge feature/frontend-react
```

---

## 🔐 Variáveis de Ambiente

### Backend (.env)

```bash
# Criar .env
cat > .env <<'EOF'
PORT=3001
API_KEY=your-llm-api-key
SESSION_SECRET=your-secret-key
NODE_ENV=development
EOF
```

### Frontend (.env.local)

```bash
cd frontend

# Criar .env.local
cat > .env.local <<'EOF'
VITE_API_URL=http://localhost:3000
EOF
```

---

## 📚 Documentação

### Gerar Docs

```bash
# TypeDoc (backend)
npm install -D typedoc
npx typedoc --out docs src

# Componentes (Storybook)
cd frontend
npx storybook@latest init
npm run storybook
```

### Ver Docs

```bash
# Abrir README
open FRONTEND-README.md

# Abrir guia rápido
open QUICK-START.md

# Ver checklist
open FRONTEND-CHECKLIST.md
```

---

## 🎯 Atalhos Úteis

```bash
# Full restart (tudo de uma vez)
killall node && npm run dev & cd frontend && npm run dev

# Build tudo
npm run build && cd frontend && npm run build

# Limpar tudo
rm -rf node_modules dist frontend/node_modules frontend/dist

# Reinstalar tudo
npm install && cd frontend && npm install
```

---

## 📱 Mobile Testing

### iOS Simulator

```bash
# Abrir no iPhone
open -a Simulator

# No Safari do iOS, acesse:
# http://[seu-ip]:5173
```

### Android Emulator

```bash
# Iniciar emulador
emulator -avd Pixel_5_API_30

# No Chrome do Android, acesse:
# http://10.0.2.2:5173
```

### Device Real

```bash
# Descobrir seu IP
ifconfig | grep "inet " | grep -v 127.0.0.1

# Acesse no celular:
# http://[seu-ip]:5173
```

---

**Dica:** Salve este arquivo como favorito no seu editor para acesso rápido aos comandos!
