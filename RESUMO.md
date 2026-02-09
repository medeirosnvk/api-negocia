# Resumo das Principais Funcionalidades - LucIA API

Este é um **chatbot de negociação de dívidas** chamado **LucIA**, construído com Express.js e TypeScript.

## Componentes Principais

### 1. Motor de Chat (`src/ChatEngine.ts`)
- Orquestra conversas de negociação com IA via LLM
- Detecta intenção do usuário: mudanças de cadência, datas, restrições de orçamento
- Mantém histórico de conversa via sessão
- Identifica automaticamente quando acordo é fechado ("aceito", "fechado", "ok")

### 2. Calculadora de Acordo (`src/CalculadoraAcordo.ts`)
- Calcula totais de dívida com juros (3%/mês), multa (2%) e honorários (10%)
- Gera ofertas de parcelamento em 4 cadências: **mensal**, **semanal**, **quinzenal**, **diário**
- Ajusta datas para dias úteis (pula fins de semana)
- Adiciona taxa de boleto de R$11,90 por parcela

### 3. API REST (`src/index.ts`)

| Endpoint | Descrição |
|----------|-----------|
| `POST /api/chat` | Processa mensagem de negociação |
| `POST /api/limpar-sessao` | Limpa sessão e inicia nova conversa |
| `GET /api/ofertas` | Debug: visualiza ofertas e cadência atual |
| `GET /api/health` | Health check |

## Fluxo de Dados

```
Mensagem do usuário → Restaura sessão → Detecta intenção
→ Recalcula ofertas → LLM gera resposta empática → Retorna resposta
```

## Regras de Cálculo

- **Juros**: 3% ao mês (0,1% ao dia)
- **Multa**: 2% fixo sobre valor original
- **Honorários**: 10% sobre (principal + juros + multa)
- **Taxa boleto**: R$11,90 por parcela
- **Máximo de parcelas**: 10 (configurável)
