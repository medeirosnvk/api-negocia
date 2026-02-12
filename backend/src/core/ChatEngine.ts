import axios from "axios";
import { CalculadoraAcordo } from "./CalculadoraAcordo.js";
import { RagService } from "../services/RagService.js";
import {
  ConfiguracaoAcordo,
  CredorAPI,
  DividaDetalhe,
  EstadoConversa,
  MensagemChat,
  OfertaAPI,
  OfertaCalculada,
  ParametrosOferta,
  ResultadoChat,
} from "../types/index.js";
import {
  buscarCredores,
  buscarDividasCredor,
  buscarOfertasCredor,
  formalizarAcordo,
  formatarMoeda,
  validarDocumento,
} from "../services/ApiService.js";

/**
 * Motor de negociação com integração a LLM
 */
export class ChatEngine {
  private calculadora: CalculadoraAcordo;
  private ofertas: OfertaCalculada[];
  public historico: MensagemChat[] = [];
  private apiKey: string;
  private cadencia: "mensal" | "diario" | "semanal" | "quinzenal" = "mensal";
  private dataEntradaNegociada: string | null = null;
  private postergaLiberada: boolean = false;
  private ragService: RagService | null = null;

  // Campos para fluxo de apresentação
  private estado: EstadoConversa = "apresentacao";
  private apresentacaoEnviada: boolean = false;

  // Campos para fluxo de validação
  private credores: CredorAPI[] = [];
  private credorSelecionado: CredorAPI | null = null;
  private ofertasAPI: OfertaAPI[] = [];
  private ofertasAPIMensais: OfertaAPI[] = [];
  private ofertasMensais: OfertaCalculada[] = [];
  private ofertasAPISemanais: OfertaAPI[] = [];
  private ofertasSemanais: OfertaCalculada[] = [];
  private dividasDetalhe: DividaDetalhe[] = [];
  private parametrosOferta: ParametrosOferta = {
    plano: 10,
    periodicidade: 30,
    diasentrada: 0,
  };

  constructor(config: ConfiguracaoAcordo, apiKey: string, ragService?: RagService) {
    this.calculadora = new CalculadoraAcordo(config);
    this.ofertas = [];
    this.apiKey = apiKey;
    this.ragService = ragService || null;
  }

  public setHistorico(h: MensagemChat[]): void {
    this.historico = h;
  }

  public setCadencia(c: "mensal" | "diario" | "semanal" | "quinzenal"): void {
    this.cadencia = c;
    this.ofertas = this.calculadora.gerarOfertas(this.cadencia);
  }

  public getCadencia(): "mensal" | "diario" | "semanal" | "quinzenal" {
    return this.cadencia;
  }

  // Getters e setters para novos campos
  public getEstado(): EstadoConversa {
    return this.estado;
  }

  public setEstado(e: EstadoConversa): void {
    this.estado = e;
  }

  public getCredores(): CredorAPI[] {
    return this.credores;
  }

  public setCredores(c: CredorAPI[]): void {
    this.credores = c;
  }

  public getCredorSelecionado(): CredorAPI | null {
    return this.credorSelecionado;
  }

  public setCredorSelecionado(c: CredorAPI | null): void {
    this.credorSelecionado = c;
  }

  public getOfertasAPI(): OfertaAPI[] {
    return this.ofertasAPI;
  }

  public setOfertasAPI(o: OfertaAPI[]): void {
    this.ofertasAPI = o;
  }

  public getOfertasAPIMensais(): OfertaAPI[] {
    return this.ofertasAPIMensais;
  }

  public setOfertasAPIMensais(o: OfertaAPI[]): void {
    this.ofertasAPIMensais = o;
    this.ofertasMensais = o.length > 0 ? this.mapearOfertasAPI(o) : [];
  }

  public getOfertasAPISemanais(): OfertaAPI[] {
    return this.ofertasAPISemanais;
  }

  public setOfertasAPISemanais(o: OfertaAPI[]): void {
    this.ofertasAPISemanais = o;
    this.ofertasSemanais = o.length > 0 ? this.mapearOfertasAPI(o) : [];
  }

  public getApresentacaoEnviada(): boolean {
    return this.apresentacaoEnviada;
  }

  public setApresentacaoEnviada(v: boolean): void {
    this.apresentacaoEnviada = v;
  }

  public getParametrosOferta(): ParametrosOferta {
    return this.parametrosOferta;
  }

  public setParametrosOferta(p: ParametrosOferta): void {
    this.parametrosOferta = p;
  }

  /**
   * Inicializa a conversa se o histórico estiver vazio
   */
  private inicializarConversa(msg: string): void {
    // Atualiza ofertas com cadência atual
    this.ofertas = this.calculadora.gerarOfertas(this.cadencia);

    const hoje = this.formatarData(new Date());
    const dataSugerida = this.calculadora.getDataEntrada();
    const dataLimite = this.calculadora.getDataEntradaMaxima();
    const m = msg.toLowerCase();

    let recalculoNecessario = false;

    // Textos das ofertas
    const textoOfertas = this.ofertas
      .map(
        (o) =>
          `- ${o.parcelas}x de R$ ${o.valor_parcela} (Venc. Final: ${o.vencimento_final})`,
      )
      .join("\n");

    let notaSistema = "";
    if (this.postergaLiberada) {
      notaSistema = `### ATENÇÃO: O devedor solicitou ou você liberou a postergação. 
As ofertas abaixo JÁ ESTÃO CALCULADAS com a primeira parcela para o dia ${dataSugerida}. 
Confirme com o devedor que você conseguiu ajustar para esta data e apresente os novos valores abaixo.`;
    }

    // Detectar pedido de data ou resistência
    const matchData = msg.match(/(\d{2})\/(\d{2})/);
    if (matchData) {
      const ano = new Date().getFullYear();
      this.dataEntradaNegociada = `${ano}-${matchData[2]}-${matchData[1]}`;
      this.postergaLiberada = true;
      recalculoNecessario = true;
    } else if (
      m.includes("não consigo") ||
      m.includes("adiar") ||
      m.includes("prazo")
    ) {
      this.dataEntradaNegociada = dataLimite.replace(
        /(\d{2})\/(\d{2})\/(\d{4})/,
        "$3-$2-$1",
      );
      this.postergaLiberada = true;
      recalculoNecessario = true;
    }

    if (recalculoNecessario) {
      this.recalcularOfertas();
    }

    const prompt = `Você é a LucIA, uma assistente virtual de negociação. Seu objetivo é ajudar a pessoa a regularizar uma pendência de forma acolhedora, respeitosa e prática, considerando que ela pode estar passando por um momento difícil (ninguém fica em atraso porque quer).
${notaSistema}
## Como você funciona (importante)
- Você trabalha em conjunto com um motor de cálculo (CalculadoraAcordo) que calcula valores, datas e condições.
- As ofertas exibidas para você são calculadas e respeitam as regras do negócio, principalmente o limite de vencimento_maximo.
- Quando a pessoa pedir uma periodicidade diferente (semanal/quinzenal/diária) ou quando ela informar um valor aproximado que consegue pagar, você deve fazer o esforço de adequar a proposta usando as condições calculadas pelo sistema.

## Tom e postura
- Empática, humana e sem julgamentos.
- Objetiva e clara: explique valores e condições de forma simples.
- Evite a palavra "dívida". Use "pendência", "valor em aberto", "regularização".

## Formatação das mensagens
- NUNCA use asteriscos (*) de forma excessiva ou para criar listas.
- Use **negrito** (dois asteriscos) APENAS para destacar valores monetários (ex: **R$ 150,00**) e datas (ex: **15/02/2026**).
- Escreva de forma fluida, em parágrafos curtos, sem bullets ou listas extensas.
- Mantenha as respostas concisas e conversacionais, como uma conversa real de WhatsApp.

## REGRA DE OURO PARA O INÍCIO:
- Olhe para a oferta de "1x" na lista abaixo.
- Use a data de vencimento que aparece EXATAMENTE na oferta de 1x para oferecer a opção à vista.
- Se o cliente disser que não pode pagar nessa data, informe que você pode postergar a entrada para as opções parceladas até o dia ${dataLimite}.

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
- A data de hoje é: ${hoje}.
- A data da primeira parcela (entrada) já está calculada para: ${dataSugerida}.
- A data máxima permitida para a entrada é: ${dataLimite}.
- Se a data da entrada for igual à data de hoje (${hoje}), você deve dizer: "com vencimento hoje" ou "a primeira parcela é para hoje".
- Se a data da entrada for diferente de hoje, você deve informar: "a primeira parcela fica para o dia ${dataSugerida}".
- Se o devedor pedir para postergar a entrada além de ${dataLimite}, explique que o prazo máximo permitido para começar é ${dataLimite}.

## Regra de Entrada e Flexibilidade:
- A data máxima permitida para a entrada é: ${dataLimite}.
- Se o devedor sugerir uma data de entrada que seja IGUAL ou ANTERIOR a ${dataLimite}, aceite com entusiasmo!
- Exemplo: "Que ótima notícia! Consigo sim ajustar a entrada para o dia solicitado. Com essa nova data, as condições ficaram assim: [Apresentar novas ofertas]".
- Se ele pedir uma data APÓS ${dataLimite}, explique que o limite do sistema para este acordo é ${dataLimite}.

## Regra de Entrada e Postergação:
- A data de hoje é: ${hoje}.
- A primeira parcela (entrada) já está calculada para: ${dataSugerida}.
- A data máxima permitida para postergar a entrada é: ${dataLimite}.
- Se ${dataSugerida} for igual a ${hoje}, diga: "a primeira parcela é para hoje" ou "com vencimento hoje".
- Se ${dataSugerida} for diferente de ${hoje}, diga: "a primeira parcela fica para o dia ${dataSugerida}".
- Se o devedor pedir para adiar a entrada além de ${dataLimite}, explique com empatia: "Entendo sua situação, mas o prazo máximo que consigo liberar para a entrada é até o dia ${dataLimite}. Conseguimos assim?"
- Nunca prometa uma data de entrada que ultrapasse ${dataLimite}.

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

## Ofertas Disponíveis (base de cálculo atual: ${this.cadencia})
${textoOfertas}

Agora inicie a conversa de forma acolhedora, apresentando-se como LucIA e oferecendo a primeira opção à vista. Depois, pergunte qual formato (à vista ou parcelado) a pessoa prefere e se ela tem uma faixa de valor que cabe no orçamento.`;

    this.historico.push({
      role: "system",
      content: prompt,
    });
  }

