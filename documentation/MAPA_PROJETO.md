# 🗺️ Mapa do Projeto - LucIA TypeScript

## 📁 Estrutura Completa

```
api-negocia/
│
├── 📂 src/                              # Código-fonte TypeScript
│   ├── 📄 index.ts                      # 🎯 Servidor Express (start aqui)
│   ├── 📄 types.ts                      # 🔷 Tipos e interfaces
│   ├── 📄 CalculadoraAcordo.ts          # 💰 Lógica de cálculo
│   ├── 📄 ChatEngine.ts                 # 🤖 Motor de IA
│   ├── 📄 test.ts                       # 🧪 Testes automatizados
│   └── 📄 config.example.ts             # ⚙️ Exemplos de config
│
├── 📂 public/                           # Assets estáticos
│   └── 📄 index.html                    # 🎨 Interface web
│
├── 📄 exemplos.ts                       # 📚 Exemplos de API (7 exemplos)
│
├── 📚 Documentação/
│   ├── 📄 COMECE_AQUI.md                # ⭐ Start aqui (5 min)
│   ├── 📄 CONVERSAO_COMPLETA.md         # ✅ Resumo da conversão
│   ├── 📄 README.md                     # 📖 Documentação completa
│   ├── 📄 MIGRACAO.md                   # 🔄 PHP → TypeScript
│   ├── 📄 DEPLOYMENT.md                 # 🚀 Guia de produção
│   ├── 📄 RESUMO_CONVERSAO.md           # 📊 Resumo técnico
│   ├── 📄 DOCUMENTACAO.md               # 🗂️ Índice completo
│   └── 📄 (este arquivo)                # 🗺️ Mapa do projeto
│
├── ⚙️ Configuração/
│   ├── 📄 package.json                  # 📦 Dependências npm
│   ├── 📄 tsconfig.json                 # ⚙️ Config TypeScript
│   ├── 📄 .env.example                  # 🔑 Template de env
│   ├── 📄 .gitignore                    # 🚫 Git ignore
│
├── 📦 dist/                             # Build (gerado) → npm run build
├── 📦 node_modules/                    # Dependencies → npm install
│
└── 📄 Arquivos antigos (PHP)
    ├── api.php ⚪ (não use, ver src/index.ts)
    ├── CalculadoraAcordo.php ⚪ (não use, ver src/CalculadoraAcordo.ts)
    ├── ChatEngine.php ⚪ (não use, ver src/ChatEngine.ts)
    ├── index.php ⚪ (não use, ver public/index.html)
    ├── limpar_sessao.php ⚪ (não use, ver src/index.ts)
    ├── modelo_acordo_ia.json
    └── modelo_acordo_ia2.json
```

---

## 🎯 Por Onde Começar?

### 1️⃣ Primeiro Arquivo para Ler

→ **[COMECE_AQUI.md](./COMECE_AQUI.md)** (5 minutos) ⭐

### 2️⃣ Se Quer Entender Tudo

→ **[README.md](./README.md)** (20 minutos)

### 3️⃣ Se Quer Ver o Código

→ **[src/types.ts](./src/types.ts)** (tipos) → **[src/CalculadoraAcordo.ts](./src/CalculadoraAcordo.ts)** → **[src/ChatEngine.ts](./src/ChatEngine.ts)**

### 4️⃣ Se Quer Deploiar

→ **[DEPLOYMENT.md](./DEPLOYMENT.md)** (30 minutos)

### 5️⃣ Se Vem do PHP

→ **[MIGRACAO.md](./MIGRACAO.md)** (15 minutos)

---

## 📚 Documentação por Tipo

### 🚀 Quick Start

| Arquivo                            | Tempo  | Conteúdo          |
| ---------------------------------- | ------ | ----------------- |
| [COMECE_AQUI.md](./COMECE_AQUI.md) | 5 min  | Como começar      |
| [exemplos.ts](./exemplos.ts)       | 10 min | 7 exemplos de API |

### 📖 Referência

| Arquivo                                          | Tempo  | Conteúdo              |
| ------------------------------------------------ | ------ | --------------------- |
| [README.md](./README.md)                         | 20 min | Documentação completa |
| [DOCUMENTACAO.md](./DOCUMENTACAO.md)             | 10 min | Índice de docs        |
| [CONVERSAO_COMPLETA.md](./CONVERSAO_COMPLETA.md) | 5 min  | Resumo executivo      |

