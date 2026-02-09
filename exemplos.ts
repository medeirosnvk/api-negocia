/**
 * Exemplos de uso da API LucIA
 * Execute: npx ts-node exemplos.ts
 */

import axios from "axios";

const API_BASE = "http://localhost:3000";

/**
 * Exemplo 1: Verificar saúde do servidor
 */
async function exemplo1_healthCheck() {
  console.log("\n🏥 Exemplo 1: Health Check\n");
  try {
    const response = await axios.get(`${API_BASE}/api/health`);
    console.log("✅ Servidor está online:");
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error(
      "❌ Erro:",
      error instanceof Error ? error.message : "Desconhecido",
    );
  }
}

/**
 * Exemplo 2: Primeira interação com LucIA
 */
async function exemplo2_iniciarConversa() {
  console.log("\n💬 Exemplo 2: Iniciar Conversa\n");
  try {
    const response = await axios.post(`${API_BASE}/api/chat`, {
      mensagem: "Olá, tudo bem?",
    });
    console.log("Resposta da LucIA:");
    console.log(response.data.resposta);
    console.log(`Status: ${response.data.status}`);
  } catch (error) {
    console.error(
      "❌ Erro:",
      error instanceof Error ? error.message : "Desconhecido",
    );
  }
}

/**
 * Exemplo 3: Pedir de forma parcelada
 */
async function exemplo3_pedirParcelado() {
  console.log("\n📅 Exemplo 3: Pedir Parcelamento\n");
  try {
    // Primeira mensagem
    let response = await axios.post(`${API_BASE}/api/chat`, {
      mensagem: "Qual é o valor à vista?",
    });
    console.log("LucIA:", response.data.resposta);

    // Segunda mensagem
    response = await axios.post(`${API_BASE}/api/chat`, {
      mensagem: "Não consigo pagar à vista, preciso parcelar",
    });
    console.log("\nLucIA:", response.data.resposta);

    // Terceira mensagem
    response = await axios.post(`${API_BASE}/api/chat`, {
      mensagem: "Prefiro pagar semanalmente",
    });
    console.log("\nLucIA:", response.data.resposta);
    console.log(`Status: ${response.data.status}`);
  } catch (error) {
    console.error(
      "❌ Erro:",
      error instanceof Error ? error.message : "Desconhecido",
    );
  }
}

/**
 * Exemplo 4: Simular negociação completa
 */
async function exemplo4_negociacaoCompleta() {
  console.log("\n🤝 Exemplo 4: Negociação Completa\n");

  const mensagens = [
    "Oi, tenho uma dívida com vocês",
    "Como posso resolver?",
    "Dá pra pagar em quanto tempo?",
    "Prefiro pagar semanalmente então",
    "E se eu pagar R$ 150 por semana?",
    "Ok, eu aceito essas condições",
  ];

  try {
    for (const msg of mensagens) {
      console.log(`👤 Você: ${msg}\n`);

      const response = await axios.post(`${API_BASE}/api/chat`, {
        mensagem: msg,
      });

      console.log(`🤖 LucIA: ${response.data.resposta}\n`);

      if (response.data.status === "acordo_fechado") {
        console.log("✅ Acordo formalizado com sucesso!");
        break;
      }

      // Pequeno delay entre mensagens
      await new Promise((r) => setTimeout(r, 1000));
    }
  } catch (error) {
    console.error(
      "❌ Erro:",
      error instanceof Error ? error.message : "Desconhecido",
    );
  }
}

/**
 * Exemplo 5: Explorar diferentes periodicidades
 */
async function exemplo5_periodicidades() {
  console.log("\n⏰ Exemplo 5: Diferentes Periodicidades\n");

  const periodicidades = [
    { nome: "Mensal", msg: "Prefiro pagar mensalmente" },
    { nome: "Semanal", msg: "Muda pra semanal" },
    { nome: "Quinzenal", msg: "Melhor quinzenal" },
    { nome: "Diário", msg: "Posso pagar diariamente" },
  ];

  try {
    for (const { nome, msg } of periodicidades) {
      console.log(`${nome}:`);
      const response = await axios.post(`${API_BASE}/api/chat`, {
        mensagem: msg,
      });
      console.log(`Oferta: ${response.data.resposta.split("\n")[0]}\n`);

      await new Promise((r) => setTimeout(r, 500));
    }
  } catch (error) {
    console.error(
      "❌ Erro:",
      error instanceof Error ? error.message : "Desconhecido",
    );
  }
}

/**
 * Exemplo 6: Limpar e reiniciar conversa
 */
async function exemplo6_limparSessao() {
  console.log("\n🗑️ Exemplo 6: Limpar Sessão\n");
  try {
    const response = await axios.post(`${API_BASE}/api/limpar-sessao`);
    console.log("Sessão limpa:", response.data);
    console.log("✅ Novo diálogo pode começar");
  } catch (error) {
    console.error(
      "❌ Erro:",
      error instanceof Error ? error.message : "Desconhecido",
    );
  }
}

/**
 * Exemplo 7: Teste de robustez (múltiplas requisições)
 */
async function exemplo7_testeRobustez() {
  console.log("\n⚡ Exemplo 7: Teste de Robustez (10 requisições paralelas)\n");
  try {
    const promises = [];
    for (let i = 1; i <= 10; i++) {
      promises.push(
        axios.post(`${API_BASE}/api/chat`, {
          mensagem: `Requisição ${i}`,
        }),
      );
    }

    const resultados = await Promise.all(promises);
    console.log(
      `✅ Todas as ${resultados.length} requisições foram bem-sucedidas`,
    );

    resultados.forEach((r, i) => {
      console.log(`Requisição ${i + 1}: Status ${r.status}`);
    });
  } catch (error) {
    console.error(
      "❌ Erro:",
      error instanceof Error ? error.message : "Desconhecido",
    );
  }
}

/**
 * Menu principal
 */
async function main() {
  console.log("🎬 Exemplos de API LucIA\n");
  console.log('Certificar que "npm run dev" está rodando antes de executar\n');

  const exemplos = [
    { nome: "1 - Health Check", fn: exemplo1_healthCheck },
    { nome: "2 - Iniciar Conversa", fn: exemplo2_iniciarConversa },
    { nome: "3 - Pedir Parcelado", fn: exemplo3_pedirParcelado },
    { nome: "4 - Negociação Completa", fn: exemplo4_negociacaoCompleta },
    { nome: "5 - Diferentes Periodicidades", fn: exemplo5_periodicidades },
    { nome: "6 - Limpar Sessão", fn: exemplo6_limparSessao },
    { nome: "7 - Teste de Robustez", fn: exemplo7_testeRobustez },
  ];

  // Executar todos os exemplos
  console.log("Executando todos os exemplos...\n");
  for (const exemplo of exemplos) {
    try {
      await exemplo.fn();
    } catch (error) {
      console.error(`Erro no ${exemplo.nome}:`, error);
    }
    await new Promise((r) => setTimeout(r, 1000));
  }

  console.log("\n✨ Exemplos completados!");
}

// Executar se for o arquivo principal
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export {
  exemplo1_healthCheck,
  exemplo2_iniciarConversa,
  exemplo3_pedirParcelado,
  exemplo4_negociacaoCompleta,
  exemplo5_periodicidades,
  exemplo6_limparSessao,
  exemplo7_testeRobustez,
};
