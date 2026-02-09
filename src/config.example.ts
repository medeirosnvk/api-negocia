/**
 * Exemplo de configurações para diferentes tipos de negociações
 * Copie a estrutura que desejar para usar com a CalculadoraAcordo
 */

import { ConfiguracaoAcordo } from "./types.js";

// ========================================
// EXEMPLO 1: Configuração padrão (do PHP)
// ========================================
export const configPadrao: ConfiguracaoAcordo = {
  dividas: [
    { vencimento: "2024-05-01", valor: 100 },
    { vencimento: "2024-06-01", valor: 100 },
    { vencimento: "2024-07-01", valor: 100 },
    { vencimento: "2024-08-01", valor: 100 },
    { vencimento: "2024-09-01", valor: 100 },
  ],
  parametros: [
    {
      juros: 3,
      multa: 2,
      honorarios: 10,
      plano_maximo: 10,
      vencimento_maximo: "2026-04-17",
      dias_entrada: 5,
      data_entrada_maxima: "2026-01-23",
    },
  ],
  ofertas: [{ tarifa_boleto: 11.9 }],
};

// ========================================
// EXEMPLO 2: Dívida maior com mais parcelas
// ========================================
export const configGrande: ConfiguracaoAcordo = {
  dividas: [
    { vencimento: "2023-01-15", valor: 1000 },
    { vencimento: "2023-02-15", valor: 1000 },
    { vencimento: "2023-03-15", valor: 1000 },
    { vencimento: "2023-04-15", valor: 500 },
  ],
  parametros: [
    {
      juros: 2,
      multa: 1.5,
      honorarios: 8,
      plano_maximo: 24,
      vencimento_maximo: "2026-12-31",
      dias_entrada: 10,
      data_entrada_maxima: "2026-02-15",
    },
  ],
  ofertas: [{ tarifa_boleto: 8.5 }],
};

// ========================================
// EXEMPLO 3: Dívida pequena com urgência
// ========================================
export const configUrgente: ConfiguracaoAcordo = {
  dividas: [{ vencimento: "2025-12-01", valor: 250 }],
  parametros: [
    {
      juros: 5,
      multa: 3,
      honorarios: 12,
      plano_maximo: 3,
      vencimento_maximo: "2026-02-28",
      dias_entrada: 0,
      data_entrada_maxima: "2026-01-31",
    },
  ],
  ofertas: [{ tarifa_boleto: 15 }],
};

// ========================================
// EXEMPLO 4: Dívida com prazos flexíveis
// ========================================
export const configFlexivel: ConfiguracaoAcordo = {
  dividas: [
    { vencimento: "2024-03-01", valor: 500 },
    { vencimento: "2024-04-01", valor: 500 },
  ],
  parametros: [
    {
      juros: 2.5,
      multa: 1,
      honorarios: 5,
      plano_maximo: 18,
      vencimento_maximo: "2027-06-30",
      dias_entrada: 15,
      data_entrada_maxima: "2026-06-30",
    },
  ],
  ofertas: [{ tarifa_boleto: 7.9 }],
};
