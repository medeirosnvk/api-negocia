# Features do Frontend React - LucIA

## Design System WhatsApp

### Cores
```css
/* Header e Elementos Principais */
--whatsapp-primary: #075E54    /* Header, identidade */
--whatsapp-secondary: #128C7E  /* Botões secundários */
--whatsapp-accent: #25D366     /* Botão enviar (destaque) */
--whatsapp-teal: #34B7F1       /* Subtitle, detalhes */

/* Mensagens */
--whatsapp-light: #DCF8C6      /* Bolha usuário */
--white: #FFFFFF               /* Bolha bot */

/* Background e Containers */
--whatsapp-bg: #0B141A         /* Background principal */
--whatsapp-panel: #222E35      /* Container do chat */
--whatsapp-input: #2A3942      /* Campo de input */
--whatsapp-dark: #111B21       /* Elementos escuros */
```

### Tipografia
- Font family: System UI (Segoe UI, Roboto, Helvetica)
- Header name: 16px, semibold
- Header subtitle: 12px, regular
- Message text: 14px, regular
- Timestamp: 10px, regular
- Button text: 12px, medium

### Espaçamentos
- Container padding: 16px
- Message gap: 12px (space-y-3)
- Input padding: 16px (p-4)
- Button padding: 12px (p-3)

### Border Radius
- Messages: 8px (rounded-lg)
- Buttons: 8px (rounded-lg)
- Input: 8px (rounded-lg)
- Avatar: 50% (rounded-full)

### Shadows
- Messages: shadow-md
- Buttons: shadow-lg (hover: shadow-xl)
- Container: shadow-2xl

## Componentes

### 1. ChatWindow (Container Principal)
**Responsabilidades:**
- Gerenciar estado das mensagens
- Comunicação com API
- Lógica de envio/recebimento
- Geração de relatórios
- Limpar sessão

**Estado:**
```typescript
mensagens: Mensagem[]          // Array de mensagens
isTyping: boolean              // Indicador digitando
inputDisabled: boolean         // Desabilitar input
placeholder: string            // Texto do placeholder
```

**APIs:**
- `POST /api/chat` - Enviar mensagem
- `POST /api/limpar-sessao` - Limpar histórico

### 2. ChatHeader
**Responsabilidades:**
- Exibir avatar e nome da LucIA
- Botões de ação (Relatório, Limpar)

**Props:**
```typescript
onGerarRelatorio: () => void
onLimparConversa: () => void
```

**Features:**
- Avatar circular verde com letra "L"
- Subtitle "Assistente de Negociação"
- Botões com ícones Lucide
- Hover/active states
- Confirmação ao limpar

### 3. MessageList
**Responsabilidades:**
- Renderizar lista de mensagens
- Scroll automático
- Exibir typing indicator

**Props:**
```typescript
mensagens: Mensagem[]
isTyping: boolean
```

**Features:**
- Scroll suave para nova mensagem
- Scrollbar customizada
- Background com padrão doodle
- Espaçamento adequado

### 4. MessageBubble
**Responsabilidades:**
- Renderizar mensagem individual
- Formatar timestamp
- Distinguir usuário/bot

**Props:**
```typescript
mensagem: Mensagem {
  role: 'user' | 'assistant'
  text: string
  ts: string (ISO)
}
```

**Features:**
- Cor diferente por role
- Timestamp formatado (HH:mm)
- Max width 75%
- White-space pre-wrap
- Animação de entrada

### 5. ChatInput
**Responsabilidades:**
- Campo de texto
- Botão enviar
- Enter key handler
- Estados disabled

**Props:**
```typescript
onEnviar: (mensagem: string) => void
disabled: boolean
placeholder: string
```

**Features:**
- Limpar após enviar
- Enter para enviar
- Botão desabilitado sem texto
- Ícone de enviar (Send)
- Focus ring verde

### 6. TypingIndicator
**Responsabilidades:**
- Animação de "digitando..."

**Features:**
- 3 bolinhas animadas
- Delay escalonado (0s, 0.2s, 0.4s)
- Loop infinito
- Opacity pulsante

## Animações

### 1. Slide Up (Entrada de Mensagem)
```css
@keyframes slideUp {
  0% { transform: translateY(10px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}
duration: 0.3s
timing: ease-out
```

### 2. Fade In
```css
@keyframes fadeIn {
  0% { opacity: 0; }
  100% { opacity: 1; }
}
duration: 0.3s
timing: ease-in
```

