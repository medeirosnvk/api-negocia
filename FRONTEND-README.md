# Frontend React - LucIA Chatbot de Negociação

Frontend moderno no estilo WhatsApp Web criado com React, TypeScript e Tailwind CSS.

## Características do Design

### Estilo WhatsApp
- **Interface dark** com tons de verde profissional
- **Background com padrão doodle** igual ao WhatsApp original
- **Bolhas de mensagem** com cores distintas (usuário verde claro, bot branco)
- **Header verde escuro** (#075E54) com avatar circular e nome
- **Animações suaves** para entrada de mensagens e typing indicator
- **Totalmente responsivo** - funciona perfeitamente em mobile e desktop

### Paleta de Cores
```css
Verde Principal (Header):     #075E54
Verde Secundário (Botões):    #128C7E
Verde Accent (Enviar):        #25D366
Verde Bolha Usuário:          #DCF8C6
Background Dark:              #0B141A
Panel Dark:                   #222E35
Input Background:             #2A3942
```

## Estrutura do Projeto

```
frontend/
├── src/
│   ├── components/
│   │   ├── ChatWindow.tsx       # Container principal com lógica
│   │   ├── ChatHeader.tsx       # Header com avatar e botões
│   │   ├── MessageList.tsx      # Lista de mensagens com scroll
│   │   ├── MessageBubble.tsx    # Bolha individual de mensagem
│   │   ├── ChatInput.tsx        # Campo de input e botão enviar
│   │   └── TypingIndicator.tsx  # Indicador animado "digitando..."
│   ├── types.ts                 # Interfaces TypeScript
│   ├── App.tsx                  # App principal
│   ├── index.css                # Estilos globais + Tailwind
│   └── main.tsx                 # Entry point
├── tailwind.config.js           # Configuração com cores customizadas
├── vite.config.ts               # Config Vite + Proxy API
└── package.json
```

## Como Executar

### 1. Backend (Terminal 1)

```bash
# Na raiz do projeto
npm run dev
```

O backend iniciará em `http://localhost:3000`

### 2. Frontend (Terminal 2)

```bash
cd frontend
npm install    # Primeira vez apenas
npm run dev
```

O frontend iniciará em `http://localhost:5173`

Abra o navegador em `http://localhost:5173` e comece a conversar com a LucIA!

## Scripts Disponíveis

```bash
npm run dev      # Dev server com hot-reload (porta 5173)
npm run build    # Build de produção (output: dist/)
npm run preview  # Preview do build de produção
npm run lint     # Lint do código TypeScript/React
```

## Funcionalidades Implementadas

- ✅ Envio de mensagens com Enter ou botão
- ✅ Indicador "digitando..." animado enquanto a IA responde
- ✅ Timestamp em cada mensagem (formato 24h)
- ✅ Botão "Limpar Conversa" (com confirmação)
- ✅ Botão "Relatório" (abre em nova aba com print/export)
- ✅ Tratamento de status "acordo_fechado" (desabilita input)
- ✅ Mensagem inicial da LucIA ao carregar
- ✅ Scroll automático para novas mensagens
- ✅ Animações de entrada suaves
- ✅ Hover/active states nos botões
- ✅ Scrollbar customizada estilo WhatsApp
- ✅ Design responsivo mobile/tablet/desktop

## APIs Consumidas

O frontend faz requisições para:

- `POST /api/chat` - Envia mensagem do usuário e recebe resposta da LucIA
  ```json
  Request: { "mensagem": "texto" }
  Response: { "resposta": "texto", "status": "negociando" | "acordo_fechado" }
  ```

- `POST /api/limpar-sessao` - Limpa histórico e reinicia conversa
  ```json
  Response: { "mensagem": "Sessão limpa" }
  ```

## Configuração do Vite

O `vite.config.ts` está configurado com proxy para redirecionar chamadas `/api/*` para o backend na porta 3000:

```typescript
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
    },
  },
}
```

## Build para Produção

```bash
cd frontend
npm run build
```

Isso gera uma pasta `dist/` com arquivos otimizados e comprimidos.

### Deploy

Para servir em produção, você pode:

1. **Servir a pasta dist/ separadamente** (Vercel, Netlify, etc) e configurar variável de ambiente para a URL da API

2. **Servir do próprio backend Express**:
   ```typescript
   // No src/index.ts do backend
   import express from 'express';
   app.use(express.static('frontend/dist'));
   ```

## Customização

### Alterar Cores

Edite `/frontend/tailwind.config.js`:

```javascript
colors: {
  whatsapp: {
    primary: '#075E54',    // Sua cor
    secondary: '#128C7E',  // Sua cor
    // ...
  }
}
```

### Alterar Porta do Frontend

Edite `/frontend/vite.config.ts`:

```typescript
server: {
  port: 5173,  // Sua porta
  // ...
}
```

### Mensagem Inicial

Edite `/frontend/src/components/ChatWindow.tsx`:

```typescript
const MENSAGEM_INICIAL: Mensagem = {
  role: 'assistant',
  text: 'Sua mensagem aqui',
  ts: new Date().toISOString(),
};
```

## Tecnologias Utilizadas

- **React 19** - Framework UI
- **TypeScript** - Type safety
- **Vite** - Build tool ultra-rápido
- **Tailwind CSS 3** - Utility-first CSS
- **Lucide React** - Ícones SVG modernos
- **clsx** - Classes condicionais

## Troubleshooting

### Frontend não conecta ao backend

Verifique se:
1. Backend está rodando em `localhost:3000`
2. Proxy no `vite.config.ts` está correto
3. Não há erros de CORS (já configurado no backend)

### Estilos Tailwind não aparecem

```bash
cd frontend
rm -rf node_modules
npm install
npm run dev
```

### Build falha

```bash
cd frontend
npm run build
# Veja os erros de TypeScript e corrija
```

## Screenshots

O design final é uma réplica fiel do WhatsApp Web:
- Janela centralizada flutuante
- Background escuro com padrão sutil
- Bolhas de mensagem com sombras
- Header verde com avatar circular
- Input escuro com botão verde destaque
- Scroll suave e animações premium

---

**Desenvolvido com React + Tailwind CSS**
