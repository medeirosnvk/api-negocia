# Frontend LucIA - Chatbot de Negociação

Interface moderna estilo WhatsApp Web para o chatbot de negociação de dívidas LucIA.

## Design

- **Estilo WhatsApp**: Interface dark com tons de verde (#075E54, #128C7E, #25D366)
- **Background com padrão sutil**: Doodle pattern como o WhatsApp original
- **Bolhas de mensagem**: Usuário em verde claro (#DCF8C6), bot em branco
- **Animações suaves**: Entrada de mensagens, indicador de digitação, hover states
- **Totalmente responsivo**: Mobile-first design

## Stack Tecnológica

- **React 19** com TypeScript
- **Vite** como bundler
- **Tailwind CSS** para estilização
- **Lucide React** para ícones SVG
- **clsx** para classes condicionais

## Estrutura de Componentes

```
src/
├── components/
│   ├── ChatWindow.tsx       # Componente principal
│   ├── ChatHeader.tsx       # Header com avatar e botões
│   ├── MessageList.tsx      # Lista de mensagens com scroll
│   ├── MessageBubble.tsx    # Bolha individual de mensagem
│   ├── ChatInput.tsx        # Input com botão de enviar
│   └── TypingIndicator.tsx  # Indicador animado "digitando..."
├── types.ts                 # Tipos TypeScript
├── App.tsx                  # App principal
└── index.css                # Estilos globais e Tailwind
```

## Como Executar

### 1. Instalar dependências

```bash
cd frontend
npm install
```

### 2. Iniciar o backend (em outro terminal)

```bash
cd ..
npm run dev  # Backend rodará em http://localhost:3000
```

### 3. Iniciar o frontend

```bash
npm run dev  # Frontend rodará em http://localhost:5173
```

O frontend faz proxy das requisições `/api/*` para o backend automaticamente.

## Scripts Disponíveis

```bash
npm run dev      # Inicia dev server com hot-reload
npm run build    # Build para produção
npm run preview  # Preview do build de produção
npm run lint     # Lint do código
```

## Funcionalidades

- ✅ Envio de mensagens com Enter ou clique
- ✅ Indicador "digitando..." animado
- ✅ Timestamp em cada mensagem
- ✅ Botão limpar conversa (com confirmação)
- ✅ Botão gerar relatório (abre em nova aba)
- ✅ Tratamento de status "acordo_fechado"
- ✅ Mensagem inicial da LucIA
- ✅ Scroll automático para nova mensagem
- ✅ Animações de entrada nas mensagens
- ✅ Estados de hover/active nos botões
- ✅ Design responsivo mobile/desktop

## APIs Utilizadas

- `POST /api/chat` - Envia mensagem e recebe resposta
- `POST /api/limpar-sessao` - Limpa sessão e histórico
- `GET /api/ofertas` - Debug de ofertas (não usado no frontend)

## Customização de Cores

As cores do WhatsApp estão definidas no `tailwind.config.js`:

```js
whatsapp: {
  primary: '#075E54',    // Header
  secondary: '#128C7E',  // Botões
  accent: '#25D366',     // Botão enviar
  light: '#DCF8C6',      // Bolha usuário
  // ... outras cores
}
```

## Build para Produção

```bash
npm run build
```

Os arquivos otimizados estarão em `dist/`. Configure seu servidor para:

1. Servir os arquivos estáticos do `dist/`
2. Fazer proxy das rotas `/api/*` para o backend