### 3. Typing (Bolinhas)
```css
@keyframes typing {
  0%, 60%, 100% { opacity: 0.5; }
  30% { opacity: 1; }
}
duration: 1.4s
timing: infinite
```

### 4. Button Active
```css
active:scale-95
transition-all duration-200
```

## Responsividade

### Breakpoints (Tailwind)
```css
sm: 640px   /* Small devices */
md: 768px   /* Tablets */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
```

### Container
```css
/* Mobile (< 640px) */
width: 100%
padding: 16px

/* Tablet/Desktop (>= 768px) */
max-width: 672px (max-w-2xl)
margin: auto
```

### Messages
```css
/* Mobile */
max-width: 75%

/* Desktop */
max-width: 75% (mantém mesmo tamanho)
```

## Fluxo de Dados

### 1. Envio de Mensagem
```
Usuário digita → Enter/Click
  ↓
ChatInput.onEnviar(texto)
  ↓
ChatWindow.enviarMensagem(texto)
  ↓
Adiciona mensagem usuário ao estado
  ↓
setIsTyping(true)
  ↓
POST /api/chat { mensagem: texto }
  ↓
Recebe resposta { resposta, status }
  ↓
setIsTyping(false)
  ↓
Adiciona mensagem bot ao estado
  ↓
Scroll automático (useEffect no MessageList)
```

### 2. Limpar Conversa
```
Usuário clica "Limpar"
  ↓
ChatHeader.onLimparConversa()
  ↓
confirm("Deseja limpar?")
  ↓
POST /api/limpar-sessao
  ↓
Reset mensagens para [MENSAGEM_INICIAL]
  ↓
Reset inputDisabled = false
```

### 3. Gerar Relatório
```
Usuário clica "Relatório"
  ↓
ChatHeader.onGerarRelatorio()
  ↓
window.open() nova aba
  ↓
Gera HTML completo com:
  - Todas as mensagens
  - Timestamps formatados
  - Estilos inline
  - Botões de imprimir/copiar
  ↓
Escreve no documento da nova aba
```

## Estados da Aplicação

### Normal (Negociando)
```typescript
inputDisabled: false
placeholder: "Digite sua mensagem..."
Botão enviar: enabled
```

### Acordo Fechado
```typescript
inputDisabled: true
placeholder: "✅ Acordo formalizado!"
Botão enviar: hidden
```

### Carregando (Typing)
```typescript
inputDisabled: true
isTyping: true
Mostra TypingIndicator
```

## Acessibilidade

### Teclado
- ✅ Enter para enviar mensagem
- ✅ Tab navigation nos botões
- ✅ Focus visible (ring-2 ring-whatsapp-accent)

### Screen Readers
- ✅ Atributo `title` nos botões
- ✅ Atributo `placeholder` no input
- ✅ Alt text em ícones (Lucide)

### Contraste
- ✅ WCAG AA compliant
- ✅ Texto escuro (#111) em fundos claros
- ✅ Texto claro (#FFF) em fundos escuros

## Performance

### Otimizações
- ✅ Vite para build ultra-rápido
- ✅ Code splitting automático
- ✅ Tree shaking (imports específicos)
- ✅ CSS purge (Tailwind JIT)
- ✅ Compressão gzip (203kb → 64kb)

### Lazy Loading
- Atualmente todos componentes carregados
- Possível implementar: React.lazy() para rotas futuras

### Memoização
- Componentes simples, não necessário useMemo/useCallback
- Performance já excelente

## Browser Support

### Testado em:
- ✅ Chrome 120+
- ✅ Firefox 120+
- ✅ Safari 17+
- ✅ Edge 120+

### Features modernas usadas:
- ✅ CSS Grid/Flexbox
- ✅ Custom Properties (--var)
- ✅ Fetch API
- ✅ ES Modules
- ✅ Async/Await

## Melhorias Futuras

### Features
- [ ] Reconhecimento de voz (Web Speech API)
- [ ] Anexar documentos
- [ ] Emojis picker
- [ ] Dark/Light mode toggle
- [ ] Histórico de conversas antigas
- [ ] Export para PDF direto (sem print dialog)

### Performance
- [ ] Service Worker (PWA)
- [ ] Offline support
- [ ] IndexedDB para cache local
- [ ] WebSocket para real-time

### UX
- [ ] Confirmar saída se houver mensagens não finalizadas
- [ ] Notificações desktop
- [ ] Som de nova mensagem
- [ ] Indicador de scroll (quando há msgs antigas)
- [ ] Preview de links compartilhados
