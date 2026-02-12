# Comandos Uteis - LucIA

Referencia rapida de comandos para desenvolvimento, build e deploy.

## Start Rapido

```bash
# Terminal 1: Backend
npm run dev:backend
# ou: cd backend && npm run dev

# Terminal 2: Frontend
npm run dev:frontend
# ou: cd frontend && npm run dev

# Acesse: http://localhost:5173
```

---

## Instalacao

### Primeira Vez

```bash
# Backend
cd backend && npm install && cd ..

# Frontend
cd frontend && npm install && cd ..
```

### Reinstalar (limpar cache)

```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install
cd ..

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
cd ..
```

---

## Desenvolvimento

### Backend (a partir da raiz)

```bash
npm run dev:backend     # Dev com hot-reload
npm run typecheck       # Type checking
npm test                # Rodar testes
```

### Backend (dentro de backend/)

```bash
cd backend

npm run dev             # Dev com hot-reload
npm run build           # Build TypeScript
npm start               # Rodar versao compilada
npm run typecheck       # Type checking
npm test                # Rodar testes
npm run test:watch      # Testes em watch mode
npm run test:coverage   # Coverage
```

### Frontend (dentro de frontend/)

```bash
cd frontend

npm run dev             # Dev server (porta 5173)
npm run build           # Build de producao
npm run preview         # Preview do build
npm run lint            # Lint
npx tsc --noEmit        # Type checking
```

---

## Build

### Desenvolvimento

```bash
# Backend
cd backend && npm run build

# Frontend
cd frontend && npm run build
```

### Producao (tudo de uma vez)

```bash
# Da raiz
npm run build    # Compila backend + frontend
npm run deploy   # Build + pm2 restart
```

---

## Testes

### Backend

```bash
cd backend

# Todos os testes
npm test

# Arquivo especifico
npx jest src/__tests__/CalculadoraAcordo.test.ts

# Watch mode
npm run test:watch

# Com coverage
npm run test:coverage
```

---

## Debug

### Verificar Portas

```bash
# Backend (porta 3001)
lsof -i :3001

# Frontend (porta 5173)
lsof -i :5173

# Matar processo na porta
kill -9 $(lsof -t -i:3001)
```

### Diagnostico

```bash
# Versoes
node --version
npm --version

# Dependencias do backend
cd backend && npm list --depth=0

# Dependencias do frontend
cd frontend && npm list --depth=0
```

---

## Tailwind (Frontend)

### Rebuild CSS

```bash
cd frontend
rm -rf node_modules/.vite
npm run dev
```

### Configuracao

```bash
# Editar cores/tema
frontend/tailwind.config.js

# Editar estilos globais
frontend/src/index.css
```

---

## Manutencao

### Atualizar Dependencias

```bash
# Backend
cd backend
npm outdated
npm update

# Frontend
cd frontend
npm outdated
npm update
```

### Verificar Seguranca

```bash
# Backend
cd backend && npm audit && npm audit fix

# Frontend
cd frontend && npm audit && npm audit fix
```

---

## Deploy

### Build Final

```bash
# Tudo de uma vez (da raiz)
npm run build

# Resultado:
# - Backend: backend/dist/
# - Frontend: frontend/dist/
```

### PM2 (Producao)

```bash
# Iniciar com ecosystem
pm2 start ecosystem.config.cjs

# Restart
pm2 restart ecosystem.config.cjs

# Logs
pm2 logs

# Deploy completo
npm run deploy
```

### Docker (Backend)

```bash
cat > backend/Dockerfile <<'EOF'
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
CMD ["node", "dist/index.js"]
EOF

cd backend
docker build -t lucia-api .
docker run -p 3001:3001 lucia-api
```

---

## Troubleshooting

### Erro: "Cannot find module"

```bash
# Backend
cd backend && npm install

# Frontend
cd frontend && npm install
```

### Erro: "Port already in use"

```bash
kill -9 $(lsof -t -i:3001)
# Ou mude a porta em backend/.env
```

### Erro: TypeScript compilation

```bash
cd backend
npm run typecheck
rm -rf dist node_modules
npm install
npm run build
```

### Frontend nao conecta ao backend

```bash
# 1. Verificar backend rodando
curl http://localhost:3001/api/health

# 2. Verificar proxy no vite.config.ts
cat frontend/vite.config.ts

# 3. Reiniciar frontend
cd frontend && npm run dev
```

### Estilos Tailwind nao aparecem

```bash
cd frontend
rm -rf node_modules/.vite
npm install
npm run dev
```

---

## Variaveis de Ambiente

### Backend (`backend/.env`)

```env
PORT=3001
API_KEY=your-llm-api-key
SESSION_SECRET=your-secret-key
NODE_ENV=development
```

---

## Atalhos Uteis

```bash
# Full restart
npm run dev:backend &
npm run dev:frontend

# Build tudo
npm run build

# Limpar tudo
rm -rf backend/node_modules backend/dist frontend/node_modules frontend/dist

# Reinstalar tudo
cd backend && npm install && cd ../frontend && npm install && cd ..
```

---

## Git

### Commit

```bash
git add .
git commit -m "feat: descricao da mudanca"
git push origin main
```

### Branches

```bash
git checkout -b feature/nova-feature
git checkout main
git merge feature/nova-feature
```
