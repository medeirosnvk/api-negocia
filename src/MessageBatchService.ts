import { ChatEngine } from "./ChatEngine.js";
import {
  BatchResolverCallbacks,
  BatchResult,
  ConfiguracaoAcordo,
  PendingBatch,
  SessionSnapshot,
} from "./types.js";

const BATCH_WINDOW_MS = 5_000; // 5 segundos de janela de batching
const MAX_BATCH_SIZE = 20; // Processar imediatamente se atingir esse limite

/**
 * Serviço de batching de mensagens por sessão.
 * Acumula mensagens em uma janela de 5s e processa todas de uma vez.
 */
export class MessageBatchService {
  private batches = new Map<string, PendingBatch>();
  private config: ConfiguracaoAcordo;
  private apiKey: string;

  constructor(config: ConfiguracaoAcordo, apiKey: string) {
    this.config = config;
    this.apiKey = apiKey;
  }

  /**
   * Enfileira uma mensagem para processamento em batch.
   * Retorna uma Promise que resolve quando o batch inteiro for processado.
   */
  enfileirarMensagem(
    sessionId: string,
    mensagem: string,
    sessionSnapshot: SessionSnapshot,
  ): Promise<BatchResult> {
    return new Promise<BatchResult>((resolve, reject) => {
      const callback: BatchResolverCallbacks = { resolve, reject };

      let batch = this.batches.get(sessionId);

      if (batch) {
        // Batch existente: adicionar mensagem e resetar timer
        batch.messages.push(mensagem);
        batch.callbacks.push(callback);
        // Atualizar snapshot para o mais recente
        batch.sessionSnapshot = sessionSnapshot;

        clearTimeout(batch.timer);
      } else {
        // Novo batch
        batch = {
          messages: [mensagem],
          callbacks: [callback],
          timer: null as unknown as ReturnType<typeof setTimeout>,
          sessionSnapshot,
        };
        this.batches.set(sessionId, batch);
      }

      // Processar imediatamente se atingir limite
      if (batch.messages.length >= MAX_BATCH_SIZE) {
        this.processarBatch(sessionId);
        return;
      }

      // Resetar timer de debounce
      batch.timer = setTimeout(() => {
        this.processarBatch(sessionId);
      }, BATCH_WINDOW_MS);
    });
  }

  /**
   * Processa todas as mensagens acumuladas de uma sessão.
   */
  private async processarBatch(sessionId: string): Promise<void> {
    const batch = this.batches.get(sessionId);
    if (!batch) return;

    // Remover batch do Map antes de processar
    this.batches.delete(sessionId);
    clearTimeout(batch.timer);

    const { messages, callbacks, sessionSnapshot } = batch;

    try {
      // Combinar todas as mensagens em uma só
      const mensagemCombinada = messages.join("\n");

      // Criar ChatEngine e restaurar estado da sessão
      const engine = new ChatEngine(this.config, this.apiKey);

      if (sessionSnapshot.chat_history) {
        engine.setHistorico(sessionSnapshot.chat_history);
      }
      if (sessionSnapshot.cadencia) {
        engine.setCadencia(sessionSnapshot.cadencia);
      }
      if (sessionSnapshot.estado) {
        engine.setEstado(sessionSnapshot.estado);
      }
      if (sessionSnapshot.credores) {
        engine.setCredores(sessionSnapshot.credores);
      }
      if (sessionSnapshot.credor_selecionado) {
        engine.setCredorSelecionado(sessionSnapshot.credor_selecionado);
      }
      if (sessionSnapshot.ofertas_api) {
        engine.setOfertasAPI(sessionSnapshot.ofertas_api);
      }

      // Processar mensagem combinada
      const resultado = await engine.enviarMensagem(mensagemCombinada);

      // Montar resultado com sessão atualizada
      const batchResult: BatchResult = {
        resultado,
        sessionAtualizada: {
          chat_history: engine.historico,
          cadencia: engine.getCadencia(),
          estado: engine.getEstado(),
          credores: engine.getCredores(),
          credor_selecionado:
            engine.getCredorSelecionado() || undefined,
          ofertas_api: engine.getOfertasAPI(),
        },
      };

      // Resolver todos os callbacks com o mesmo resultado
      for (const cb of callbacks) {
        cb.resolve(batchResult);
      }
    } catch (error) {
      const err =
        error instanceof Error
          ? error
          : new Error("Erro desconhecido ao processar batch");

      // Rejeitar todos os callbacks
      for (const cb of callbacks) {
        cb.reject(err);
      }
    }
  }

  /**
   * Cancela um batch pendente (usado ao limpar sessão).
   * Rejeita todas as promises pendentes.
   */
  cancelarBatch(sessionId: string): void {
    const batch = this.batches.get(sessionId);
    if (!batch) return;

    clearTimeout(batch.timer);
    this.batches.delete(sessionId);

    const err = new Error("Sessão encerrada durante processamento");
    for (const cb of batch.callbacks) {
      cb.reject(err);
    }
  }
}
