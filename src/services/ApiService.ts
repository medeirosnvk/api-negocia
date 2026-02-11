import axios from "axios";
import https from "https";
import {
  CredorAPI,
  DadosFormalizacao,
  DividaDetalhe,
  OfertaAPI,
  ResultadoFormalizacao,
} from "../types/index.js";

const API_BASE_URL =
  process.env.API_CREDORES_URL || "https://api.cobrance.online:3030";

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

/**
 * Valida formato de documento (CPF ou CNPJ)
 */
export function validarDocumento(documento: string): {
  valido: boolean;
  tipo: "cpf" | "cnpj";
  numeros: string;
} {
  const numeros = documento.replace(/\D/g, "");

  if (numeros.length === 11) {
    return { valido: true, tipo: "cpf", numeros };
  }

  if (numeros.length === 14) {
    return { valido: true, tipo: "cnpj", numeros };
  }

  return { valido: false, tipo: "cpf", numeros };
}

/**
 * Busca credores/dívidas pelo documento do devedor
 */
export async function buscarCredores(documento: string): Promise<CredorAPI[]> {
  const numeros = documento.replace(/\D/g, "");

  try {
    const response = await axios.get<CredorAPI[]>(
      `${API_BASE_URL}/lista-credores-lucia`,
      {
        params: { documento: numeros },
        httpsAgent,
        timeout: 10000,
      },
    );

    return response.data || [];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        `Erro ao buscar credores: ${error.response?.status} - ${error.message}`,
      );
    }
    return [];
  }
}

/**
 * Busca dividas credor por devedor
 */
export async function buscarDividasCredor(
  iddevedor: number,
  database: string,
): Promise<DividaDetalhe[]> {
  try {
    const response = await axios.get<DividaDetalhe[]>(
      `${API_BASE_URL}/credores/dividas-lucia`,
      {
        params: { iddevedor, database },
        httpsAgent,
        timeout: 10000,
      },
    );

    return response.data || [];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        `Erro ao buscar dividas por credor: ${error.response?.status} - ${error.message}`,
      );
    }
    return [];
  }
}

/**
 * Busca ofertas de parcelamento para um devedor específico
 */
export async function buscarOfertasCredor(
  iddevedor: number,
  plano: number,
  periodicidade: number,
  diasentrada: number,
): Promise<OfertaAPI[]> {
  try {
    console.log(
      `[DEBUG] Buscar ofertas com parametros: plano=${plano}, periodicidade=${periodicidade}, diasentrada=${diasentrada}`,
    );

    const response = await axios.get<OfertaAPI[]>(
      `${API_BASE_URL}/credores/oferta-parcelas-lucia`,
      {
        params: { iddevedor, plano, periodicidade, diasentrada },
        httpsAgent,
        timeout: 10000,
      },
    );

    return response.data || [];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        `Erro ao buscar ofertas: ${error.response?.status} - ${error.message}`,
      );
    }
    return [];
  }
}

/**
 * Gera token de autenticação na API Cobrance
 */
async function gerarToken(): Promise<string> {
  const username = process.env.COBRANCE_USERNAME;
  const password = process.env.COBRANCE_PASSWORD;

  if (!username || !password) {
    throw new Error(
      "COBRANCE_USERNAME e COBRANCE_PASSWORD não configurados no .env",
    );
  }

  try {
    const response = await axios.post(
      `${API_BASE_URL}/gerar-token`,
      { username, password },
      { httpsAgent, timeout: 10000 },
    );

    const token = response.data?.accessToken;
    if (!token) {
      throw new Error("Token não retornado pela API /gerar-token");
    }

    return token;
  } catch (error) {
    throw error;
  }
}

/**
 * Formaliza um acordo enviando dados para a API cobrance.online
 */
export async function formalizarAcordo(
  dados: DadosFormalizacao,
): Promise<ResultadoFormalizacao> {
  try {
    const token = await gerarToken();

    const payload = {
      iddevedor: dados.iddevedor,
      plano: dados.plano,
      periodicidade: dados.periodicidade,
      diasentrada: dados.diasentrada,
    };

    const response = await axios.post(
      `${API_BASE_URL}/registro-master-acordo-v2`,
      payload,
      {
        httpsAgent,
        timeout: 30000,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        validateStatus: (status) => status >= 200 && status < 300,
      },
    );

    const temConteudo =
      response.data != null &&
      typeof response.data === "object" &&
      (response.data.primeiraEtapaResponse ||
        response.data.terceiraEtapaResponse);

    if (temConteudo) {
      return {
        sucesso: true,
        mensagem: "Acordo formalizado com sucesso",
        detalhes: response.data,
      };
    }

    return {
      sucesso: false,
      mensagem: "Acordo não formalizado: resposta sem os dados esperados",
      detalhes: response.data,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        sucesso: false,
        mensagem: `Erro ao formalizar acordo: ${error.response?.status || error.message}`,
        detalhes: error.response?.data,
      };
    }
    return {
      sucesso: false,
      mensagem: "Erro desconhecido ao formalizar acordo",
    };
  }
}

/**
 * Formata valor monetário para exibição
 */
export function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