  /**
   * Extrai a cadência da mensagem do usuário
   */
  private extrairCadencia(
    msg: string,
  ): "mensal" | "diario" | "semanal" | "quinzenal" | null {
    const m = msg.toLowerCase();
    if (m.includes("diário") || m.includes("diario")) return "diario";
    if (m.includes("quinzenal") || m.includes("quinzena")) return "quinzenal";
    if (m.includes("semanal") || m.includes("semana")) return "semanal";
    if (m.includes("mensal") || m.includes("mês") || m.includes("mes"))
      return "mensal";
    return null;
  }

  /**
   * Recalcula ofertas com base em data negociada
   */
  private recalcularOfertas(): void {
    const dataParaCalculo = this.postergaLiberada
      ? this.dataEntradaNegociada
      : null;
    this.ofertas = this.calculadora.gerarOfertas(
      this.cadencia,
      dataParaCalculo,
    );
  }

  /**
   * Formata data no padrão dd/mm/yyyy
   */
  private formatarData(data: Date): string {
    const dia = String(data.getDate()).padStart(2, "0");
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
  }

  /**
   * Formata data ISO para dd/mm/yyyy
   */
  private formatarDataISO(dataISO: string): string {
    const [ano, mes, dia] = dataISO.split("-");
    return `${dia}/${mes}/${ano}`;
  }

  /**
   * Gera mensagem de apresentação acolhedora (sem mencionar dívida/negociação)
   */
  private gerarMensagemBoasVindas(): string {
    return "Olá! Eu sou a LucIA, assistente virtual da Cobrance. Estou à disposição para te ajudar no que precisar. Como posso te auxiliar hoje?";
  }

  /**
   * Processa a resposta do usuário no estado de apresentação.
   * Usa LLM para gerar uma resposta natural que conduz ao pedido de CPF/CNPJ.
   */
  /**
   * Conversa natural com o usuário antes de pedir documento.
   * Se detectar CPF/CNPJ na mensagem, já processa como documento.
   * Se o usuário indicar que precisa de ajuda, guia para o documento.
   */
  private async processarConversa(msg: string): Promise<ResultadoChat> {
    // Se o usuário já enviou um CPF/CNPJ, processar direto
    const docRegex = /\d{11,14}|\d{3}\.?\d{3}\.?\d{3}[-.]?\d{2}|\d{2}\.?\d{3}\.?\d{3}\/?\d{4}[-.]?\d{2}/;
    if (docRegex.test(msg.replace(/\s/g, ""))) {
      this.estado = "aguardando_documento";
      return await this.processarDocumento(msg);
    }

    this.historico.push({ role: "user", content: msg });

    // Detectar se o usuário indicou o que precisa (negociar, pagar, ver pendências, etc.)
    const m = msg.toLowerCase();
    const querAjuda = /negoci|pagar|parcela|boleto|acordo|d[ií]vida|pend[eê]ncia|atras|conta|d[eé]bito|regulariz|segunda.?via|quitar/.test(m);

    const promptConversa = querAjuda
      ? `Você é a LucIA, assistente virtual da Cobrance. O usuário indicou que precisa de ajuda com algo específico.

Responda de forma acolhedora e natural, e peça o CPF ou CNPJ para que você possa identificá-lo no sistema e ajudá-lo.

Regras:
- Seja breve e conversacional (máximo 2-3 frases)
- NÃO mencione "dívida" ou "cobrança" diretamente
- Peça o CPF/CNPJ de forma natural como identificação
- Use tom acolhedor e profissional`
      : `Você é a LucIA, assistente virtual da Cobrance. Você está conversando com o usuário.

Responda de forma natural e acolhedora ao que o usuário disse. Se fizer sentido no contexto, pergunte em que pode ajudá-lo.

Regras:
- Seja breve e conversacional (máximo 2-3 frases)
- NÃO mencione "dívida", "pendência", "cobrança", "negociação" ou "regularização"
- NÃO peça CPF/CNPJ ainda — apenas converse naturalmente
- Use tom acolhedor e profissional`;

    // Injetar contexto RAG se disponível
    let contextoRag = "";
    if (this.ragService?.estaInicializado()) {
      const resultados = await this.ragService.buscar(msg, 2);
      if (resultados.length > 0) {
        contextoRag = this.ragService.formatarContexto(resultados);
      }
    }

    const mensagens: MensagemChat[] = [
      { role: "system", content: promptConversa + (contextoRag ? `\n\n${contextoRag}` : "") },
      ...this.historico,
    ];

    try {
      const response = await axios.post(
        "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
        {
          model: "gemini-2.5-flash-lite",
          messages: mensagens,
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          timeout: 60000,
        },
      );

      const textoIA =
        response.data?.choices?.[0]?.message?.content ||
        "Fico feliz em te atender! Em que posso te ajudar?";

      this.historico.push({ role: "assistant", content: textoIA });

      // Se pediu CPF/CNPJ, transicionar para aguardando_documento
      if (querAjuda) {
        this.estado = "aguardando_documento";
        return { resposta: textoIA, status: "aguardando_documento" };
      }

      return { resposta: textoIA, status: "conversando" };
    } catch {
      const fallback = "Fico feliz em te atender! Em que posso te ajudar?";
      this.historico.push({ role: "assistant", content: fallback });
      return { resposta: fallback, status: "conversando" };
    }
  }

