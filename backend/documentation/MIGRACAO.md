# 📋 Guia de Migração: PHP → TypeScript

Este documento detalha as mudanças realizadas na conversão de PHP para TypeScript.

## 🔄 Mapeamento de Arquivos

| PHP                     | TypeScript                 | Função                       |
| ----------------------- | -------------------------- | ---------------------------- |
| `CalculadoraAcordo.php` | `src/CalculadoraAcordo.ts` | Cálculo de dívidas e ofertas |
| `ChatEngine.php`        | `src/ChatEngine.ts`        | Motor de negociação com IA   |
| `api.php`               | `src/index.ts`             | Servidor Express             |
| `index.php`             | `public/index.html`        | Interface web                |
| `limpar_sessao.php`     | `POST /api/limpar-sessao`  | Endpoint para limpar sessão  |
| -                       | `src/types.ts`             | Tipos TypeScript (novo)      |

## 📊 Comparação de Funcionalidades

### CalculadoraAcordo

#### PHP

```php
class CalculadoraAcordo {
    private $dados;
    private $hoje;

    public function calcularProjecao(DateTime $dataProjecao)
    public function gerarOfertas($cadencia = 'mensal', $dataEntradaManual = null)
    private function proximoDiaUtil(DateTime $d): DateTime
}
```

#### TypeScript

```typescript
export class CalculadoraAcordo {
    private dados: ConfiguracaoAcordo;
    private hoje: Date;

    private calcularProjecao(dataProjecao: Date): number
    public gerarOfertas(cadencia: 'mensal' | 'diario' | 'semanal' | 'quinzenal', ...): OfertaCalculada[]
    private proximoDiaUtil(d: Date): Date
}
```

**Melhorias:**

- ✅ Tipagem forte de parâmetros e retornos
- ✅ `DateTime` PHP → `Date` JavaScript (mais simples)
- ✅ Union types para cadência (evita typos)
- ✅ Métodos privados com visibilidade clara

### ChatEngine

#### PHP

```php
class ChatEngine {
    private $calculadora;
    public $historico = [];
    private string $cadencia = 'mensal';

    public function enviarMensagem($msg) // síncrono
    private function inicializarConversa($msg = '')
    private function extrairCadencia(string $msg): ?string
}
```

#### TypeScript

```typescript
export class ChatEngine {
  private calculadora: CalculadoraAcordo;
  public historico: MensagemChat[] = [];
  private cadencia: "mensal" | "diario" | "semanal" | "quinzenal" = "mensal";

  public async enviarMensagem(msg: string): Promise<ResultadoChat>; // assíncrono
  private inicializarConversa(msg: string): void;
  private extrairCadencia(
    msg: string,
  ): "mensal" | "diario" | "semanal" | "quinzenal" | null;
}
```

**Melhorias:**

- ✅ Promessas para chamadas API (async/await)
- ✅ Tipos para histórico (MensagemChat[])
- ✅ Union types para cadência
- ✅ Tratamento de erros com try/catch
- ✅ Axios em vez de file_get_contents (mais robusto)

### API REST

#### PHP

```php
session_start();
header('Content-Type: application/json');
$engine = new ChatEngine($jsonInput, $apiKey);
$resultado = $engine->enviarMensagem($input['mensagem'] ?? '');
echo json_encode($resultado);
```

#### TypeScript (Express)

```typescript
app.use(session({...}));
app.use(express.json());

app.post('/api/chat', async (req: Request, res: Response) => {
    const engine = new ChatEngine(config, API_KEY);
    const resultado = await engine.enviarMensagem(req.body.mensagem);
    res.json(resultado);
});
```

**Melhorias:**

- ✅ Express.js (framework robusto)
- ✅ Middleware estruturado
- ✅ Tratamento de erros global
- ✅ Health checks
- ✅ CORS support
- ✅ Múltiplos endpoints
- ✅ Validação de input

## 🔧 Mudanças Técnicas

### 1. Sistema de Tipos

**Antes (PHP):**

