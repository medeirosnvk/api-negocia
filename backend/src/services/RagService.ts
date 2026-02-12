import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import fs from "fs/promises";
import path from "path";

interface ChunkEmbedding {
  texto: string;
  embedding: number[];
  arquivo: string;
}

/**
 * Serviço RAG (Retrieval-Augmented Generation) com LangChain Gemini embeddings
 * e vector store in-memory com cosine similarity.
 */
export class RagService {
  private chunks: ChunkEmbedding[] = [];
  private embeddings: GoogleGenerativeAIEmbeddings;
  private inicializado = false;

  constructor(apiKey: string, _cacheArquivo?: string) {
    this.embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey,
      modelName: "text-embedding-004",
    });
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

    const textos: { texto: string; arquivo: string }[] = [];

    for (const arquivo of arquivos) {
      const conteudo = await fs.readFile(arquivo, "utf-8");
      const nome = path.basename(arquivo);

      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1600,
        chunkOverlap: 200,
      });

      const segmentos = await splitter.splitText(conteudo);
      for (const seg of segmentos) {
        textos.push({ texto: seg, arquivo: nome });
      }
    }

    console.log(`[RAG] Gerando embeddings para ${textos.length} chunks...`);
    const vetores = await this.embeddings.embedDocuments(
      textos.map((t) => t.texto),
    );

    for (let i = 0; i < textos.length; i++) {
      this.chunks.push({
        texto: textos[i].texto,
        embedding: vetores[i],
        arquivo: textos[i].arquivo,
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

    const embeddingConsulta = await this.embeddings.embedQuery(consulta);

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
}
