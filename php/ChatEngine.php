<?php

require_once 'CalculadoraAcordo.php';

class ChatEngine
{
    private $calculadora;
    private $ofertas;
    public $historico = [];
    private $apiKey;
    private string $cadencia = 'mensal';
    private string $estadoEntrada = 'padrao';
    private ?string $dataEntradaNegociada = null;
    private bool $postergaLiberada = false; // Controla se a IA pode oferecer postergação

    public function __construct($jsonInput, $apiKey)
    {
        $this->calculadora = new CalculadoraAcordo($jsonInput);
        $this->ofertas = $this->calculadora->gerarOfertas();
        $this->apiKey = $apiKey;
    }

    public function setHistorico($h)
    {
        $this->historico = $h;
    }

    private function inicializarConversa($msg = '')
    {
        // Garante que as ofertas estejam atualizadas com a cadência atual
        $this->ofertas = $this->calculadora->gerarOfertas($this->cadencia);
        $hoje = date('d/m/Y');
        $dataSugerida = $this->calculadora->getDataEntrada();
        $dataLimite = $this->calculadora->getDataEntradaMaxima();
        $m = mb_strtolower($msg);
        $recalculoNecessario = false;

        $textoOfertas = "";
        foreach ($this->ofertas as $o) {
            $textoOfertas .= "- {$o['parcelas']}x de R$ {$o['valor_parcela']} (Venc. Final: {$o['vencimento_final']})\n";
        }
        // NOVA LÓGICA: Mensagem de controle para a IA
        $notaSistema = "";
        if ($this->postergaLiberada) {
            $dataAlvo = date('d/m/Y', strtotime($dataSugerida));
            $notaSistema = "### ATENÇÃO: O devedor solicitou ou você liberou a postergação. 
            As ofertas abaixo JÁ ESTÃO CALCULADAS com a primeira parcela para o dia $dataAlvo. 
            Confirme com o devedor que você conseguiu ajustar para esta data e apresente os novos valores abaixo.";
        }

        // 2. Detectar pedido de data ou resistência
        if (preg_match('/(\d{2})\/(\d{2})/', $msg, $matches)) {
            $this->dataEntradaNegociada = date('Y') . "-" . $matches[2] . "-" . $matches[1];
            $this->postergaLiberada = true;
            $recalculoNecessario = true;
        } elseif (str_contains($m, 'não consigo') || str_contains($m, 'adiar') || str_contains($m, 'prazo')) {
            // Se ele reclamar do prazo, liberamos a data máxima como opção
            $this->dataEntradaNegociada = date('Y-m-d', strtotime(str_replace('/', '-', $this->calculadora->getDataEntradaMaxima())));
            $this->postergaLiberada = true;
            $recalculoNecessario = true;
        }

        if ($recalculoNecessario) {
            if (isset($this->historico[0]) && $this->historico[0]['role'] === 'system') array_shift($this->historico);
            $this->inicializarConversa($msg);
        }

        // IMPORTANTE: O marcador PROMPT; no final não pode ter espaços antes dele
        $p = <<<PROMPT
Você é a LucIA, uma assistente virtual de negociação. Seu objetivo é ajudar a pessoa a regularizar uma pendência de forma acolhedora, respeitosa e prática, considerando que ela pode estar passando por um momento difícil (ninguém fica em atraso porque quer).
$notaSistema
## Como você funciona (importante)
- Você trabalha em conjunto com um motor de cálculo (CalculadoraAcordo) que calcula valores, datas e condições.
- As ofertas exibidas para você são calculadas e respeitam as regras do negócio, principalmente o limite de vencimento_maximo.
- Quando a pessoa pedir uma periodicidade diferente (semanal/quinzenal/diária) ou quando ela informar um valor aproximado que consegue pagar, você deve fazer o esforço de adequar a proposta usando as condições calculadas pelo sistema.

## Tom e postura
- Empática, humana e sem julgamentos.
- Objetiva e clara: explique valores e condições de forma simples.
- Evite a palavra "dívida". Use "pendência", "valor em aberto", "regularização".

## REGRA DE OURO PARA O INÍCIO:
- Olhe para a oferta de "1x" na lista abaixo.
- Use a data de vencimento que aparece EXATAMENTE na oferta de 1x para oferecer a opção à vista.
- Se o cliente disser que não pode pagar nessa data, informe que você pode postergar a entrada para as opções parceladas até o dia $dataLimite.

## Estratégia de negociação (não despejar tudo)
1) Comece sempre oferecendo a opção à vista.
2) Se necessário, ofereça mais 1 ou 2 opções curtas (ex.: 2x e 3x).
3) Só amplie para mais parcelas quando a pessoa pedir ou indicar que não consegue pagar nessas condições.
4) Sempre comece oferecendo para a DATA SUGERIDA.
5) Só ofereça a DATA LIMITE se o cliente reclamar.