```php
$dados = json_decode($jsonInput, true);
$parametros = $this->dados['parametros'][0];
$valor = $parametros['juros']; // type é inferido em runtime
```

**Depois (TypeScript):**

```typescript
const dados: ConfiguracaoAcordo = config;
const parametros: Parametros = this.dados.parametros[0];
const valor: number = parametros.juros; // type é verificado em compile-time
```

### 2. Datas

**Antes (PHP):**

```php
$vencimento = new DateTime($divida['vencimento']);
$intervalo = $vencimento->diff($dataProjecao);
$diasAtraso = $intervalo->invert ? 0 : $intervalo->days;
```

**Depois (TypeScript):**

```typescript
const vencimento = new Date(divida.vencimento);
const diasAtraso = this.calcularDiasAtraso(vencimento, dataProjecao);

private calcularDiasAtraso(vencimento: Date, dataProjecao: Date): number {
    if (vencimento > dataProjecao) return 0;
    const diffMs = dataProjecao.getTime() - vencimento.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}
```

### 3. String Handling

**Antes (PHP):**

```php
mb_strtolower($msg)
str_contains($m, 'não consigo')
preg_match('/(\d{2})\/(\d{2})/', $msg, $matches)
number_format($valor, 2, '.', '')
```

**Depois (TypeScript):**

```typescript
msg.toLowerCase();
m.includes("não consigo");
msg.match(/(\d{2})\/(\d{2})/);
valor.toFixed(2);
```

### 4. Formatação de Datas

**Novo helper em TypeScript:**

```typescript
private formatarData(data: Date): string {
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
}
```

### 5. API Calls

**Antes (PHP):**

```php
$response = file_get_contents('https://routellm.abacus.ai/v1/chat/completions', false, $contexto);
$data = json_decode($response, true);
$textoIA = $data['choices'][0]['message']['content'];
```

**Depois (TypeScript):**

```typescript
const response = await axios.post(
  "https://routellm.abacus.ai/v1/chat/completions",
  {
    model: "gpt-4",
    messages: this.historico,
    temperature: 0.7,
  },
  {
    headers: {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
    },
  },
);
const textoIA = response.data?.choices?.[0]?.message?.content || "Erro";
```

## 🚀 Melhorias de Performance

1. **Caching de ofertas**: Calculadas uma vez e reutilizadas
2. **Async/Await**: Não bloqueia requisições paralelas
3. **Tipagem**: Evita erros em runtime
4. **Session persistence**: Histórico salvo em servidor

## ✅ Compatibilidade

- ✅ Mesma lógica de cálculo
- ✅ Mesma estratégia de negociação
- ✅ Mesmos endpoints (com nomes melhorados)
- ✅ Mesmas variáveis de ambiente
- ✅ Interface similar (melhorada)

## 🔐 Segurança

Melhorias adicionadas:

- ✅ Validação de tipos TypeScript
- ✅ HTTPS em production (recomendado)
- ✅ Session timeout configurável
- ✅ Sanitização de input HTML no frontend
- ✅ Error handling sem expor stack traces

## 📝 Notas Importantes

1. **Data de Hoje**: O sistema agora usa `new Date()` (UTC). Se precisar zona horária local, adicione:

   ```typescript
   const hoje = new Date(Date.now() - new Date().getTimezoneOffset() * 60000);
   ```

2. **Precisão de Cálculo**: Valores monetários são arredondados para 2 casas decimais em todos os pontos.

3. **Fuso Horário**: Timestamps no histórico de chat são em UTC (ISO 8601).

## 🔄 Como Migrar Dados Existentes

Se você tem dados em um banco de dados SQL, use este mapeamento:

```sql
-- PHP                          TypeScript
vencimento (DATE)         →     vencimento (string "YYYY-MM-DD")
valor (DECIMAL)           →     valor (number)
juros (INT)               →     juros (number)
data_entrada_maxima (DATE) →   data_entrada_maxima (string "YYYY-MM-DD")
```

## 📚 Referências

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Express.js Guide](https://expressjs.com/)
- [Axios Documentation](https://axios-http.com/)
- [MDN Date Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)
