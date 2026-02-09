# 🎯 COMEÇAR AQUI - Quick Start Guide

Bem-vindo ao projeto **LucIA** em TypeScript!

## ⚡ Inicio Rápido (5 minutos)

### 1️⃣ Instalar dependências

```bash
cd /Users/kevinmedeiros/Enterprise/Cobrance/api-negocia
npm install
```

### 2️⃣ Rodar em desenvolvimento

```bash
npm run dev
```

### 3️⃣ Abrir no navegador

```
http://localhost:3000
```

Pronto! 🎉 A interface estará disponível.

---

## 📚 Documentação Completa

- **[README.md](./README.md)** - Visão geral, estrutura, endpoints
- **[MIGRACAO.md](./MIGRACAO.md)** - Comparação PHP vs TypeScript, mudanças técnicas
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Como colocar em produção

---

## 🗂️ Estrutura do Projeto

```
src/
├── types.ts              ← Tipos TypeScript compartilhados
├── CalculadoraAcordo.ts  ← Cálculo de dívidas e ofertas
├── ChatEngine.ts         ← Motor de IA para negociação
├── index.ts              ← Servidor Express
├── test.ts               ← Testes de funcionamento
└── config.example.ts     ← Exemplos de configuração

public/
└── index.html            ← Interface web (Tailwind CSS)

package.json              ← Dependências Node.js
tsconfig.json             ← Configuração TypeScript
.env.example              ← Variáveis de ambiente
```

---

## 🚀 Principais Comandos

| Comando             | Função                          |
| ------------------- | ------------------------------- |
| `npm install`       | Instala dependências            |
| `npm run dev`       | Inicia em desenvolvimento       |
| `npm run build`     | Compila TypeScript → JavaScript |
| `npm start`         | Roda a versão compilada         |
| `npm run typecheck` | Verifica tipos sem compilar     |

---

## ✅ Checklist de Conversão

- [x] Converter `CalculadoraAcordo.php` → `CalculadoraAcordo.ts`
- [x] Converter `ChatEngine.php` → `ChatEngine.ts`
- [x] Converter `api.php` → Express em `index.ts`
- [x] Converter `index.php` → `public/index.html`
- [x] Criar sistema de tipos (`types.ts`)
- [x] Melhorar interface web (Tailwind CSS)
- [x] Adicionar testes automatizados
- [x] Documentação completa
- [x] Deployment guide

---

## 🔍 O que foi melhorado?

### Código

✅ **Tipagem completa** - Detecção de erros em tempo de compilação
✅ **Modularização** - Cada classe em seu arquivo
✅ **Async/Await** - Melhor handling de operações assíncronas
✅ **Error handling** - Tratamento robusto de erros
✅ **Interfaces** - Documentação automática de tipos

### Funcionalidade

✅ **Mesma lógica** - Comportamento idêntico ao PHP
✅ **Performance** - Caching e otimizações
✅ **Escalabilidade** - Pronto para crescer
✅ **Segurança** - Validação de tipos e input
✅ **Manutenibilidade** - Código mais legível e organizado

### Experiência do Usuário

✅ **Interface melhorada** - Design moderno com Tailwind
✅ **Feedback visual** - Indicador de digitação animado
✅ **Relatórios** - Exportação de diálogos
✅ **Responsivo** - Funciona em mobile
✅ **Confiável** - Tratamento de erros de conexão

---

## 🧪 Testar a Aplicação

### Teste 1: Verificar cálculos

```bash
npx ts-node src/test.ts
```

Você verá as ofertas geradas para diferentes cadências (mensal, semanal, etc).

### Teste 2: Fazer uma requisição

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"mensagem": "Qual é a primeira opção?"}'
```

### Teste 3: Ver saúde do servidor

```bash
curl http://localhost:3000/api/health
```

---

## 🔑 Variáveis de Ambiente

Crie um arquivo `.env` na raiz:

```env
PORT=3000
API_KEY=s2_33e5d129dcd84178afca14a2f05f954a
NODE_ENV=development
SESSION_SECRET=chave-secreta-desenvolvimento
```

---

## 📊 Fluxo de Dados

```
1. Usuário digita mensagem no navegador
   ↓
2. POST /api/chat com a mensagem
   ↓
3. Express recebe e cria ChatEngine
   ↓
4. ChatEngine detecta mudanças (cadência, datas, etc)
   ↓
5. CalculadoraAcordo recalcula ofertas se necessário
   ↓
6. ChatEngine chama API LLM com histórico e ofertas
   ↓
7. LLM responde com negociação
   ↓
8. Response retorna para o frontend
   ↓
9. Interface renderiza e salva na sessão
```

---

## 🆘 Problemas Comuns

### Port 3000 já está em uso

```bash
# Mude a porta no .env
PORT=3001

# Ou mate o processo
lsof -i :3000
kill -9 <PID>
```

### "Cannot find module"

```bash
# Reinstale dependências
rm -rf node_modules
npm install
```

### Erro de "Cannot POST /api/chat"

- Certifique-se que `npm run dev` está rodando
- Verifique que o servidor escuta na porta correta
- Abra as DevTools do navegador (F12) e veja se há erros

### API LLM não responde

- Verifique a chave API no `.env`
- Teste em: `https://routellm.abacus.ai`
- Se tiver VPN/proxy, configure em `axios`

---

## 📖 Próximos Passos

1. **Configurar banco de dados** - PostgreSQL/MongoDB para históricos
2. **Adicionar autenticação** - JWT para múltiplos usuários
3. **Dashboard** - Ver estatísticas de negociações
4. **Webhooks** - Integrar com ERP/CRM
5. **Testes** - Jest para cobertura completa
6. **Monitoring** - Sentry/DataDog para produção

---

## 💡 Dicas

- Abra 2 terminais: um para `npm run dev` e outro para testes
- Use VS Code para melhor suporte a TypeScript
- Ative o Prettier para formatação automática
- Veja os tipos em `src/types.ts` antes de usar as classes

---

## 🎓 Entendendo o Código

### Comece por aqui:

1. `src/types.ts` - Veja os tipos
2. `src/CalculadoraAcordo.ts` - Entenda os cálculos
3. `src/ChatEngine.ts` - Veja a lógica de IA
4. `src/index.ts` - Veja os endpoints

### Depois explore:

- `public/index.html` - Interface web
- `src/config.example.ts` - Diferentes cenários

---

## 📞 Suporte

Qualquer dúvida:

1. Veja a documentação em README.md
2. Verifique MIGRACAO.md para mudanças do PHP
3. Consulte os logs: `npm run dev 2>&1 | head -20`
4. Abra DevTools no navegador (F12)

---

## ✨ Versão Final

**Projeto:** LucIA - Negociador de Dívidas com IA
**Status:** ✅ Totalmente convertido e funcional em TypeScript
**Pronto para:** Desenvolvimento, testes e produção

Divirta-se! 🚀