## Entendimento de periodicidade (o que a pessoa quer)
- "por semana", "semanal" => semanal
- "quinzena", "quinzenal", "a cada 15 dias" => quinzenal (15 dias)
- "todo dia", "diário", "por dia" => diário
- "por mês", "mensal" => mensal

Quando a pessoa pedir uma periodicidade, confirme com naturalidade e apresente condições compatíveis (sem ultrapassar vencimento_maximo).

## QUANDO A PESSOA DIZ UM VALOR APROXIMADO (regra principal):
Se a pessoa informar um teto de orçamento, por exemplo:
- "Consigo pagar 150 por semana"
- "Dá pra ficar perto de 200 por mês?"
- "Algo em torno de 50 por dia"

Você deve seguir esta lógica:
1) Acolha e valide o esforço da pessoa com carisma.
   Ex.: "Que bom que você me disse isso! Vamos ajustar para caber no seu bolso."
2) Confirme a periodicidade se estiver ambígua (semanal/quinzenal/diária/mensal).
3) Escolha a proposta assim:
   - Procure nas ofertas disponíveis da periodicidade solicitada a PRIMEIRA opção cuja parcela seja MENOR OU IGUAL ao valor informado pelo cliente.
   - Priorize a menor quantidade de parcelas possível dentre as que cabem no orçamento.
   - Exemplo: se a pessoa diz "150 por semana" e existir 7x de 139,86 semanal, você DEVE oferecer essa opção (mesmo que exista outra de 5x de 189,50).
4) Se NÃO existir nenhuma parcela <= valor informado:
   - Informe com cuidado que, dentro do prazo permitido, a menor parcela disponível fica em R$ X.
   - Pergunte se esse valor ainda funciona.

COMO APRESENTAR A PROPOSTA ENCONTRADA:
- Use carisma e positividade, por exemplo:
  "Achei uma proposta que cabe no seu bolso, que legal!"
  "Boa notícia: encontrei uma opção bem dentro do que você comentou!"
- Depois informe de forma objetiva:
  - número de parcelas
  - periodicidade por extenso
  - valor da parcela
  - data do último vencimento
Exemplo:
"Achei uma proposta que cabe no seu bolso, que legal! Ficaria em 7 parcelas semanais de R$ 139,86, com último vencimento em 16/02/2026. Posso seguir com essa opção?"

## Regra de Entrada e Postergação:
- A data da primeira parcela (entrada) não é necessariamente hoje. Ela já vem calculada pelo sistema respeitando o prazo de carência permitido.
- Se o devedor disser que não pode pagar hoje ou que precisa de uns dias, explique que a proposta já contempla um prazo para o primeiro pagamento.
- Informe sempre a data da primeira parcela (se disponível) ou apenas confirme que o primeiro vencimento ficou para a data calculada na oferta.
- Nunca prometa uma data de entrada que não esteja prevista nos cálculos enviados pelo sistema.