### 🔄 Migração

| Arquivo                                      | Tempo  | Conteúdo          |
| -------------------------------------------- | ------ | ----------------- |
| [MIGRACAO.md](./MIGRACAO.md)                 | 15 min | PHP vs TypeScript |
| [RESUMO_CONVERSAO.md](./RESUMO_CONVERSAO.md) | 10 min | Resumo técnico    |

### 🚀 Produção

| Arquivo                          | Tempo  | Conteúdo           |
| -------------------------------- | ------ | ------------------ |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | 30 min | Deploy em produção |

---

## 💻 Código TypeScript

### Arquivo Central

**[src/index.ts](./src/index.ts)** - Servidor Express

- Configuração do Express
- Endpoints REST
- Gerenciamento de sessão
- CORS e middleware
- ~140 linhas

### Lógica de Cálculo

**[src/CalculadoraAcordo.ts](./src/CalculadoraAcordo.ts)**

- Cálculo de dívidas
- Geração de ofertas
- Manipulação de datas
- 4 periodicidades
- ~180 linhas

### Motor de IA

**[src/ChatEngine.ts](./src/ChatEngine.ts)**

- Integração com LLM
- Histórico de conversa
- Detecção de cadência
- Recalculação dinâmica
- ~350 linhas

### Tipos Compartilhados

**[src/types.ts](./src/types.ts)**

- Interfaces TypeScript
- Tipos de dados
- Documentação automática
- ~50 linhas

### Testes

**[src/test.ts](./src/test.ts)**

- 8 testes de funcionamento
- Validação de cálculos
- Teste de ofertas
- ~120 linhas

### Exemplos

**[exemplos.ts](./exemplos.ts)**

- 7 exemplos de API
- Health check
- Negociação completa
- Teste de robustez
- ~200 linhas

---

## 🔧 Configuração

### Dependências

**[package.json](./package.json)**

- Express.js
- TypeScript
- Axios
- express-session

### Compilador

**[tsconfig.json](./tsconfig.json)**

- ES2020 target
- Strict mode ativado
- Source maps habilitados

### Variáveis de Ambiente

**[.env.example](./.env.example)**

- PORT
- API_KEY
- SESSION_SECRET
- NODE_ENV

### Git

**[.gitignore](./.gitignore)**

- node_modules
- dist
- .env
- IDE files

---

## 🎨 Interface Web

**[public/index.html](./public/index.html)**

- Chat interativo
- Tailwind CSS
- Responsivo
- Relatórios
- ~200 linhas

---

## 🧭 Fluxo de Navegação

```
START
  ↓
[COMECE_AQUI.md] ⭐
  ↓
npm install && npm run dev
  ↓
http://localhost:3000
  ↓
┌─ Entender?     → [README.md]
├─ Usar API?     → [exemplos.ts]
├─ Do PHP?       → [MIGRACAO.md]
├─ Deploiar?     → [DEPLOYMENT.md]
├─ Ver Código?   → [src/]
└─ Mais Docs?    → [DOCUMENTACAO.md]
```

---

## 🎓 Aprenda Progression

### Semana 1: Setup

1. Ler [COMECE_AQUI.md](./COMECE_AQUI.md)
2. Rodar `npm install && npm run dev`
3. Testar no navegador
4. Ler [README.md](./README.md)

### Semana 2: Entendimento

1. Estudar [src/types.ts](./src/types.ts)
2. Ler [src/CalculadoraAcordo.ts](./src/CalculadoraAcordo.ts)
3. Ler [src/ChatEngine.ts](./src/ChatEngine.ts)
4. Executar [exemplos.ts](./exemplos.ts)

### Semana 3: Integração

1. Ler [MIGRACAO.md](./MIGRACAO.md)
2. Modificar configurações
3. Testar com dados reais
4. Ler [src/index.ts](./src/index.ts)

### Semana 4: Produção

1. Ler [DEPLOYMENT.md](./DEPLOYMENT.md)
2. Setup em staging
3. Configurar SSL
4. Deploy em produção

---

## 📊 Estatísticas

| Item                | Valor      |
| ------------------- | ---------- |
| Arquivos TS criados | 5+         |
| Linhas de código    | ~870       |
| Documentação        | 8 arquivos |
| Exemplos            | 7          |
| Endpoints           | 3+         |
| Tipos               | 10+        |
| Testes              | 8+         |
| Tempo setup         | 5 min ⚡   |