  /**
   * Processa documento enviado pelo usuário
   */
  private async processarDocumento(msg: string): Promise<ResultadoChat> {
    const validacao = validarDocumento(msg);

    if (!validacao.valido) {
      this.historico.push({ role: "user", content: msg });
      const resposta =
        "Hmm, não consegui identificar seu documento. Por favor, informe apenas os números do seu CPF (11 dígitos) ou CNPJ (14 dígitos).";
      this.historico.push({ role: "assistant", content: resposta });
      return { resposta, status: "aguardando_documento" };
    }

    // Buscar credores na API
    const credores = await buscarCredores(validacao.numeros);

    if (credores.length === 0) {
      this.historico.push({ role: "user", content: msg });
      const resposta =
        "Boa notícia! Não encontrei nenhuma pendência em seu nome. Se você recebeu uma comunicação nossa, pode ter sido um engano ou a situação já foi regularizada. Posso ajudar com mais alguma coisa?";
      this.historico.push({ role: "assistant", content: resposta });
      this.estado = "conversando";
      return { resposta, status: "conversando" };
    }

    this.credores = credores;
    this.historico.push({ role: "user", content: msg });

    if (credores.length === 1) {
      // Apenas um credor, iniciar negociação diretamente
      this.credorSelecionado = credores[0];
      return await this.iniciarNegociacaoComCredor();
    }

    // Múltiplos credores, listar para seleção
    this.estado = "selecionando_credor";
    const listaCredores = credores
      .map((c, i) => `${i + 1}. ${c.nome_empresa_devida}`)
      .join("\n");

    const resposta = `Encontrei ${credores.length} pendências em seu nome com as seguintes empresas:\n\n${listaCredores}\n\nQual delas você gostaria de negociar? (Digite o número)`;
    this.historico.push({ role: "assistant", content: resposta });

    return { resposta, status: "selecionando_credor" };
  }

  /**
   * Processa seleção de credor quando há múltiplos
   */
  private async processarSelecaoCredor(msg: string): Promise<ResultadoChat> {
    const numero = parseInt(msg.trim(), 10);

    if (isNaN(numero) || numero < 1 || numero > this.credores.length) {
      this.historico.push({ role: "user", content: msg });
      const resposta = `Por favor, digite um número de 1 a ${this.credores.length} para selecionar a pendência que deseja negociar.`;
      this.historico.push({ role: "assistant", content: resposta });
      return { resposta, status: "selecionando_credor" };
    }

    this.credorSelecionado = this.credores[numero - 1];
    this.historico.push({ role: "user", content: msg });

    return await this.iniciarNegociacaoComCredor();
  }

  /**
   * Inicia negociação após selecionar credor
   */
  private async iniciarNegociacaoComCredor(): Promise<ResultadoChat> {
    if (!this.credorSelecionado) {
      throw new Error("Nenhum credor selecionado");
    }

    // Buscar ofertas mensais, semanais e detalhes das dívidas em paralelo
    this.parametrosOferta = { plano: 10, periodicidade: 30, diasentrada: 0 };

    const hoje = new Date();
    const database = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;
    const iddevedor = this.credorSelecionado.iddevedor;

    const [ofertasMensais, ofertasSemanais, dividasResult] = await Promise.all([
      buscarOfertasCredor(iddevedor, 10, 30, 0),   // mensal
      buscarOfertasCredor(iddevedor, 10, 7, 0),    // semanal
      buscarDividasCredor(iddevedor, database),
    ]);

    // Cachear ofertas mensais (padrão)
    this.ofertasAPI = ofertasMensais;
    this.ofertasAPIMensais = ofertasMensais;
    this.ofertasMensais = ofertasMensais.length > 0 ? this.mapearOfertasAPI(ofertasMensais) : [];
    this.dividasDetalhe = dividasResult;

    // Cachear ofertas semanais
    this.ofertasAPISemanais = ofertasSemanais;
    this.ofertasSemanais = ofertasSemanais.length > 0 ? this.mapearOfertasAPI(ofertasSemanais) : [];

    if (this.ofertasAPI.length === 0) {
      const resposta =
        "No momento não temos ofertas de negociação disponíveis para esta pendência. Posso te ajudar com algo mais?";
      this.historico.push({ role: "assistant", content: resposta });
      this.estado = "conversando";
      return { resposta, status: "conversando" };
    }

    // Mapear ofertas mensais da API para o formato interno
    this.ofertas = this.mapearOfertasAPI(this.ofertasAPI);
    this.estado = "negociando";

    // Criar prompt do sistema com as ofertas e detalhes das dívidas
    this.criarPromptNegociacao();

    // Chamar LLM para gerar resposta inicial
    return await this.chamarLLM(
      `O cliente ${this.credorSelecionado.nome_credor} deseja negociar sua pendência com ${this.credorSelecionado.nome_empresa_devida}. Apresente-se brevemente, ofereça a opção à vista primeiro (use o valor total da oferta de 1x) e informe que também existe a possibilidade de parcelamento caso prefira.`,
    );
  }

  /**
   * Mapeia ofertas da API para o formato interno
   */
  private mapearOfertasAPI(ofertasAPI: OfertaAPI[]): OfertaCalculada[] {
    // Ordenar por plano_parcela para garantir sequência correta
    const sorted = [...ofertasAPI].sort(
      (a, b) => a.plano_parcela - b.plano_parcela,
    );

    return sorted.map((o) => {
      // Coletar datas percorrendo do índice 0 até o plano correspondente
      const datasParcelas: string[] = [];
      for (let i = 0; i < o.plano_parcela && i < sorted.length; i++) {
        datasParcelas.push(
          this.formatarDataISO(sorted[i].data_pagamento_parcela),
        );
      }

      return {
        parcelas: o.plano_parcela,
        data_primeiro_pagamento:
          datasParcelas[0] ||
          this.formatarDataISO(sorted[0].data_pagamento_parcela),
        vencimento_final:
          datasParcelas[datasParcelas.length - 1] ||
          this.formatarDataISO(o.data_pagamento_parcela),
        valor_parcela: parseFloat(o.valor_parcela).toFixed(2),
        total_com_taxas: o.total_geral_com_juros.toFixed(2),
        datas_parcelas: datasParcelas,
      };
    });
  }

