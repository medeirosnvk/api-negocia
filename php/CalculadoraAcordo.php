<?php

class CalculadoraAcordo
{
    private $dados;
    private $hoje;

    public function __construct($jsonInput)
    {
        $this->dados = json_decode($jsonInput, true);
        $this->hoje = new DateTime(); // Data atual para cálculos
    }

    /**
     * Calcula o valor atualizado de uma dívida projetada para uma data futura
     */
    public function calcularProjecao(DateTime $dataProjecao)
    {
        $parametros = $this->dados['parametros'][0];
        $totalAtualizado = 0;

        foreach ($this->dados['dividas'] as $divida) {
            $vencimento = new DateTime($divida['vencimento']);

            // 1. Dias em atraso até a data de projeção
            $intervalo = $vencimento->diff($dataProjecao);
            $diasAtraso = $intervalo->invert ? 0 : $intervalo->days;

            // 2. Juros (3% mes / 30 = 0.1% dia)
            $taxaDiaria = $parametros['juros'] / 30 / 100;
            $valorJuros = $divida['valor'] * $taxaDiaria * $diasAtraso;

            // 3. Multa (2% fixo sobre o valor original)
            $valorMulta = $divida['valor'] * ($parametros['multa'] / 100);

            // 4. Honorários (10% sobre Valor + Juros + Multa)
            $baseHonorarios = $divida['valor'] + $valorJuros + $valorMulta;
            $valorHonorarios = $baseHonorarios * ($parametros['honorarios'] / 100);

            $totalAtualizado += ($baseHonorarios + $valorHonorarios);
        }

        return round($totalAtualizado, 2);
    }

    public function gerarOfertas($cadencia = 'mensal', $dataEntradaManual = null)
    {
        $ofertasCalculadas = [];
        $parametros = $this->dados['parametros'][0];
        $tarifaBoleto = $this->dados['ofertas'][0]['tarifa_boleto'] ?? 0;
        $maxParcelas = $parametros['plano_maximo'];
        $vencimentoMaximo = new DateTime($parametros['vencimento_maximo']);

        // Data para a opção À VISTA (sempre o mais cedo possível)
        $dataAVista = $this->proximoDiaUtil(new DateTime('today'));

        // Data para as PARCELADAS (respeita dias_entrada ou manual)
        if ($dataEntradaManual) {
            $dataEntradaParcelado = new DateTime($dataEntradaManual);
        } else {
            $diasEntrada = $parametros['dias_entrada'] ?? 0;
            $dataEntradaParcelado = new DateTime('today');
            if ($diasEntrada > 0) $dataEntradaParcelado->modify("+$diasEntrada days");
        }
        $dataEntradaParcelado = $this->proximoDiaUtil($dataEntradaParcelado);

        for ($i = 1; $i <= $maxParcelas; $i++) {
            // Se for 1x, usa a data à vista. Se for > 1, usa a data de entrada parcelada.
            $dataBase = ($i === 1) ? clone $dataAVista : clone $dataEntradaParcelado;

            $dataParcelaAtual = clone $dataBase;
            $passos = $i - 1;

            if ($i > 1) {
                if ($cadencia === 'diario') $dataParcelaAtual->modify("+$passos days");
                elseif ($cadencia === 'semanal') $dataParcelaAtual->modify("+" . ($passos * 7) . " days");
                elseif ($cadencia === 'quinzenal') $dataParcelaAtual->modify("+" . ($passos * 15) . " days");
                else $dataParcelaAtual->modify("+$passos months");
            }

            $dataParcelaAtual = $this->proximoDiaUtil($dataParcelaAtual);
            if ($dataParcelaAtual > $vencimentoMaximo) break;

            $totalSemTaxa = $this->calcularProjecao($dataParcelaAtual);
            $valorParcelaComTaxa = round($totalSemTaxa / $i, 2) + $tarifaBoleto;

            $ofertasCalculadas[$i] = [
                'parcelas' => $i,
                'vencimento_final' => $dataParcelaAtual->format('d/m/Y'),
                'valor_parcela' => number_format($valorParcelaComTaxa, 2, '.', ''),
                'total_com_taxas' => number_format($valorParcelaComTaxa * $i, 2, '.', '')
            ];
        }
        return $ofertasCalculadas;
    }
    
    private function proximoDiaUtil(DateTime $d): DateTime
    {
        // Ajuste simples: sábado/domingo -> próxima segunda
        $dow = (int)$d->format('N'); // 1=seg ... 6=sab 7=dom
        if ($dow === 6) $d->modify('+2 days');
        if ($dow === 7) $d->modify('+1 day');
        return $d;
    }

    private function dataBaseParcelas(): DateTime
    {
        // Se você tiver uma "data_entrada" no JSON, use aqui.
        // Por enquanto: hoje (e ajusta p/ dia útil).
        $d = new DateTime('today');
        return $this->proximoDiaUtil($d);
    }

    private function calcularDataUltimaParcela(DateTime $dataBase, int $parcelas, string $cadencia): DateTime
    {
        $ultima = clone $dataBase;
        $passos = max(0, $parcelas - 1);

        switch ($cadencia) {
            case 'diario':
                $ultima->modify('+' . (1 * $passos) . ' days');
                break;
            case 'semanal':
                $ultima->modify('+' . (7 * $passos) . ' days');
                break;
            case 'quinzenal':
                // Assumi 15 dias (quinzena). Se você preferir 14, troco.
                $ultima->modify('+' . (15 * $passos) . ' days');
                break;
            case 'mensal':
            default:
                $ultima->modify('+' . $passos . ' months');
                break;
        }

        // Importante: o "último vencimento" deve ser dia útil
        return $this->proximoDiaUtil($ultima);
    }

    public function getDataEntrada(): string
    {
        // A sugestão inicial deve ser sempre o "hoje" útil
        $dataEntrada = new DateTime('today');
        $dataEntrada = $this->proximoDiaUtil($dataEntrada);
        return $dataEntrada->format('d/m/Y');
    }

    public function getDataEntradaMaxima(): string
    {
        // 1. Tenta pegar do campo específico data_entrada_maxima
        $data = $this->dados['parametros'][0]['data_entrada_maxima'] ?? null;

        // 2. Se não existir, tenta calcular via dias_entrada
        if (!$data) {
            $dias = $this->dados['parametros'][0]['dias_entrada'] ?? 0;
            $dt = new DateTime('today');
            if ($dias > 0) $dt->modify("+$dias days");
            return $dt->format('d/m/Y');
        }

        // 3. Converte o formato Y-m-d para d/m/Y
        try {
            $dt = new DateTime($data);
            return $dt->format('d/m/Y');
        } catch (Exception $e) {
            return date('d/m/Y');
        }
    }
}
