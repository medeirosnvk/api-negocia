/**
 * Testes para CalculadoraAcordo usando Jest
 */

import { beforeEach, describe, it, expect } from "@jest/globals";
import { CalculadoraAcordo } from "../core/CalculadoraAcordo";
import { ConfiguracaoAcordo } from "../types";

describe("CalculadoraAcordo", () => {
  let calc: CalculadoraAcordo;

  const configExemplo: ConfiguracaoAcordo = {
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

  beforeEach(() => {
    calc = new CalculadoraAcordo(configExemplo);
  });

  describe("Data de Entrada", () => {
    it("deve retornar uma data de entrada válida", () => {
      const dataEntrada = calc.getDataEntrada();
      expect(dataEntrada).toBeDefined();
      expect(typeof dataEntrada).toBe("string");
      expect(dataEntrada).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
    });
  });

  describe("Data Máxima de Entrada", () => {
    it("deve retornar a data máxima de entrada configurada", () => {
      const dataMax = calc.getDataEntradaMaxima();
      expect(dataMax).toBeDefined();
      expect(typeof dataMax).toBe("string");
      expect(dataMax).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
    });
  });

  describe("Ofertas Mensais", () => {
    it("deve gerar ofertas mensais", () => {
      const ofertasMensais = calc.gerarOfertas("mensal");
      expect(Array.isArray(ofertasMensais)).toBe(true);
      expect(ofertasMensais.length).toBeGreaterThan(0);
    });

    it("deve ter as propriedades corretas em cada oferta mensal", () => {
      const ofertasMensais = calc.gerarOfertas("mensal");
      const primeiraOferta = ofertasMensais[0];

      expect(primeiraOferta).toHaveProperty("parcelas");
      expect(primeiraOferta).toHaveProperty("valor_parcela");
      expect(primeiraOferta).toHaveProperty("vencimento_final");
      expect(primeiraOferta).toHaveProperty("total_com_taxas");

      expect(typeof primeiraOferta.parcelas).toBe("number");
      expect(typeof primeiraOferta.valor_parcela).toBe("string");
      expect(typeof primeiraOferta.vencimento_final).toBe("string");
      expect(typeof primeiraOferta.total_com_taxas).toBe("string");
    });
  });

  describe("Ofertas Semanais", () => {
    it("deve gerar ofertas semanais", () => {
      const ofertasSemanais = calc.gerarOfertas("semanal");
      expect(Array.isArray(ofertasSemanais)).toBe(true);
      expect(ofertasSemanais.length).toBeGreaterThan(0);
    });

    it("deve ter as propriedades corretas em cada oferta semanal", () => {
      const ofertasSemanais = calc.gerarOfertas("semanal");
      const primeiraOferta = ofertasSemanais[0];

      expect(primeiraOferta).toHaveProperty("parcelas");
      expect(typeof primeiraOferta.parcelas).toBe("number");
      expect(typeof primeiraOferta.valor_parcela).toBe("string");
    });
  });

  describe("Ofertas Quinzenais", () => {
    it("deve gerar ofertas quinzenais", () => {
      const ofertasQuinzenais = calc.gerarOfertas("quinzenal");
      expect(Array.isArray(ofertasQuinzenais)).toBe(true);
      expect(ofertasQuinzenais.length).toBeGreaterThan(0);
    });

    it("deve ter as propriedades corretas em cada oferta quinzenal", () => {
      const ofertasQuinzenais = calc.gerarOfertas("quinzenal");
      const primeiraOferta = ofertasQuinzenais[0];

      expect(primeiraOferta).toHaveProperty("parcelas");
      expect(typeof primeiraOferta.parcelas).toBe("number");
      expect(typeof primeiraOferta.valor_parcela).toBe("string");
    });
  });

  describe("Ofertas Diárias", () => {
    it("deve gerar ofertas diárias", () => {
      const ofertasDiarias = calc.gerarOfertas("diario");
      expect(Array.isArray(ofertasDiarias)).toBe(true);
      expect(ofertasDiarias.length).toBeGreaterThan(0);
    });

    it("deve ter as propriedades corretas em cada oferta diária", () => {
      const ofertasDiarias = calc.gerarOfertas("diario");
      const primeiraOferta = ofertasDiarias[0];

      expect(primeiraOferta).toHaveProperty("parcelas");
      expect(typeof primeiraOferta.parcelas).toBe("number");
      expect(typeof primeiraOferta.valor_parcela).toBe("string");
    });
  });

  describe("Ofertas com Data Negociada", () => {
    it("deve gerar ofertas com data de entrada negociada", () => {
      const ofertasNegociadas = calc.gerarOfertas("mensal", "2026-02-10");
      expect(Array.isArray(ofertasNegociadas)).toBe(true);
      expect(ofertasNegociadas.length).toBeGreaterThan(0);
    });

    it("deve ter as propriedades corretas com data negociada", () => {
      const ofertasNegociadas = calc.gerarOfertas("mensal", "2026-02-10");
      const primeiraOferta = ofertasNegociadas[0];

      expect(primeiraOferta).toHaveProperty("parcelas");
      expect(typeof primeiraOferta.parcelas).toBe("number");
      expect(typeof primeiraOferta.valor_parcela).toBe("string");
      expect(typeof primeiraOferta.vencimento_final).toBe("string");
    });
  });

  describe("Tipos de Dados", () => {
    it("deve retornar tipos corretos para ofertas mensais", () => {
      const ofertasMensais = calc.gerarOfertas("mensal");
      const primeiraOferta = ofertasMensais[0];

      expect(typeof primeiraOferta.parcelas).toBe("number");
      expect(typeof primeiraOferta.valor_parcela).toBe("string");
      expect(typeof primeiraOferta.vencimento_final).toBe("string");
      expect(typeof primeiraOferta.total_com_taxas).toBe("string");
    });
  });
});
