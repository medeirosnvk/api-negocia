import axios from "axios";
import fs from "fs/promises";
import path from "path";

interface ChunkEmbedding {
  texto: string;
  embedding: number[];
  arquivo: string;
}

interface CacheEmbeddings {
  [chave: string]: number[];
}

/**
 * Serviço RAG (Retrieval-Augmented Generation) com embeddings Gemini
 * e vector store in-memory com cosine similarity.
 */
export class RagService {
  private chunks: ChunkEmbedding[] = [];
  private apiKey: string;
  private cacheArquivo: string;
  private inicializado = false;

  constructor(apiKey: string, cacheArquivo?: string) {
    this.apiKey = apiKey;
    this.cacheArquivo = cacheArquivo || path.resolve(".cache-embeddings.json");
  }

  /**
   * Inicializa o serviço: lê arquivos .md, segmenta em chunks e gera embeddings
   */
  async inicializar(diretorio: string): Promise<void> {
    if (this.inicializado) return;

    const arquivos = await this.listarArquivosMd(diretorio);
    if (arquivos.length === 0) {
      console.log("[RAG] Nenhum arquivo .md encontrado em", diretorio);
      this.inicializado = true;
      return;
    }

    // Carregar cache existente
    const cache = await this.carregarCache();

    const todosChunks: { texto: string; arquivo: string }[] = [];

    for (const arquivo of arquivos) {
      const conteudo = await fs.readFile(arquivo, "utf-8");
      const nome = path.basename(arquivo);
      const segmentos = this.segmentar(conteudo, 400);
      for (const seg of segmentos) {
        todosChunks.push({ texto: seg, arquivo: nome });
      }
    }

    // Separar chunks que já têm embedding cacheado dos que precisam gerar
    const precisaGerar: string[] = [];
    const indicesNovos: number[] = [];

    for (let i = 0; i < todosChunks.length; i++) {
      const chave = this.gerarChaveCache(todosChunks[i].texto);
      if (!cache[chave]) {
        precisaGerar.push(todosChunks[i].texto);
        indicesNovos.push(i);
      }
    }

    // Gerar embeddings em batch para os novos
    if (precisaGerar.length > 0) {
      console.log(
        `[RAG] Gerando embeddings para ${precisaGerar.length} chunks novos...`,
      );
      const novosEmbeddings = await this.gerarEmbeddingsBatch(precisaGerar);

      for (let i = 0; i < precisaGerar.length; i++) {
        const chave = this.gerarChaveCache(precisaGerar[i]);
        cache[chave] = novosEmbeddings[i];
      }

      // Salvar cache atualizado
      await this.salvarCache(cache);
    }

    // Montar chunks com embeddings
    for (const chunk of todosChunks) {
      const chave = this.gerarChaveCache(chunk.texto);
      this.chunks.push({
        texto: chunk.texto,
        embedding: cache[chave],
        arquivo: chunk.arquivo,
      });
    }

    this.inicializado = true;
    console.log(
      `[RAG] Inicializado com ${this.chunks.length} chunks de ${arquivos.length} arquivo(s)`,
    );
  }

  /**
   * Busca os top-K chunks mais relevantes para uma consulta
   */
  async buscar(consulta: string, topK = 3): Promise<ChunkEmbedding[]> {
    if (!this.inicializado || this.chunks.length === 0) return [];

    const embeddingConsulta = await this.gerarEmbedding(consulta);

    const scored = this.chunks.map((chunk) => ({
      chunk,
      score: this.cosineSimilarity(embeddingConsulta, chunk.embedding),
    }));

    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, topK).map((s) => s.chunk);
  }

  /**
   * Formata resultados da busca como texto para injetar no prompt
   */
  formatarContexto(resultados: ChunkEmbedding[]): string {
    if (resultados.length === 0) return "";

    const textos = resultados.map(
      (r, i) => `[${i + 1}] (${r.arquivo})\n${r.texto}`,
    );

    return `Informações relevantes da base de conhecimento:\n\n${textos.join("\n\n")}`;
  }

  /**
   * Indica se o serviço está pronto para uso
   */
  estaInicializado(): boolean {
    return this.inicializado;
  }

  // --- Métodos privados ---

  private async listarArquivosMd(diretorio: string): Promise<string[]> {
    try {
      const entradas = await fs.readdir(diretorio);
      return entradas
        .filter((e) => e.endsWith(".md"))
        .map((e) => path.join(diretorio, e));
    } catch {
      return [];
    }
  }

  /**
   * Segmenta texto em chunks de aproximadamente `maxTokens` tokens (~4 chars/token)
   */
  private segmentar(texto: string, maxTokens: number): string[] {
    const maxChars = maxTokens * 4;
    const paragrafos = texto.split(/\n\n+/);
    const chunks: string[] = [];
    let atual = "";

    for (const p of paragrafos) {
      const candidato = atual ? `${atual}\n\n${p}` : p;
      if (candidato.length > maxChars && atual) {
        chunks.push(atual.trim());
        atual = p;
      } else {
        atual = candidato;
      }
    }

    if (atual.trim()) {
      chunks.push(atual.trim());
    }

    return chunks.filter((c) => c.length > 20);
  }

  /**
   * Gera embedding para um único texto via Gemini
   */
  private async gerarEmbedding(texto: string): Promise<number[]> {
    const result = await this.gerarEmbeddingsBatch([texto]);
    return result[0];
  }

  /**
   * Gera embeddings em batch via Gemini text-embedding-004 (endpoint OpenAI-compatible)
   */
  private async gerarEmbeddingsBatch(textos: string[]): Promise<number[][]> {
    const batchSize = 100;
    const allEmbeddings: number[][] = [];

    for (let i = 0; i < textos.length; i += batchSize) {
      const batch = textos.slice(i, i + batchSize);

      const response = await axios.post(
        "https://generativelanguage.googleapis.com/v1beta/openai/embeddings",
        {
          model: "text-embedding-004",
          input: batch,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          timeout: 30000,
        },
      );

      const embeddings = response.data.data.map(
        (e: { embedding: number[] }) => e.embedding,
      );
      allEmbeddings.push(...embeddings);
    }

    return allEmbeddings;
  }

  /**
   * Calcula cosine similarity entre dois vetores
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator === 0 ? 0 : dotProduct / denominator;
  }

  private gerarChaveCache(texto: string): string {
    // Hash simples baseado no conteúdo
    let hash = 0;
    for (let i = 0; i < texto.length; i++) {
      const char = texto.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return `chunk_${hash}_${texto.length}`;
  }

  private async carregarCache(): Promise<CacheEmbeddings> {
    try {
      const conteudo = await fs.readFile(this.cacheArquivo, "utf-8");
      return JSON.parse(conteudo);
    } catch {
      return {};
    }
  }

  private async salvarCache(cache: CacheEmbeddings): Promise<void> {
    try {
      await fs.writeFile(this.cacheArquivo, JSON.stringify(cache), "utf-8");
      console.log("[RAG] Cache de embeddings salvo");
    } catch (err) {
      console.error("[RAG] Erro ao salvar cache:", err);
    }
  }
}
