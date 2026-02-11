export interface Mensagem {
  role: 'user' | 'assistant';
  text: string;
  ts: string;
}

export interface ChatResponse {
  resposta: string;
  status:
    | 'aguardando_documento'
    | 'selecionando_credor'
    | 'negociando'
    | 'encerrado'
    | 'acordo_fechado';
  iddevedor?: number;
  plano?: number;
  periodicidade?: number;
  diasentrada?: number;
}

export interface FormalizacaoResponse {
  sucesso: boolean;
  mensagem: string;
  detalhes?: Record<string, unknown>;
}
