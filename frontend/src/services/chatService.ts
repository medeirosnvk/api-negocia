import type { ChatResponse, FormalizacaoResponse } from "../types";

export async function enviarMensagemAPI(texto: string): Promise<ChatResponse> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mensagem: texto }),
  });

  // 429 (rate limit) e 503 (indisponibilidade temporária) vêm com um body
  // conversacional que deve ser mostrado ao usuário — não jogar erro.
  if (response.status === 429 || response.status === 503) {
    return response.json();
  }

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}

export async function limparSessaoAPI(): Promise<void> {
  await fetch("/api/limpar-sessao", { method: "POST" });
}

export async function formalizarAcordoAPI(
  iddevedor: number,
  plano: number,
  periodicidade: number,
  diasentrada: number,
): Promise<FormalizacaoResponse> {
  const response = await fetch("/api/formalizar-acordo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ iddevedor, plano, periodicidade, diasentrada }),
  });

  const data: FormalizacaoResponse = await response.json();

  if (!response.ok) {
    throw new Error(data.mensagem || `HTTP ${response.status}`);
  }

  return data;
}