---

## 🎯 Checklist de Desenvolvimento

### Setup

- [ ] Ler [COMECE_AQUI.md](./COMECE_AQUI.md)
- [ ] Executar `npm install`
- [ ] Rodar `npm run dev`
- [ ] Abrir http://localhost:3000

### Entendimento

- [ ] Ler [README.md](./README.md)
- [ ] Explorar `src/types.ts`
- [ ] Estudar `src/CalculadoraAcordo.ts`
- [ ] Analisar `src/ChatEngine.ts`

### Testes

- [ ] Executar `npx ts-node src/test.ts`
- [ ] Rodar exemplos: `npx ts-node exemplos.ts`
- [ ] Testar API manualmente
- [ ] Verificar interface web

### Customização

- [ ] Modificar `src/config.example.ts`
- [ ] Ajustar cálculos se necessário
- [ ] Personalizar interface HTML
- [ ] Adicionar endpoints customizados

### Deployment

- [ ] Ler [DEPLOYMENT.md](./DEPLOYMENT.md)
- [ ] Preparar servidor
- [ ] Build: `npm run build`
- [ ] Deploy e testar

---

## 🔗 Links Rápidos

| Link | Arquivo                                                | Tipo        |
| ---- | ------------------------------------------------------ | ----------- |
| ⭐   | [COMECE_AQUI.md](./COMECE_AQUI.md)                     | Quick Start |
| 📖   | [README.md](./README.md)                               | Referência  |
| 🔄   | [MIGRACAO.md](./MIGRACAO.md)                           | Mudanças    |
| 🚀   | [DEPLOYMENT.md](./DEPLOYMENT.md)                       | Produção    |
| 💻   | [src/index.ts](./src/index.ts)                         | Servidor    |
| 💰   | [src/CalculadoraAcordo.ts](./src/CalculadoraAcordo.ts) | Cálculo     |
| 🤖   | [src/ChatEngine.ts](./src/ChatEngine.ts)               | IA          |
| 🔷   | [src/types.ts](./src/types.ts)                         | Tipos       |
| 📚   | [exemplos.ts](./exemplos.ts)                           | Exemplos    |
| 🎨   | [public/index.html](./public/index.html)               | Web         |

---

## 💡 Tips & Tricks

### Desenvolvimento

```bash
npm run dev          # Hot reload
npm run build        # Compilar
npm run typecheck    # Apenas check de tipos
npx ts-node file.ts  # Rodar arquivo TS direto
```

### Testes

```bash
npx ts-node src/test.ts      # Validar cálculos
npx ts-node exemplos.ts      # Rodar 7 exemplos
curl http://localhost:3000/api/health  # Check server
```

### Debugging

```bash
npm run dev 2>&1 | grep -i error    # Ver erros
curl -v http://localhost:3000       # Verbose
```

---

## 🚨 Problema? Onde Procurar

| Problema                   | Solução                                  |
| -------------------------- | ---------------------------------------- |
| "Não sei por onde começar" | [COMECE_AQUI.md](./COMECE_AQUI.md)       |
| "Port em uso"              | Mude PORT em `.env`                      |
| "Cannot find module"       | `rm -rf node_modules && npm install`     |
| "Type error"               | Veja [src/types.ts](./src/types.ts)      |
| "API não responde"         | Verifique [src/index.ts](./src/index.ts) |
| "Quer deploiar?"           | Leia [DEPLOYMENT.md](./DEPLOYMENT.md)    |
| "Vem do PHP?"              | Estude [MIGRACAO.md](./MIGRACAO.md)      |
| "Precisa de exemplos?"     | Veja [exemplos.ts](./exemplos.ts)        |

---

## 📞 Suporte

1. **Documentação:** [DOCUMENTACAO.md](./DOCUMENTACAO.md)
2. **FAQ:** [COMECE_AQUI.md](./COMECE_AQUI.md)
3. **Código:** Veja `src/` com comentários
4. **Exemplos:** [exemplos.ts](./exemplos.ts)

---

## ✨ Estrutura Finalizada

```
✅ Código TypeScript completo
✅ Documentação extensa (8 arquivos)
✅ Exemplos funcionais (7)
✅ Testes automatizados
✅ Pronto para produção
✅ Interface moderna
✅ API RESTful
✅ Sessões persistentes
```

---

**Desenvolvido com ❤️ em TypeScript**

Última atualização: 26 de janeiro de 2026