  /**
   * Cria prompt de negociação com ofertas
   */
  private criarPromptNegociacao(): void {
    const hoje = this.formatarData(new Date());
    const credor = this.credorSelecionado!;

    const textoOfertas = this.ofertas
      .map((o) => {
        const detalheParcelas = o.datas_parcelas
          .map(
            (data, i) => `  Parcela ${i + 1}: ${data} - R$ ${o.valor_parcela}`,
          )
          .join("\n");
        return `- ${o.parcelas}x de R$ ${o.valor_parcela} (Total: R$ ${o.total_com_taxas}, 1º pagamento: ${o.data_primeiro_pagamento}, Último: ${o.vencimento_final})\n${detalheParcelas}`;
      })
      .join("\n");

    // Montar texto dos detalhes das dívidas se disponíveis
    let textoDividas = "";
    if (this.dividasDetalhe.length > 0) {
      textoDividas = this.dividasDetalhe
        .map((d, i) => {
          const vencimento = d.data_vencimento_original
            ? this.formatarDataISO(d.data_vencimento_original.split("T")[0])
            : "N/A";
          return `${i + 1}. Contrato: ${d.numero_contrato} | Parcela: ${d.parcela_atrasada} | Valor original: R$ ${formatarMoeda(d.valor_original)} | Valor atualizado: R$ ${formatarMoeda(d.valor_total_com_juros)} | Vencimento: ${vencimento} | Dias em atraso: ${d.dias_em_atraso}`;
        })
        .join("\n");
    }

    const prompt = `Você é a LucIA, uma assistente virtual de negociação. Seu objetivo é ajudar a pessoa a regularizar uma pendência de forma acolhedora, respeitosa e prática.

## Dados do Cliente
- Nome: ${credor.nome_credor}
- Empresa credora: ${credor.nome_empresa_devida}
${textoDividas ? `\n## Detalhes das Pendências\n${textoDividas}\n\nSempre que o cliente perguntar sobre suas pendências ou dívidas, OBRIGATORIAMENTE informe os dias em atraso de cada contrato junto com os demais dados (contrato, parcela, valor original, valor atualizado, vencimento).` : ""}

## Tom e postura
- Empática, humana e sem julgamentos.
- Objetiva e clara: explique valores e condições de forma simples.
- Evite a palavra "dívida". Use "pendência", "valor em aberto", "regularização".

## Formatação das mensagens
- NUNCA use asteriscos (*) de forma excessiva ou para criar listas.
- Use **negrito** (dois asteriscos) APENAS para destacar valores monetários e datas.
- Escreva de forma fluida, em parágrafos curtos.
- Mantenha as respostas concisas e conversacionais.

## Apresentação
- Apresente-se e cumprimente o cliente APENAS na primeira mensagem da negociação. Nas mensagens seguintes, vá direto ao ponto sem se reapresentar.

## Estratégia de negociação
1) Comece oferecendo a opção à vista e informe que também é possível parcelar caso o cliente prefira.
2) Se necessário, ofereça mais 1 ou 2 opções curtas (ex.: 2x e 3x).
3) Só amplie para mais parcelas quando a pessoa pedir.

## Entendimento de periodicidade
- "por semana", "semanal" => semanal
- "quinzena", "quinzenal", "a cada 15 dias" => quinzenal
- "todo dia", "diário", "por dia" => diário
- "por mês", "mensal" => mensal

## Ofertas Disponíveis
${textoOfertas}

## Capacidades do Sistema
Você tem acesso às seguintes funcionalidades automáticas:
- **Consulta de dívidas**: Se o cliente perguntar sobre detalhes das suas dívidas, o sistema busca automaticamente.
- **Mudança de condições**: O sistema detecta automaticamente quando o cliente quer alterar as condições do acordo. Exemplos do que é detectado:
  - Número de parcelas: "5 vezes", "parcelar em 10x", "dividir em 3"
  - Periodicidade: "semanal", "toda semana", "de 15 em 15 dias", "a cada mês", "quinzenalmente", "2 vezes por mês", "de 7 em 7", "semanalmente"
  - Data da primeira parcela: "pagar dia 15/03", "começar semana que vem", "primeira parcela daqui 10 dias", "amanhã", "mês que vem", "adiar", "postergar", "empurrar pra frente"
  Quando qualquer uma dessas mudanças é detectada, o sistema recalcula e fornece novas ofertas automaticamente. Você não precisa perguntar confirmação ao cliente antes de recalcular — apenas apresente as novas condições.
- **Formalização automática**: Quando o cliente aceitar uma proposta, o sistema formaliza o acordo automaticamente. Não é necessário redirecionar para outro canal.

## Fechamento
Se a pessoa aceitar claramente (ex.: "aceito", "fechado", "ok pode ser"), responda EXATAMENTE:
"Obrigado! Estou formalizando seu acordo."
O sistema irá processar a formalização automaticamente.

