/**
 * Tipos e interfaces compartilhadas do projeto
 */

// Estado da conversa
export type EstadoConversa =
  | "apresentacao"
  | "conversando"
  | "aguardando_documento"
  | "selecionando_credor"
  | "negociando"
  | "encerrado";

// Resposta da API lista-credores
export interface CredorAPI {
  iddevedor: number;
  cpfcnpj: number;
  nome_credor: string;
  nome_empresa_devida: string;
  valor_total_original: number;
}

// Resposta da API oferta-parcelas
export interface OfertaAPI {
  plano_parcela: number;
  periodicidade: string;
  total_geral_com_juros: number;
  valor_parcela: string;
  data_pagamento_parcela: string;
}

// Retorno de buscarDividasCredor (detalhes das dívidas do credor)
export interface DividaDetalhe {
  iddevedor: number;
  idvalor: number;
  numero_contrato: string;
  dias_em_atraso: number;
  data_vencimento_original: string;
  valor_original: number;
  valor_total_com_juros: number;
  parcela_atrasada: string;
}

// Parâmetros para buscarOfertasCredor
export interface ParametrosOferta {
  plano: number;
  periodicidade: number;
  diasentrada: number;
}

export interface Divida {
  vencimento: string;
  valor: number;
}

export interface Parametros {
  juros: number;
  multa: number;
  honorarios: number;
  plano_maximo: number;
  vencimento_maximo: string;
  dias_entrada: number;
  data_entrada_maxima: string;
}

export interface Oferta {
  tarifa_boleto: number;
}

export interface ConfiguracaoAcordo {
  dividas: Divida[];
  parametros: Parametros[];
  ofertas: Oferta[];
}

export interface OfertaCalculada {
  parcelas: number;
  data_primeiro_pagamento: string;
  vencimento_final: string;
  valor_parcela: string;
  total_com_taxas: string;
  datas_parcelas: string[];
}

export interface MensagemChat {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ResultadoChat {
  resposta: string;
  status:
    | EstadoConversa
    | "acordo_fechado"
    | "acordo_formalizado"
    | "erro_formalizacao";
  iddevedor?: number;
  plano?: number;
  periodicidade?: number;
  diasentrada?: number;
  urlBoleto?: string;
  pixCopiaECola?: string;
}

export interface RequisiçãoAPI {
  mensagem: string;
}

// Tipos para batching
export interface BatchResolverCallbacks {
  resolve: (value: BatchResult) => void;
  reject: (reason: Error) => void;
}

export interface SessionSnapshot {
  chat_history?: MensagemChat[];
  cadencia?: "mensal" | "diario" | "semanal" | "quinzenal";
  estado?: EstadoConversa;
  apresentacao_enviada?: boolean;
  credores?: CredorAPI[];
  credor_selecionado?: CredorAPI;
  ofertas_api?: OfertaAPI[];
  ofertas_api_mensais?: OfertaAPI[];
  ofertas_api_semanais?: OfertaAPI[];
  parametros_oferta?: ParametrosOferta;
}

export interface BatchResult {
  resultado: ResultadoChat;
  sessionAtualizada: SessionSnapshot;
}

export interface PendingBatch {
  messages: string[];
  callbacks: BatchResolverCallbacks[];
  timer: ReturnType<typeof setTimeout>;
  sessionSnapshot: SessionSnapshot;
}

// Tipos para formalização
export interface DadosFormalizacao {
  iddevedor: number;
  plano: number;
  periodicidade: number;
  diasentrada: number;
}

export interface ResultadoFormalizacao {
  sucesso: boolean;
  mensagem: string;
  detalhes?: Record<string, unknown>;
}
