import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
import express, { Request, Response } from "express";
import session, { SessionOptions } from "express-session";
import { ChatEngine } from "./ChatEngine.js";
import { formalizarAcordo } from "./ApiService.js";
import {
  ConfiguracaoAcordo,
  CredorAPI,
  DadosFormalizacao,
  EstadoConversa,
  MensagemChat,
  OfertaAPI,
  ParametrosOferta,
  RequisiçãoAPI,
} from "./types.js";

// Declarar módulo para estender SessionData
declare module "express-session" {
  interface SessionData {
    chat_history?: MensagemChat[];
    cadencia?: "mensal" | "diario" | "semanal" | "quinzenal";
    estado?: EstadoConversa;
    credores?: CredorAPI[];
    credor_selecionado?: CredorAPI;
    ofertas_api?: OfertaAPI[];
    ofertas_api_mensais?: OfertaAPI[];
    ofertas_api_semanais?: OfertaAPI[];
    parametros_oferta?: ParametrosOferta;
  }
}

const app = express();
const PORT = process.env.PORT || 3001;
const API_KEY = process.env.API_KEY || "s2_33e5d129dcd84178afca14a2f05f954a";

// Configuração de sessão
const sessionConfig: SessionOptions = {
  secret: process.env.SESSION_SECRET || "negocia-secret-key",
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    maxAge: 24 * 60 * 60 * 1000, // 24 horas
    httpOnly: true,
  },
};

app.use(session(sessionConfig));

// Middleware
app.use(express.json());

// Configuração padrão de exemplo (como estava no PHP)
const configuraçãoExemplo: ConfiguracaoAcordo = {
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

/**
 * Rota de API - processa mensagens de negociação (sem batching, resposta imediata)
 */
app.post("/api/chat", async (req: Request, res: Response) => {
  try {
    const { mensagem } = req.body as RequisiçãoAPI;

    if (!mensagem || typeof mensagem !== "string") {
      return res.status(400).json({ erro: "Mensagem inválida" });
    }

    // Criar ChatEngine e restaurar estado da sessão
    const engine = new ChatEngine(configuraçãoExemplo, API_KEY);

    if (req.session.chat_history) {
      engine.setHistorico(req.session.chat_history);
    }
    if (req.session.cadencia) {
      engine.setCadencia(req.session.cadencia);
    }
    if (req.session.estado) {
      engine.setEstado(req.session.estado);
    }
    if (req.session.credores) {
      engine.setCredores(req.session.credores);
    }
    if (req.session.credor_selecionado) {
      engine.setCredorSelecionado(req.session.credor_selecionado);
    }
    if (req.session.ofertas_api) {
      engine.setOfertasAPI(req.session.ofertas_api);
    }
    if (req.session.ofertas_api_mensais) {
      engine.setOfertasAPIMensais(req.session.ofertas_api_mensais);
    }
    if (req.session.ofertas_api_semanais) {
      engine.setOfertasAPISemanais(req.session.ofertas_api_semanais);
    }
    if (req.session.parametros_oferta) {
      engine.setParametrosOferta(req.session.parametros_oferta);
    }

    // Processar mensagem diretamente (sem delay)
    const resultado = await engine.enviarMensagem(mensagem);

    // Persistir sessão atualizada
    req.session.chat_history = engine.historico;
    req.session.cadencia = engine.getCadencia();
    req.session.estado = engine.getEstado();
    req.session.credores = engine.getCredores();
    req.session.credor_selecionado = engine.getCredorSelecionado() || undefined;
    req.session.ofertas_api = engine.getOfertasAPI();
    req.session.ofertas_api_mensais = engine.getOfertasAPIMensais();
    req.session.ofertas_api_semanais = engine.getOfertasAPISemanais();
    req.session.parametros_oferta = engine.getParametrosOferta();

    res.json(resultado);
  } catch (error) {
    console.error("Erro ao processar mensagem:", error);
    res.status(500).json({
      erro: "Erro ao processar mensagem",
      detalhes: error instanceof Error ? error.message : "Desconhecido",
    });
  }
});

/**
 * Rota para limpar sessão
 */
app.post("/api/limpar-sessao", (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ erro: "Erro ao limpar sessão" });
    }
    res.json({ status: "ok" });
  });
});

/**
 * Rota para obter ofertas (útil para debug)
 */
app.get("/api/ofertas", (req: Request, res: Response) => {
  const engine = new ChatEngine(configuraçãoExemplo, API_KEY);

  res.json({
    ofertas: engine.historico,
    cadencia: engine.getCadencia(),
  });
});

/**
 * Rota para formalizar acordo
 */
app.post("/api/formalizar-acordo", async (req: Request, res: Response) => {
  try {
    const { iddevedor, plano, periodicidade, diasentrada } =
      req.body as DadosFormalizacao;

    if (!iddevedor || !plano) {
      return res
        .status(400)
        .json({ erro: "iddevedor e plano são obrigatórios" });
    }

    const resultado = await formalizarAcordo({
      iddevedor,
      plano,
      periodicidade,
      diasentrada,
    });
    res.json(resultado);
  } catch (error) {
    console.error("Erro ao formalizar acordo:", error);
    res.status(500).json({
      sucesso: false,
      mensagem: "Erro interno ao formalizar acordo",
    });
  }
});

/**
 * Rota health check
 */
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Servir frontend estático em produção
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendDist = path.join(__dirname, "..", "frontend", "dist");
app.use(express.static(frontendDist));
app.get("*", (_req: Request, res: Response) => {
  res.sendFile(path.join(frontendDist, "index.html"));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor LucIA rodando em http://localhost:${PORT}`);
  console.log(`📝 Interface: http://localhost:5176`);
  console.log(`💬 API de chat: http://localhost:${PORT}/api/chat`);
});
