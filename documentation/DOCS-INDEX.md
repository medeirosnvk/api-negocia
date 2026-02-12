# Indice de Documentacao - LucIA

Guia completo de toda a documentacao disponivel no projeto.

---

## Start Rapido (Leia Primeiro!)

### 1. [QUICK-START.md](./QUICK-START.md)
Para desenvolvedores que querem rodar o projeto AGORA.

### 2. [COMMANDS.md](./COMMANDS.md)
Referencia rapida de todos os comandos.

---

## Documentacao por Area

### Geral (esta pasta: `documentation/`)

| Arquivo | Conteudo |
|---------|----------|
| [COMECE_AQUI.md](./COMECE_AQUI.md) | Quick start em 5 minutos |
| [QUICK-START.md](./QUICK-START.md) | Guia de instalacao e execucao |
| [COMMANDS.md](./COMMANDS.md) | Referencia de comandos |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Deploy em producao |
| [DOCUMENTACAO.md](./DOCUMENTACAO.md) | Indice detalhado de docs |
| [MAPA_PROJETO.md](./MAPA_PROJETO.md) | Mapa visual do projeto |
| Este arquivo | Indice geral |

### Backend (`backend/documentation/`)

| Arquivo | Conteudo |
|---------|----------|
| CONVERSAO_COMPLETA.md | Resumo da conversao PHP -> TS |
| CONVERSAO_FINAL.md | Detalhes finais da conversao |
| CORRECAO_DEPRECATION.md | Correcoes de APIs deprecadas |
| MIGRACAO.md | Mapeamento PHP <-> TypeScript |
| RESUMO.md | Resumo da arquitetura backend |
| RESUMO_CONVERSAO.md | Resumo tecnico da conversao |

### Frontend (`frontend/documentation/`)

| Arquivo | Conteudo |
|---------|----------|
| BEFORE-AFTER.md | Comparacao HTML vs React |
| FRONTEND-CHECKLIST.md | Checklist de implementacao |
| FRONTEND-README.md | Guia completo do frontend |
| README_FRONTEND.md | Docs locais do frontend |
| SUMMARY.md | Resumo executivo frontend |
| VISUAL-GUIDE.md | Guia visual de componentes |

### Outros

| Arquivo | Conteudo |
|---------|----------|
| [README.md](../README.md) | README principal do projeto |
| [CLAUDE.md](../CLAUDE.md) | Instrucoes para Claude Code |
| [frontend/FEATURES.md](../frontend/FEATURES.md) | Lista de features do frontend |
| [frontend/README-FRONTEND.md](../frontend/README-FRONTEND.md) | README do frontend |

---

## Fluxo de Leitura Recomendado

### Para Desenvolvedores (Primeira Vez)

1. **[QUICK-START.md](./QUICK-START.md)** - Rode o projeto em 5 min
2. **[README.md](../README.md)** - Entenda a arquitetura
3. **[COMMANDS.md](./COMMANDS.md)** - Salve como referencia
4. **[frontend/FEATURES.md](../frontend/FEATURES.md)** - Features do frontend

### Para Product Owners / Stakeholders

1. **[README.md](../README.md)** - Visao geral
2. **`frontend/documentation/SUMMARY.md`** - Resumo executivo
3. **`frontend/documentation/BEFORE-AFTER.md`** - Evolucao

### Para Manutencao / Debug

1. **[COMMANDS.md](./COMMANDS.md)** - Troubleshooting
2. **[CLAUDE.md](../CLAUDE.md)** - Arquitetura detalhada
3. **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deploy e monitoramento

### Para quem vem do PHP

1. **`backend/documentation/MIGRACAO.md`** - Mapeamento PHP <-> TS
2. **`backend/documentation/RESUMO_CONVERSAO.md`** - O que mudou
3. **[README.md](../README.md)** - Nova arquitetura

---

## Estrutura Visual

```
api-negocia/
│
├── documentation/              # Docs gerais (VOCE ESTA AQUI)
│   ├── COMECE_AQUI.md          Start em 5 minutos
│   ├── QUICK-START.md          Instalacao e execucao
│   ├── COMMANDS.md             Referencia de comandos
│   ├── DEPLOYMENT.md           Deploy em producao
│   ├── DOCUMENTACAO.md         Indice detalhado
│   ├── MAPA_PROJETO.md         Mapa visual
│   └── DOCS-INDEX.md           Este arquivo
│
├── backend/documentation/      # Docs do backend
│   ├── MIGRACAO.md             PHP -> TypeScript
│   ├── CONVERSAO_*.md          Detalhes da conversao
│   └── RESUMO*.md              Resumos tecnicos
│
├── frontend/documentation/     # Docs do frontend
│   ├── FRONTEND-README.md      Guia do frontend
│   ├── VISUAL-GUIDE.md         Guia visual
│   ├── BEFORE-AFTER.md         Antes vs Depois
│   └── FRONTEND-CHECKLIST.md   Checklist
│
├── README.md                   README principal
└── CLAUDE.md                   Instrucoes Claude Code
```

---

## Referencia Rapida por Topico

### Arquitetura
- [README.md](../README.md) - Estrutura e fluxo de dados
- [CLAUDE.md](../CLAUDE.md) - Arquitetura detalhada

### Execucao
- [QUICK-START.md](./QUICK-START.md) - Como executar
- [COMMANDS.md](./COMMANDS.md) - Todos os comandos

### Build & Deploy
- [COMMANDS.md](./COMMANDS.md) - Comandos de build
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deploy em producao

### Testes
- [CLAUDE.md](../CLAUDE.md) - Secao "Testing"
- [COMMANDS.md](./COMMANDS.md) - Secao "Testes"

### Troubleshooting
- [COMMANDS.md](./COMMANDS.md) - Secao "Troubleshooting"
- [QUICK-START.md](./QUICK-START.md) - Secao "Troubleshooting"
