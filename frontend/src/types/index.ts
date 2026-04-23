export interface Mensagem {
  role: "user" | "assistant";
  text: string;
  ts: string;
}

export interface ChatResponse {
  resposta: string;
  status:
    | "aguardando_documento"
    | "selecionando_credor"
    | "negociando"
    | "encerrado"
    | "conversando"
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

export interface FormalizacaoResponse {
  sucesso: boolean;
  mensagem: string;
  detalhes?: Record<string, unknown>;
}