Data de hoje: ${hoje}`;

    this.historico.push({
      role: "system",
      content: prompt,
    });
  }

  /**
   * Chama a API LLM e retorna resposta
   */
  private async chamarLLM(mensagemInterna?: string): Promise<ResultadoChat> {
    try {
      // Se houver mensagem interna, adicionar temporariamente
      let mensagens: MensagemChat[] = mensagemInterna
        ? [
            ...this.historico,
            { role: "user" as const, content: mensagemInterna },
          ]
        : [...this.historico];

      // Injetar contexto RAG no estado de negociação
      if (this.estado === "negociando" && this.ragService?.estaInicializado()) {
        const consulta = mensagemInterna || this.historico.filter(m => m.role === "user").pop()?.content || "";
        if (consulta) {
          const resultados = await this.ragService.buscar(consulta, 3);
          if (resultados.length > 0) {
            const contextoRag = this.ragService.formatarContexto(resultados);
            mensagens = [
              mensagens[0],
              { role: "system" as const, content: contextoRag },
              ...mensagens.slice(1),
            ];
          }
        }
      }

      const response = await axios.post(
        "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
        {
          model: "gemini-2.5-flash-lite",
          messages: mensagens,
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          timeout: 60000,
        },
      );

      const textoIA =
        response.data?.choices?.[0]?.message?.content ||
        "Erro na comunicação com a LucIA.";

      this.historico.push({
        role: "assistant",
        content: textoIA,
      });

      // Detectar fechamento de acordo
      const status = textoIA.toLowerCase().includes("formalizando")
        ? "acordo_fechado"
        : "negociando";

      return {
        resposta: textoIA,
        status,
        iddevedor: this.credorSelecionado?.iddevedor,
        plano: this.parametrosOferta.plano,
        periodicidade: this.parametrosOferta.periodicidade,
        diasentrada: this.parametrosOferta.diasentrada,
      };
    } catch (error) {
      let errorMessage = "Desconhecido";
      if (error instanceof axios.AxiosError) {
        errorMessage = `Status ${error.response?.status}: ${JSON.stringify(error.response?.data || error.message)}`;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      throw new Error(`Erro ao chamar API LLM: ${errorMessage}`);
    }
  }

  /**
   * Detecta qual plano foi discutido nas últimas mensagens do assistente
   */
  private detectarPlanoAceito(): number | undefined {
    if (this.ofertasAPI.length === 0) return undefined;
    if (this.ofertasAPI.length === 1) return this.ofertasAPI[0].plano_parcela;

    // Pegar as últimas mensagens do assistente para detectar o plano
    const ultimasMensagens = this.historico
      .filter((m) => m.role === "assistant")
      .slice(-3)
      .map((m) => m.content.toLowerCase());

    const textoRecente = ultimasMensagens.join(" ");

    // Tentar encontrar referência a número de parcelas: "3x", "3 parcelas", "3 vezes"
    const matchParcelas = textoRecente.match(
      /(\d+)\s*(?:x\b|parcela|vezes|vez)/,
    );
    if (matchParcelas) {
      const numParcelas = parseInt(matchParcelas[1], 10);
      const ofertaCorrespondente = this.ofertasAPI.find(
        (o) => o.plano_parcela === numParcelas,
      );
      if (ofertaCorrespondente) {
        return ofertaCorrespondente.plano_parcela;
      }
    }

    // Tentar detectar "à vista" => plano 1
    if (textoRecente.includes("à vista") || textoRecente.includes("a vista")) {
      const ofertaVista = this.ofertasAPI.find((o) => o.plano_parcela === 1);
      if (ofertaVista) {
        return ofertaVista.plano_parcela;
      }
    }

    // Fallback: retornar o primeiro plano
    return this.ofertasAPI[0].plano_parcela;
  }

  /**
   * Detecta intenção de consultar dívidas
   */
  private detectarIntentoDividas(msg: string): boolean {
    const m = msg.toLowerCase();
    return /minhas d[ií]vidas|quanto devo|quais.*pend[eê]ncias|detalh.*d[ií]vida|meus d[eé]bitos/.test(
      m,
    );
  }

  /**
   * Processa consulta de dívidas do credor
   */
  private async processarConsultaDividas(): Promise<ResultadoChat> {
    if (!this.credorSelecionado) {
      throw new Error("Nenhum credor selecionado para consultar dívidas");
    }

    // Usar data atual como database (formato yyyy-mm-dd)
    const hoje = new Date();
    const database = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;

    const dividas = await buscarDividasCredor(
      this.credorSelecionado.iddevedor,
      database,
    );

    if (dividas.length === 0) {
      const contexto =
        "O sistema não encontrou detalhes adicionais sobre as dívidas deste credor.";
      this.historico.push({ role: "system", content: contexto });
      return await this.chamarLLM();
    }

    const textoDividas = dividas
      .map((d, i) => {
        const vencimento = d.data_vencimento_original
          ? this.formatarDataISO(d.data_vencimento_original.split("T")[0])
          : "N/A";
        return `${i + 1}. Contrato: ${d.numero_contrato} | Parcela: ${d.parcela_atrasada} | Valor original: R$ ${formatarMoeda(d.valor_original)} | Valor atualizado: R$ ${formatarMoeda(d.valor_total_com_juros)} | Vencimento: ${vencimento} | Dias em atraso: ${d.dias_em_atraso}`;
      })
      .join("\n");

    const contexto = `O cliente solicitou detalhes das suas pendências. Aqui estão todos os contratos retornados pelo sistema:\n\n${textoDividas}\n\nTotal de contratos: ${dividas.length}\n\nAPRESENTE OBRIGATORIAMENTE para cada contrato: número do contrato, parcela atrasada, valor original, valor atualizado, data de vencimento e DIAS EM ATRASO. Os dias em atraso são uma informação essencial e NUNCA devem ser omitidos.\nApresente esses dados de forma clara e acolhedora. Evite a palavra "dívida", use "pendência" ou "valor em aberto".`;
    this.historico.push({ role: "system", content: contexto });

    return await this.chamarLLM();
  }

  /**
   * Detecta mudança de condições (plano, periodicidade, dias entrada)
   */
  private detectarMudancaCondicoes(
    msg: string,
  ): Partial<ParametrosOferta> | null {
    const m = msg.toLowerCase();
    const mudancas: Partial<ParametrosOferta> = {};
    let temMudanca = false;

    // Detectar plano (número de parcelas):
    // "10 vezes", "parcelar em 5x", "5 parcelas", "dividir em 3", "parcela em 6"
    const matchPlano = m.match(
      /(\d+)\s*(?:x\b|vezes|parcelas?|vez)|(?:parcelar|dividir|divide|parcela)\s*(?:em|de)?\s*(\d+)/,
    );
    if (matchPlano) {
      const num = parseInt(matchPlano[1] || matchPlano[2], 10);
      if (num > 0) {
        mudancas.plano = num;
        temMudanca = true;
      }
    }

    // Detectar periodicidade — variações naturais
    // Diário: "diário", "diaria", "todo dia", "por dia", "diariamente", "a cada dia", "1 em 1 dia", "de 1 em 1"
    if (
      /\bdi[aá]ri[oa]\b|\btodo\s*dia\b|\bpor\s*dia\b|\bdiariamente\b|\ba\s*cada\s*dia\b|\b(?:de\s*)?1\s*em\s*1\s*dia/.test(m)
    ) {
      mudancas.periodicidade = 1;
      temMudanca = true;
    }
    // Semanal: "semanal", "por semana", "toda semana", "semanalmente", "a cada semana",
    // "1 vez por semana", "uma vez por semana", "de 7 em 7", "a cada 7 dias", "de semana em semana"
    else if (
      /\bsemanal\b|\bsemanalmente\b|\bpor\s*semana\b|\btoda\s*semana\b|\ba\s*cada\s*semana\b|\b(?:de\s*)?7\s*em\s*7\b|\ba\s*cada\s*7\s*dias\b|\b(?:uma|1)\s*vez\s*(?:por|na|a\s*cada)\s*semana\b|\bde\s*semana\s*em\s*semana\b/.test(m)
    ) {
      mudancas.periodicidade = 7;
      temMudanca = true;
    }
    // Quinzenal: "quinzenal", "quinzena", "a cada 15 dias", "quinzenalmente", "de 15 em 15",
    // "2 vezes por mês", "duas vezes por mês", "2 vezes no mês", "a cada quinzena", "de quinzena em quinzena"
    else if (
      /\bquinzenal\b|\bquinzenalmente\b|\bquinzena\b|\ba\s*cada\s*15\s*dias\b|\b(?:de\s*)?15\s*em\s*15\b|\b(?:duas|2)\s*vezes\s*(?:por|no|ao)\s*m[eê]s\b|\ba\s*cada\s*quinzena\b|\bde\s*quinzena\s*em\s*quinzena\b/.test(m)
    ) {
      mudancas.periodicidade = 15;
      temMudanca = true;
    }
    // Mensal: "mensal", "por mês", "todo mês", "mensalmente", "a cada mês",
    // "1 vez por mês", "uma vez por mês", "de 30 em 30", "a cada 30 dias", "de mês em mês"
    else if (
      /\bmensal\b|\bmensalmente\b|\bpor\s*m[eê]s\b|\btodo\s*m[eê]s\b|\ba\s*cada\s*m[eê]s\b|\b(?:de\s*)?30\s*em\s*30\b|\ba\s*cada\s*30\s*dias\b|\b(?:uma|1)\s*vez\s*(?:por|no|ao|a\s*cada)\s*m[eê]s\b|\bde\s*m[eê]s\s*em\s*m[eê]s\b/.test(m)
    ) {
      mudancas.periodicidade = 30;
      temMudanca = true;
    }

    // Detectar mudança de data da primeira parcela / entrada
    // 1. Data explícita dd/mm: "dia 15/03", "primeira parcela 20/02", "pagar no dia 10/03"
    const matchDataExplicita = m.match(
      /(?:dia|data|primeira?\s*(?:parcela)?|pagar|pag(?:amento)?|come[cç]ar|iniciar|vencimento)\s*(?:no|em|para|pro|pra|de)?\s*(?:o?\s*dia)?\s*(\d{1,2})\s*[\/\-]\s*(\d{1,2})(?:\s*[\/\-]\s*(\d{2,4}))?/,
    );
    if (matchDataExplicita) {
      const dia = parseInt(matchDataExplicita[1], 10);
      const mes = parseInt(matchDataExplicita[2], 10);
      const anoStr = matchDataExplicita[3];
      const ano = anoStr
        ? anoStr.length === 2
          ? 2000 + parseInt(anoStr, 10)
          : parseInt(anoStr, 10)
        : new Date().getFullYear();

      const dataAlvo = new Date(ano, mes - 1, dia);
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const diffDias = Math.max(0, Math.round((dataAlvo.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)));
      mudancas.diasentrada = diffDias;
      temMudanca = true;
    }

    // 2. "daqui X dias", "em X dias", "entrada em X dias", "começar em X dias",
    //    "primeiro pagamento em X dias", "primeira parcela em X dias",
    //    "pagar a primeira em X dias", "pagar daqui X dias"
    if (mudancas.diasentrada === undefined) {
      const matchDiasEntrada = m.match(
        /(?:entrada|come[cç]ar|iniciar|primeira?\s*(?:parcela|pagamento)?|pagar?\s*(?:a\s*primeira)?|primeiro\s*(?:pagamento|boleto)?)\s*(?:em|de|daqui|daqui\s*a)\s*(\d+)\s*dias?|(?:daqui|daqui\s*a)\s*(\d+)\s*dias?/,
      );
      if (matchDiasEntrada) {
        mudancas.diasentrada = parseInt(matchDiasEntrada[1] || matchDiasEntrada[2], 10);
        temMudanca = true;
      }
    }

    // 3. "semana que vem", "próxima semana" → ~7 dias
    if (mudancas.diasentrada === undefined) {
      if (/\bsemana\s*que\s*vem\b|\bpr[oó]xima\s*semana\b/.test(m)) {
        mudancas.diasentrada = 7;
        temMudanca = true;
      }
      // "mês que vem", "próximo mês", "no próximo mês" → ~30 dias
      else if (/\bm[eê]s\s*que\s*vem\b|\bpr[oó]ximo\s*m[eê]s\b/.test(m)) {
        mudancas.diasentrada = 30;
        temMudanca = true;
      }
      // "depois de amanhã" → 2 dias
      else if (/\bdepois\s*de\s*amanh[aã]\b/.test(m)) {
        mudancas.diasentrada = 2;
        temMudanca = true;
      }
      // "amanhã" → 1 dia
      else if (/\bamanh[aã]\b/.test(m)) {
        mudancas.diasentrada = 1;
        temMudanca = true;
      }
    }

    // 4. "adiar", "postergar", "empurrar", "mais pra frente", "mais tempo" (sem valor específico)
    //    Interpretar como pedido genérico — adicionar 7 dias sobre o diasentrada atual
    if (mudancas.diasentrada === undefined) {
      if (
        /\badiar\b|\bpostergar\b|\bempurrar\b|\bmais\s*(?:pra|para)\s*frente\b|\bmais\s*tempo\b|\bmais\s*prazo\b|\bjogar\s*(?:pra|para)\s*frente\b/.test(m)
      ) {
        mudancas.diasentrada = this.parametrosOferta.diasentrada + 7;
        temMudanca = true;
      }
    }

    return temMudanca ? mudancas : null;
  }

  /**
   * Detecta valor de parcela informado pelo usuário
   * Ex: "posso pagar 200", "R$ 150", "parcela de 200", "tenho 300"
   */
  private detectarValorParcela(msg: string): number | null {
    const m = msg.toLowerCase();

    // Padrões: "R$ 200", "R$200", "r$ 200,00", "r$200.00"
    const matchRS = m.match(
      /r\$\s*(\d+(?:[.,]\d{1,2})?)/,
    );
    if (matchRS) {
      return parseFloat(matchRS[1].replace(",", "."));
    }

    // Padrões com contexto de valor/orçamento:
    // "posso pagar 200", "consigo pagar 200", "meu orçamento é 150",
    // "parcela de 200", "parcelas de até 200", "cabe 200", "tenho 200",
    // "dá pra 200", "algo em torno de 200", "pagar 200 reais",
    // "200 reais", "200 por mês/semana"
    const matchValor = m.match(
      /(?:posso|consigo|quero|dá\s*(?:pra|para)|da\s*(?:pra|para)|cabe|tenho|or[cç]amento\s*(?:[eé]|de)|pagar|parcelas?\s*(?:de|até|ate))\s*(?:até|ate|de)?\s*(\d+(?:[.,]\d{1,2})?)/,
    );
    if (matchValor) {
      return parseFloat(matchValor[1].replace(",", "."));
    }

    // Padrão: "algo em torno de 200", "por volta de 200", "cerca de 200"
    const matchAproximado = m.match(
      /(?:(?:algo\s*)?(?:em\s*torno|por\s*volta|perto|cerca)\s*de)\s*(\d+(?:[.,]\d{1,2})?)/,
    );
    if (matchAproximado) {
      return parseFloat(matchAproximado[1].replace(",", "."));
    }

    // Padrão: "200 reais", "200 por mês/semana/dia/quinzena"
    const matchReais = m.match(
      /(\d+(?:[.,]\d{1,2})?)\s*(?:reais|por\s*(?:m[eê]s|semana|dia|quinzena))/,
    );
    if (matchReais) {
      return parseFloat(matchReais[1].replace(",", "."));
    }

    return null;
  }

  /**
   * Formata ofertas para texto de contexto do LLM
   */
  private formatarOfertasTexto(ofertas: OfertaCalculada[]): string {
    return ofertas
      .map((o) => {
        const detalheParcelas = o.datas_parcelas
          .map(
            (data: string, i: number) =>
              `  Parcela ${i + 1}: ${data} - R$ ${o.valor_parcela}`,
          )
          .join("\n");
        return `- ${o.parcelas}x de R$ ${o.valor_parcela} (Total: R$ ${o.total_com_taxas}, 1º pagamento: ${o.data_primeiro_pagamento}, Último: ${o.vencimento_final})\n${detalheParcelas}`;
      })
      .join("\n");
  }

  /**
   * Encontra a melhor oferta que cabe no orçamento do cliente
   * Retorna a oferta com menor quantidade de parcelas cujo valor <= valor informado
   */
  private encontrarMelhorOferta(
    ofertas: OfertaCalculada[],
    valor: number,
  ): { oferta: OfertaCalculada; cabeNoOrcamento: boolean } {
    const ofertasDentro = ofertas
      .filter((o) => parseFloat(o.valor_parcela) <= valor)
      .sort((a, b) => a.parcelas - b.parcelas);

    if (ofertasDentro.length > 0) {
      return { oferta: ofertasDentro[0], cabeNoOrcamento: true };
    }

    // Nenhuma cabe: pegar a de menor valor de parcela
    const menorParcela = ofertas.reduce((menor, atual) =>
      parseFloat(atual.valor_parcela) < parseFloat(menor.valor_parcela)
        ? atual
        : menor,
    );
    return { oferta: menorParcela, cabeNoOrcamento: false };
  }

  /**
   * Processa valor de parcela informado pelo usuário:
   * 1. Tenta encontrar oferta mensal cacheada que caiba
   * 2. Se não couber, tenta oferta semanal cacheada
   * 3. Se ainda não couber, sugere adiar entrada
   */
  private async processarValorParcela(valor: number): Promise<void> {
    if (!this.credorSelecionado) {
      throw new Error("Nenhum credor selecionado");
    }

    // 1. Tentar encontrar oferta MENSAL que caiba no orçamento (usar cache mensal)
    if (this.ofertasMensais.length > 0) {
      const resultadoMensal = this.encontrarMelhorOferta(this.ofertasMensais, valor);

      if (resultadoMensal.cabeNoOrcamento) {
        const { oferta } = resultadoMensal;
        // Atualizar para mensal
        this.parametrosOferta = { plano: 10, periodicidade: 30, diasentrada: 0 };
        this.ofertasAPI = this.ofertasAPIMensais;
        this.ofertas = this.ofertasMensais;

        const textoOfertas = this.formatarOfertasTexto(this.ofertasMensais);
        this.historico.push({
          role: "system",
          content: `O cliente informou que pode pagar aproximadamente R$ ${valor.toFixed(2)} por parcela. O sistema encontrou a melhor oferta MENSAL que cabe nesse orçamento:\n\n` +
            `MELHOR OFERTA: ${oferta.parcelas}x de R$ ${oferta.valor_parcela} (Total: R$ ${oferta.total_com_taxas}, 1º pagamento: ${oferta.data_primeiro_pagamento}, Último: ${oferta.vencimento_final})\n\n` +
            `Apresente essa oferta com entusiasmo, destacando que cabe no orçamento do cliente.\n\nTodas as ofertas mensais disponíveis:\n${textoOfertas}`,
        });
        return;
      }
    }

    // 2. Tentar encontrar oferta SEMANAL que caiba no orçamento (já cacheada)
    if (this.ofertasSemanais.length > 0) {
      const resultadoSemanal = this.encontrarMelhorOferta(this.ofertasSemanais, valor);

      if (resultadoSemanal.cabeNoOrcamento) {
        const { oferta } = resultadoSemanal;
        // Atualizar para semanal
        this.parametrosOferta = { plano: 10, periodicidade: 7, diasentrada: 0 };
        this.ofertasAPI = this.ofertasAPISemanais;
        this.ofertas = this.ofertasSemanais;

        const textoOfertasSemanais = this.formatarOfertasTexto(this.ofertasSemanais);

        this.historico.push({
          role: "system",
          content: `O cliente informou que pode pagar aproximadamente R$ ${valor.toFixed(2)} por parcela. O sistema verificou automaticamente as ofertas mensais e semanais. Nenhuma parcela MENSAL cabe no orçamento, mas encontrou uma oferta SEMANAL que cabe perfeitamente:\n\n` +
            `MELHOR OFERTA SEMANAL: ${oferta.parcelas}x de R$ ${oferta.valor_parcela} semanais (Total: R$ ${oferta.total_com_taxas}, 1º pagamento: ${oferta.data_primeiro_pagamento}, Último: ${oferta.vencimento_final})\n\n` +
            `IMPORTANTE: Apresente essa oferta semanal diretamente com entusiasmo. NÃO pergunte se o cliente quer trocar para semanal — já apresente como a melhor opção encontrada para o orçamento dele. Explique que o valor fica mais acessível com parcelas semanais.\n\nTodas as ofertas semanais disponíveis:\n${textoOfertasSemanais}`,
        });
        return;
      }
    }

    // 3. Nenhuma oferta cacheada cabe — sugerir adiar entrada
    const menorMensal = this.ofertasMensais.length > 0
      ? this.encontrarMelhorOferta(this.ofertasMensais, Infinity).oferta
      : null;
    const menorSemanal = this.ofertasSemanais.length > 0
      ? this.encontrarMelhorOferta(this.ofertasSemanais, Infinity).oferta
      : null;

    // Determinar a menor parcela entre mensal e semanal para referência
    let menorParcelaInfo = "";
    if (menorSemanal) {
      menorParcelaInfo = `A menor parcela semanal disponível é R$ ${menorSemanal.valor_parcela} (${menorSemanal.parcelas}x).`;
    }
    if (menorMensal) {
      menorParcelaInfo += ` A menor parcela mensal disponível é R$ ${menorMensal.valor_parcela} (${menorMensal.parcelas}x).`;
    }

    this.historico.push({
      role: "system",
      content: `O cliente informou que pode pagar aproximadamente R$ ${valor.toFixed(2)} por parcela, mas nenhuma oferta mensal ou semanal disponível cabe nesse orçamento. ${menorParcelaInfo}\n\n` +
        `Informe com cuidado que o valor informado está abaixo das parcelas disponíveis. ` +
        `Sugira ao cliente que talvez consiga condições melhores adiando a data da primeira parcela (entrada), o que pode reduzir os valores. ` +
        `Pergunte se ele gostaria de adiar o início do pagamento para buscar condições mais acessíveis.`,
    });
  }

  /**
   * Processa mudança de condições, usando cache quando possível
   * - Mudança apenas de periodicidade (mensal ↔ semanal) com diasentrada=0: usa cache
   * - Mudança de diasentrada ou plano: nova busca à API
   */
  private async processarMudancaCondicoes(
    mudancas: Partial<ParametrosOferta>,
  ): Promise<void> {
    if (!this.credorSelecionado) {
      throw new Error("Nenhum credor selecionado");
    }

    // Determinar se precisa buscar na API ou se pode usar cache
    const mudouDiasEntrada = mudancas.diasentrada !== undefined && mudancas.diasentrada !== this.parametrosOferta.diasentrada;
    const mudouPlano = mudancas.plano !== undefined && mudancas.plano !== this.parametrosOferta.plano;
    const mudouPeriodicidade = mudancas.periodicidade !== undefined && mudancas.periodicidade !== this.parametrosOferta.periodicidade;

    // Atualizar parâmetros com as mudanças
    if (mudancas.plano !== undefined)
      this.parametrosOferta.plano = mudancas.plano;
    if (mudancas.periodicidade !== undefined)
      this.parametrosOferta.periodicidade = mudancas.periodicidade;
    if (mudancas.diasentrada !== undefined)
      this.parametrosOferta.diasentrada = mudancas.diasentrada;

    // Se mudou apenas periodicidade (sem mudar diasentrada/plano), tentar usar cache
    const podUsarCache = mudouPeriodicidade && !mudouDiasEntrada && !mudouPlano && this.parametrosOferta.diasentrada === 0;

    if (podUsarCache) {
      if (this.parametrosOferta.periodicidade === 7 && this.ofertasAPISemanais.length > 0) {
        // Usar ofertas semanais cacheadas
        this.ofertasAPI = this.ofertasAPISemanais;
        this.ofertas = this.ofertasSemanais;
        console.log(`[DEBUG] Usando ofertas semanais do cache`);
      } else if (this.parametrosOferta.periodicidade === 30 && this.ofertasAPIMensais.length > 0) {
        // Usar ofertas mensais cacheadas
        this.ofertasAPI = this.ofertasAPIMensais;
        this.ofertas = this.ofertasMensais;
        console.log(`[DEBUG] Usando ofertas mensais do cache`);
      }
    }

    // Se não pôde usar cache, buscar na API
    const precisaBuscarAPI = !podUsarCache ||
      (this.parametrosOferta.periodicidade !== 7 && this.parametrosOferta.periodicidade !== 30) ||
      (this.parametrosOferta.periodicidade === 7 && this.ofertasAPISemanais.length === 0) ||
      (this.parametrosOferta.periodicidade === 30 && this.ofertasAPIMensais.length === 0);

    if (precisaBuscarAPI) {
      console.log(
        `[DEBUG] Re-buscando ofertas com novos params:`,
        this.parametrosOferta,
      );

      this.ofertasAPI = await buscarOfertasCredor(
        this.credorSelecionado.iddevedor,
        this.parametrosOferta.plano,
        this.parametrosOferta.periodicidade,
        this.parametrosOferta.diasentrada,
      );

      if (this.ofertasAPI.length === 0) {
        // Se não achou na periodicidade solicitada mas tem semanais cacheadas, sugerir
        if (this.parametrosOferta.periodicidade !== 7 && this.ofertasSemanais.length > 0) {
          const textoOfertasSemanais = this.formatarOfertasTexto(this.ofertasSemanais);
          this.historico.push({
            role: "system",
            content: `Não foram encontradas ofertas para a periodicidade solicitada (${this.mapearPeriodicidadeNome(this.parametrosOferta.periodicidade)}). ` +
              `Porém, existem ofertas no plano SEMANAL disponíveis:\n${textoOfertasSemanais}\n\n` +
              `Informe ao cliente que não há ofertas nessa periodicidade, mas sugira as opções semanais como alternativa.`,
          });
          return;
        }
        this.historico.push({
          role: "system",
          content:
            "O sistema não encontrou ofertas para as condições solicitadas. Informe ao cliente que não há ofertas disponíveis para essas condições e sugira outras opções.",
        });
        return;
      }

      // Remapear ofertas
      this.ofertas = this.mapearOfertasAPI(this.ofertasAPI);
    }

    if (this.ofertas.length === 0) {
      this.historico.push({
        role: "system",
        content:
          "O sistema não encontrou ofertas para as condições solicitadas. Informe ao cliente que não há ofertas disponíveis para essas condições e sugira outras opções.",
      });
      return;
    }

    // Injetar novas ofertas no contexto
    const periodicidadeNome = this.mapearPeriodicidadeNome(
      this.parametrosOferta.periodicidade,
    );
    const textoOfertas = this.formatarOfertasTexto(this.ofertas);

    // Verificar se o plano solicitado excede as ofertas disponíveis na periodicidade atual
    // Se sim, incluir ofertas semanais cacheadas como alternativa
    const planoSolicitado = this.parametrosOferta.plano;
    const maxParcelasAtuais = this.ofertas.length > 0
      ? Math.max(...this.ofertas.map(o => o.parcelas))
      : 0;
    const temAlternativaSemanal =
      this.parametrosOferta.periodicidade === 30 &&
      maxParcelasAtuais < planoSolicitado &&
      this.ofertasSemanais.length > 0;

    let mensagemSistema = `O cliente solicitou novas condições. O sistema recalculou as ofertas com: plano=${this.parametrosOferta.plano}, periodicidade=${periodicidadeNome}, dias de entrada=${this.parametrosOferta.diasentrada}.\n\nNovas ofertas ${periodicidadeNome}s disponíveis:\n${textoOfertas}`;

    if (temAlternativaSemanal) {
      const textoOfertasSemanais = this.formatarOfertasTexto(this.ofertasSemanais);
      const maxParcelasSemanais = Math.max(...this.ofertasSemanais.map(o => o.parcelas));
      mensagemSistema += `\n\nATENÇÃO: O cliente pediu ${planoSolicitado}x, mas no plano mensal o máximo disponível é ${maxParcelasAtuais}x. ` +
        `Porém, no plano SEMANAL existem opções de até ${maxParcelasSemanais}x com parcelas menores!\n\n` +
        `Ofertas SEMANAIS disponíveis:\n${textoOfertasSemanais}\n\n` +
        `Apresente as ofertas mensais disponíveis E sugira proativamente as ofertas semanais como alternativa para o cliente conseguir mais parcelas. ` +
        `Explique que no plano semanal ele pode parcelar em mais vezes com valores menores por parcela.`;
    } else {
      mensagemSistema += `\n\nApresente as novas ofertas de forma clara e acolhedora.`;
    }

    this.historico.push({
      role: "system",
      content: mensagemSistema,
    });
  }

  /**
   * Mapeia valor numérico de periodicidade para nome
   */
  private mapearPeriodicidadeNome(periodicidade: number): string {
    switch (periodicidade) {
      case 1:
        return "diário";
      case 7:
        return "semanal";
      case 15:
        return "quinzenal";
      case 30:
        return "mensal";
      default:
        return `${periodicidade} dias`;
    }
  }

  /**
   * Processa formalização do acordo
   */
  private async processarFormalizacao(plano: number): Promise<ResultadoChat> {
    if (!this.credorSelecionado) {
      throw new Error("Nenhum credor selecionado para formalizar");
    }

    const resultado = await formalizarAcordo({
      iddevedor: this.credorSelecionado.iddevedor,
      plano,
      periodicidade: this.parametrosOferta.periodicidade,
      diasentrada: this.parametrosOferta.diasentrada,
    });

    if (resultado.sucesso) {
      this.estado = "encerrado";

      // Extrair dados de pagamento do retorno da formalização
      const terceiraEtapa = (resultado.detalhes as Record<string, any>)
        ?.terceiraEtapaResponse;
      const urlBoleto = terceiraEtapa?.urlBoleto as string | undefined;
      const pixCopiaECola = terceiraEtapa?.pixCopiaECola as string | undefined;

      let conteudoPagamento = "O acordo foi formalizado com sucesso no sistema.";
      if (urlBoleto) {
        conteudoPagamento += `\nLink do boleto: ${urlBoleto}`;
      }
      if (pixCopiaECola) {
        conteudoPagamento += `\nPIX Copia e Cola: ${pixCopiaECola}`;
      }
      conteudoPagamento +=
        "\nInforme ao cliente que o acordo foi registrado com sucesso e apresente o link do boleto e o código PIX Copia e Cola para pagamento.";

      this.historico.push({
        role: "system",
        content: conteudoPagamento,
      });

      const respostaLLM = await this.chamarLLM();
      return {
        resposta: respostaLLM.resposta,
        status: "acordo_formalizado" as const,
        iddevedor: this.credorSelecionado.iddevedor,
        plano,
        periodicidade: this.parametrosOferta.periodicidade,
        diasentrada: this.parametrosOferta.diasentrada,
        urlBoleto,
        pixCopiaECola,
      };
    }

    // Erro na formalização
    this.historico.push({
      role: "system",
      content: `Houve um erro ao formalizar o acordo: ${resultado.mensagem}. Informe ao cliente que houve um problema técnico e peça para tentar novamente ou entrar em contato por outro canal.`,
    });

    const respostaLLM = await this.chamarLLM();
    return {
      resposta: respostaLLM.resposta,
      status: "erro_formalizacao" as const,
      iddevedor: this.credorSelecionado.iddevedor,
      plano,
      periodicidade: this.parametrosOferta.periodicidade,
      diasentrada: this.parametrosOferta.diasentrada,
    };
  }

  /**
   * Envia mensagem para a IA e retorna resposta
   */
  public async enviarMensagem(msg: string): Promise<ResultadoChat> {
    // Primeira mensagem: registrar saudação no histórico e conversar naturalmente
    if (!this.apresentacaoEnviada && this.estado === "apresentacao") {
      const saudacao = "Olá! Eu sou a LucIA, assistente virtual da Cobrance. Estou à disposição para te ajudar no que precisar. Como posso te auxiliar hoje?";
      this.historico.push({ role: "assistant", content: saudacao });
      this.apresentacaoEnviada = true;
      this.estado = "conversando";
      return await this.processarConversa(msg);
    }

    // Estado: conversando — conversa natural, guia para documento quando apropriado
    if (this.estado === "conversando") {
      return await this.processarConversa(msg);
    }

    // Estado: aguardando_documento
    if (this.estado === "aguardando_documento") {
      return await this.processarDocumento(msg);
    }

    // Estado: selecionando_credor
    if (this.estado === "selecionando_credor") {
      return await this.processarSelecaoCredor(msg);
    }

    // Estado: encerrado (acordo formalizado) — permanece disponível para dúvidas
    if (this.estado === "encerrado") {
      this.historico.push({ role: "user", content: msg });
      this.historico.push({
        role: "system",
        content: "O acordo já foi formalizado com sucesso. O cliente está fazendo uma pergunta adicional. Responda de forma acolhedora e útil. Se ele quiser negociar outra pendência, oriente a limpar a sessão para iniciar um novo atendimento.",
      });
      return await this.chamarLLM();
    }

    // Estado: negociando (fluxo principal)

    // Adiciona mensagem do usuário ao histórico
    this.historico.push({
      role: "user",
      content: msg,
    });

    // 1. Detectar consulta de dívidas
    if (this.detectarIntentoDividas(msg)) {
      return await this.processarConsultaDividas();
    }

    // 2. Detectar valor de parcela (ex: "posso pagar 200 reais")
    //    Só processa se NÃO houver mudança de condições na mesma mensagem
    const mudancasCondicoes = this.detectarMudancaCondicoes(msg);
    const valorParcela = this.detectarValorParcela(msg);

    if (valorParcela !== null && !mudancasCondicoes) {
      await this.processarValorParcela(valorParcela);
    }

    // 3. Detectar mudança de condições (plano, periodicidade, dias entrada)
    if (mudancasCondicoes) {
      await this.processarMudancaCondicoes(mudancasCondicoes);
    }

    // 3. Chamar LLM
    const resultado = await this.chamarLLM();

    // 4. Detectar aceite -> formalizar automaticamente
    const m = msg.toLowerCase();
    if (
      m.includes("aceito") ||
      m.includes("fechado") ||
      m.includes("pode ser") ||
      resultado.resposta.toLowerCase().includes("formalizando")
    ) {
      const planoDetectado = this.detectarPlanoAceito();
      if (planoDetectado !== undefined) {
        return await this.processarFormalizacao(planoDetectado);
      }
    }

    return resultado;
  }
}