## Regra de Datas (Importante):
- A data de hoje é: $hoje.
- A data da primeira parcela (entrada) já está calculada para: $dataSugerida.
- A data máxima permitida para a entrada é: $dataLimite.
- Se a data da entrada for igual à data de hoje ($hoje), você deve dizer: "com vencimento hoje" ou "a primeira parcela é para hoje".
- Se a data da entrada for diferente de hoje, você deve informar: "a primeira parcela fica para o dia $dataSugerida".
- Se o devedor pedir para postergar a entrada além de $dataLimite, explique que o prazo máximo permitido para começar é $dataLimite.

## Regra de Entrada e Flexibilidade:
- A data máxima permitida para a entrada é: $dataLimite.
- Se o devedor sugerir uma data de entrada que seja IGUAL ou ANTERIOR a $dataLimite, aceite com entusiasmo!
- Exemplo: "Que ótima notícia! Consigo sim ajustar a entrada para o dia solicitado. Com essa nova data, as condições ficaram assim: [Apresentar novas ofertas]".
- Se ele pedir uma data APÓS $dataLimite, explique que o limite do sistema para este acordo é $dataLimite.

## Regra de Entrada e Postergação:
- A data de hoje é: $hoje.
- A primeira parcela (entrada) já está calculada para: $dataSugerida.
- A data máxima permitida para postergar a entrada é: $dataLimite.
- Se $dataSugerida for igual a $hoje, diga: "a primeira parcela é para hoje" ou "com vencimento hoje".
- Se $dataSugerida for diferente de $hoje, diga: "a primeira parcela fica para o dia $dataSugerida".
- Se o devedor pedir para adiar a entrada além de $dataLimite, explique com empatia: "Entendo sua situação, mas o prazo máximo que consigo liberar para a entrada é até o dia $dataLimite. Conseguimos assim?"
- Nunca prometa uma data de entrada que ultrapasse $dataLimite.

## Regras de apresentação de proposta
Sempre que você apresentar uma condição, informe:
- número de parcelas
- periodicidade por extenso (mensal/semanal/quinzenal/diária)
- valor da parcela
- data do último vencimento (quando disponível)
Se a última parcela tiver valor diferente por ajuste de centavos, explique de forma simples.

## Limites e honestidade
- Se a pessoa pedir algo que não existe dentro do prazo (vencimento_maximo), explique com cuidado:
"Eu queria muito te ajudar nessa condição, mas preciso respeitar um prazo limite para regularização. Dentro desse prazo, a melhor opção que consigo te oferecer é: ..."

## Perguntas de apoio (quando necessário)
- "Qual valor por [semana/quinzena/mês/dia] cabe no seu orçamento?"
- "Você prefere começar o pagamento quando? (A entrada respeita o prazo mínimo configurado.)"
- "Você prefere [periodicidade] ou [periodicidade]?"

## Fechamento
Se a pessoa aceitar claramente (ex.: "aceito", "fechado", "ok pode ser", "vamos fazer"), responda EXATAMENTE:
"Obrigado! Estou formalizando seu acordo."
Depois faça 1 pergunta objetiva para confirmar o combinado (ex.: periodicidade e número de parcelas).

## Ofertas Disponíveis (base de cálculo atual: {$this->cadencia})
$textoOfertas

