import {
  Divida,
  Parametros,
  ConfiguracaoAcordo,
  OfertaCalculada,
} from "../types/index.js";

/**
 * Calcula projeções de dívidas, ofertas de parcelamento e datas de vencimento
 */
export class CalculadoraAcordo {
  private dados: ConfiguracaoAcordo;
  private hoje: Date;

  constructor(config: ConfiguracaoAcordo) {
    this.dados = config;
    this.hoje = new Date();
  }

  /**
   * Calcula o valor atualizado de uma dívida projetada para uma data futura
   */
  private calcularProjecao(dataProjecao: Date): number {
    const parametros = this.dados.parametros[0];
    let totalAtualizado = 0;

    for (const divida of this.dados.dividas) {
      const vencimento = new Date(divida.vencimento);

      // 1. Dias em atraso até a data de projeção
      const diasAtraso = this.calcularDiasAtraso(vencimento, dataProjecao);

      // 2. Juros (3% ao mês / 30 = 0.1% ao dia)
      const taxaDiaria = parametros.juros / 30 / 100;
      const valorJuros = divida.valor * taxaDiaria * diasAtraso;

      // 3. Multa (2% fixo sobre o valor original)
      const valorMulta = divida.valor * (parametros.multa / 100);

      // 4. Honorários (10% sobre Valor + Juros + Multa)
      const baseHonorarios = divida.valor + valorJuros + valorMulta;
      const valorHonorarios = baseHonorarios * (parametros.honorarios / 100);

      totalAtualizado += baseHonorarios + valorHonorarios;
    }

    return Math.round(totalAtualizado * 100) / 100;
  }

  /**
   * Calcula dias em atraso entre dois períodos
   */
  private calcularDiasAtraso(vencimento: Date, dataProjecao: Date): number {
    if (vencimento > dataProjecao) return 0;
    const diffMs = dataProjecao.getTime() - vencimento.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }

  /**
   * Gera ofertas de parcelamento baseado em cadência
   */
  public gerarOfertas(
    cadencia: "mensal" | "diario" | "semanal" | "quinzenal" = "mensal",
    dataEntradaManual: string | null = null,
  ): OfertaCalculada[] {
    const ofertasCalculadas: Record<number, OfertaCalculada> = {};
    const parametros = this.dados.parametros[0];
    const tarifaBoleto = this.dados.ofertas[0].tarifa_boleto ?? 0;
    const maxParcelas = parametros.plano_maximo;
    const vencimentoMaximo = new Date(parametros.vencimento_maximo);

    // Data para opção À VISTA (sempre o mais cedo possível)
    const dataAVista = this.proximoDiaUtil(new Date());

    // Data para PARCELADAS
    let dataEntradaParcelado: Date;
    if (dataEntradaManual) {
      dataEntradaParcelado = new Date(dataEntradaManual);
    } else {
      const diasEntrada = parametros.dias_entrada ?? 0;
      dataEntradaParcelado = new Date();
      if (diasEntrada > 0) {
        dataEntradaParcelado.setDate(
          dataEntradaParcelado.getDate() + diasEntrada,
        );
      }
    }
    dataEntradaParcelado = this.proximoDiaUtil(dataEntradaParcelado);

    for (let i = 1; i <= maxParcelas; i++) {
      // Se for 1x, usa data à vista. Se > 1, usa data de entrada parcelada
      const dataBase =
        i === 1 ? new Date(dataAVista) : new Date(dataEntradaParcelado);
      const dataParcelaAtual = this.calcularDataParcela(
        dataBase,
        i - 1,
        cadencia,
      );

      if (dataParcelaAtual > vencimentoMaximo) break;

      const totalSemTaxa = this.calcularProjecao(dataParcelaAtual);
      const valorParcelaComTaxa =
        Math.round((totalSemTaxa / i + tarifaBoleto) * 100) / 100;

      // Gerar datas de cada parcela
      const datasParcelas: string[] = [];
      for (let j = 0; j < i; j++) {
        const dataBaseJ =
          i === 1 ? new Date(dataAVista) : new Date(dataEntradaParcelado);
        const dataParcJ = this.calcularDataParcela(dataBaseJ, j, cadencia);
        datasParcelas.push(this.formatarData(dataParcJ));
      }

      ofertasCalculadas[i] = {
        parcelas: i,
        data_primeiro_pagamento: datasParcelas[0],
        vencimento_final: this.formatarData(dataParcelaAtual),
        valor_parcela: valorParcelaComTaxa.toFixed(2),
        total_com_taxas: (valorParcelaComTaxa * i).toFixed(2),
        datas_parcelas: datasParcelas,
      };
    }

    return Object.values(ofertasCalculadas);
  }

  /**
   * Calcula a data de uma parcela específica
   */
  private calcularDataParcela(
    dataBase: Date,
    passos: number,
    cadencia: string,
  ): Date {
    const data = new Date(dataBase);

    if (passos === 0) return this.proximoDiaUtil(data);

    switch (cadencia) {
      case "diario":
        data.setDate(data.getDate() + passos);
        break;
      case "semanal":
        data.setDate(data.getDate() + passos * 7);
        break;
      case "quinzenal":
        data.setDate(data.getDate() + passos * 15);
        break;
      case "mensal":
      default:
        data.setMonth(data.getMonth() + passos);
        break;
    }

    return this.proximoDiaUtil(data);
  }

  /**
   * Ajusta data para próximo dia útil (sábado/domingo → segunda)
   */
  private proximoDiaUtil(d: Date): Date {
    const data = new Date(d);
    const dow = data.getDay(); // 0=dom, 1=seg, ..., 6=sab

    if (dow === 6) data.setDate(data.getDate() + 2); // sábado → segunda
    if (dow === 0) data.setDate(data.getDate() + 1); // domingo → segunda

    return data;
  }

  /**
   * Retorna a data sugerida para entrada (hoje útil)
   */
  public getDataEntrada(): string {
    const dataEntrada = this.proximoDiaUtil(new Date());
    return this.formatarData(dataEntrada);
  }

  /**
   * Retorna a data máxima permitida para entrada
   */
  public getDataEntradaMaxima(): string {
    const parametros = this.dados.parametros[0];
    let data = parametros.data_entrada_maxima;

    if (!data) {
      const dias = parametros.dias_entrada ?? 0;
      const dt = new Date();
      if (dias > 0) dt.setDate(dt.getDate() + dias);
      return this.formatarData(dt);
    }

    try {
      const dt = new Date(data);
      return this.formatarData(dt);
    } catch {
      return this.formatarData(new Date());
    }
  }

  /**
   * Formata data no padrão dd/mm/yyyy
   */
  private formatarData(data: Date): string {
    const dia = String(data.getDate()).padStart(2, "0");
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
  }
}
