# LucIA - Negociador de Dívidas com IA

Converção completa de PHP para TypeScript com melhorias arquiteturais e de funcionamento.

## 📁 Estrutura do Projeto

```
api-negocia/
├── src/
│   ├── index.ts                 # Servidor Express principal
│   ├── types.ts                 # Tipos e interfaces TypeScript
│   ├── CalculadoraAcordo.ts     # Lógica de cálculo de valores e ofertas
│   └── ChatEngine.ts            # Motor de negociação com integração LLM
├── public/
│   └── index.html               # Interface web
├── package.json                 # Dependências
├── tsconfig.json                # Configuração TypeScript
└── .env.example                 # Variáveis de ambiente
```

## 🚀 Instalação e Execução

### Pré-requisitos

- Node.js 16+
- npm ou yarn

### Instalação

```bash
cd /Users/kevinmedeiros/Enterprise/Cobrance/api-negocia
npm install
```

### Desenvolvimento (com hot-reload)

```bash
npm run dev
```

Acesse: `http://localhost:3000`

### Build para produção

```bash
npm run build
npm start
```

## 🔑 Variáveis de Ambiente

Crie um arquivo `.env`:

```
PORT=3000
API_KEY=s2_33e5d129dcd84178afca14a2f05f954a
```

## 📝 Alterações Principais

### 1. **Tipagem Completa**

- Todas as classes e funções com tipos TypeScript
- Interfaces para configurações, mensagens e ofertas
- Melhor IDE support e detecção de erros em tempo de compilação

### 2. **Modularização**

- `types.ts`: Tipos compartilhados
- `CalculadoraAcordo.ts`: Lógica de cálculo isolada
- `ChatEngine.ts`: Motor de IA isolado
- `index.ts`: Servidor Express

### 3. **Melhorias de Funcionamento**

#### CalculadoraAcordo

- ✅ Cálculo correto de dias em atraso usando timestamps
- ✅ Formatação de datas consistente (dd/mm/yyyy)
- ✅ Suporte completo a 4 periodicidades (mensal, semanal, quinzenal, diário)
- ✅ Validação de datas máximas de vencimento
- ✅ Tratamento de fins de semana (ajusta para dia útil)

#### ChatEngine

- ✅ Detecção automática de cadência (semanal, quinzenal, etc.)
- ✅ Detecção de pedidos de adiamento de entrada
- ✅ Recalculação dinâmica de ofertas
- ✅ Histórico persistente via sessão
- ✅ Integração async com LLM
- ✅ Tratamento robusto de erros

#### API/Servidor

- ✅ Express.js com TypeScript
- ✅ Gerenciamento de sessão com `express-session`
- ✅ Endpoints RESTful claros
- ✅ CORS configurável
- ✅ Health check
- ✅ Logs estruturados

#### Frontend

- ✅ Interface melhorada com Tailwind CSS
- ✅ Indicador de digitação animado
- ✅ Relatório exportável
- ✅ Responsivo para mobile
- ✅ Tratamento de erros de conexão

## 🔌 Endpoints da API

### POST `/api/chat`

Processa uma mensagem de negociação

**Request:**

```json
{
  "mensagem": "Oi, tudo bem?"
}
```

**Response:**

```json
{
  "resposta": "Olá! Tudo bem sim...",
  "status": "negociando" | "acordo_fechado"
}
```

### POST `/api/limpar-sessao`

Limpa o histórico e inicia uma nova conversa

**Response:**

```json
{
  "status": "ok"
}
```

### GET `/api/health`

Verifica status do servidor

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2026-01-26T10:30:00.000Z"
}
```

## 🧪 Testes de Funcionamento

### Teste 1: Cálculo de ofertas

```bash
curl -X GET http://localhost:3000/api/health
```

### Teste 2: Negociação básica

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"mensagem": "Qual é o valor à vista?"}'
```

### Teste 3: Mudança de cadência

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"mensagem": "Prefiro pagar semanalmente"}'
```

## 📊 Lógica de Negociação

A IA (LucIA) segue esta estratégia:

1. **Abertura**: Apresenta opção à vista
2. **Sondagem**: Pergunta se cliente prefere à vista ou parcelado
3. **Flexibilização**:
   - Se pedir semanal/quinzenal → recalcula ofertas
   - Se falar de valores → encontra opção que cabe no orçamento
   - Se pedir adiamento → posterga até data máxima
4. **Fechamento**: Ao aceitar, formaliza acordo

## 🔄 Fluxo de Dados

```
Frontend (index.html)
    ↓
POST /api/chat {mensagem}
    ↓
Express Server (index.ts)
    ↓
ChatEngine.enviarMensagem()
    ├→ Detecta cadência/data
    ├→ CalculadoraAcordo.gerarOfertas()
    ├→ Manda para LLM (routellm.abacus.ai)
    └→ Retorna {resposta, status}
    ↓
Frontend renderiza resposta
    ↓
Sessão salva em servidor
```

## 🛠️ Debugging

### Ver histórico de chat

```javascript
// No console do navegador
fetch("/api/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ mensagem: "debug" }),
})
  .then((r) => r.json())
  .then((d) => console.log(d));
```

### Logs do servidor

```bash
npm run dev 2>&1 | tee server.log
```

## 📈 Melhorias Futuras

- [ ] Persistência de ofertas em banco de dados
- [ ] Configuração dinâmica via API
- [ ] Suporte a múltiplas moedas
- [ ] Webhook para integração ERP
- [ ] Dashboard de estatísticas
- [ ] Autenticação de usuários
- [ ] Testes unitários com Jest
- [ ] Documentação Swagger/OpenAPI

## 📄 Licença

MIT

---

**Desenvolvido com ❤️ em TypeScript**