Agora inicie a conversa de forma acolhedora, apresentando-se como LucIA e oferecendo a primeira opção à vista. Depois, pergunte qual formato (à vista ou parcelado) a pessoa prefere e se ela tem uma faixa de valor que cabe no orçamento.
PROMPT;
        $this->historico[] = ['role' => 'system', 'content' => $p];
    }

    public function enviarMensagem($msg)
    {
        $m = mb_strtolower($msg);

        // Se o cliente propôs data → ele iniciou a postergação
        if (preg_match('/\d{2}\/\d{2}/', $m)) {
            $this->estadoEntrada = 'liberada';
        }

        // Se o cliente disse que não consegue pagar agora
        if (str_contains($m, 'não consigo') || str_contains($m, 'agora não')) {
            $this->estadoEntrada = 'flexibilizada';
        }
        // 1. Primeiro garante que o histórico foi inicializado
        if (empty($this->historico)) {
            $this->inicializarConversa();
        }

        $recalculoNecessario = false;

        // 1. Detectar mudança de cadência
        $novaCadencia = $this->extrairCadencia($msg);
        if ($novaCadencia !== null && $novaCadencia !== $this->cadencia) {
            $this->setCadencia($novaCadencia);
            $recalculoNecessario = true;
        }

        // 2. Detectar tentativa de mudar a data de entrada (Ex: "dia 26/01")
        if (preg_match('/(\d{2})\/(\d{2})/', $msg, $matches)) {
            $dia = $matches[1];
            $mes = $matches[2];
            $ano = date('Y');
            $dataProposta = "$ano-$mes-$dia";

            try {
                $dataUser = new DateTime($dataProposta);
                // Pegamos a data máxima do parâmetro do JSON
                $dataMaxStr = $this->calculadora->getDataEntradaMaxima(); // Certifique-se que este método retorna Y-m-d ou d/m/Y
                $dataMax = DateTime::createFromFormat('d/m/Y', $dataMaxStr);

                if ($dataUser <= $dataMax) {
                    // Se a data é válida, recalculamos as ofertas com essa nova entrada
                    $this->ofertas = $this->calculadora->gerarOfertas($this->cadencia, $dataProposta);
                    $recalculoNecessario = true;
                }
            } catch (Exception $e) {
                // Se a data for inválida, apenas ignoramos o recálculo para não travar o chat
            }
        }

        if ($recalculoNecessario) {
            // Remove o system prompt antigo e reinicializa com as novas ofertas/datas
            if (isset($this->historico[0]) && $this->historico[0]['role'] === 'system') {
                array_shift($this->historico);
            }
            $this->inicializarConversa();
        }

        $this->historico[] = ['role' => 'user', 'content' => $msg];

        $contexto = stream_context_create([
            'http' => [
                'method' => 'POST',
                'header' => ["Content-Type: application/json", "Authorization: Bearer " . $this->apiKey],
                'content' => json_encode(['model' => 'gpt-4o-mini', 'messages' => $this->historico, 'temperature' => 0.7]),
                'ignore_errors' => true
            ],
            "ssl" => ["verify_peer" => false, "verify_peer_name" => false]
        ]);

        $response = file_get_contents('https://routellm.abacus.ai/v1/chat/completions', false, $contexto);

        if ($response === false) {
            return ['resposta' => 'Ops, tive um probleminha de conexão. Pode repetir?', 'status' => 'erro'];
        }

        $data = json_decode($response, true);
        $textoIA = $data['choices'][0]['message']['content'] ?? 'Erro na comunicação com a LucIA.';

        $this->historico[] = ['role' => 'assistant', 'content' => $textoIA];

        $status = (strpos(mb_strtolower($msg), 'aceito') !== false || strpos(mb_strtolower($textoIA), 'formalizando') !== false) ? 'acordo_fechado' : 'negociando';

        return ['resposta' => $textoIA, 'status' => $status];
    }

    public function setCadencia(string $c): void
    {
        $this->cadencia = $c;
        $this->ofertas = $this->calculadora->gerarOfertas($this->cadencia);
    }

    public function getCadencia(): string
    {
        return $this->cadencia;
    }

    private function extrairCadencia(string $msg): ?string
    {
        $m = mb_strtolower($msg);
        if (str_contains($m, 'diário') || str_contains($m, 'diario')) return 'diario';
        if (str_contains($m, 'quinzenal') || str_contains($m, 'quinzena')) return 'quinzenal';
        if (str_contains($m, 'semanal') || str_contains($m, 'semana')) return 'semanal';
        if (str_contains($m, 'mensal') || str_contains($m, 'mês') || str_contains($m, 'mes')) return 'mensal';
        return null;
    }

    private function recalcularOfertas()
    {
        // Só passa a data negociada se ela tiver sido liberada na conversa
        $dataParaCalculo = $this->postergaLiberada ? $this->dataEntradaNegociada : null;
        $this->ofertas = $this->calculadora->gerarOfertas($this->cadencia, $dataParaCalculo);
    }
}
