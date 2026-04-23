import { useState } from "react";
import { ChatHeader } from "../components/ChatHeader";
import { MessageList } from "../components/MessageList";
import { ChatInput } from "../components/ChatInput";
import { useTheme } from "../hooks/useTheme";
import {
  enviarMensagemAPI,
  limparSessaoAPI,
  formalizarAcordoAPI,
} from "../services/chatService";
import clsx from "clsx";
import type { Mensagem } from "../types";

const MENSAGEM_INICIAL: Mensagem = {
  role: "assistant",
  text: "Olá! Eu sou a LucIA, assistente virtual da Cobrance. Estou à disposição para te ajudar no que precisar. Como posso te auxiliar hoje?",
  ts: new Date().toISOString(),
};

export function ChatScreen() {
  const [mensagens, setMensagens] = useState<Mensagem[]>([MENSAGEM_INICIAL]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputDisabled, setInputDisabled] = useState(false);
  const [placeholder, setPlaceholder] = useState("Digite sua mensagem...");

  const adicionarMensagem = (text: string, role: "user" | "assistant") => {
    const novaMensagem: Mensagem = {
      role,
      text,
      ts: new Date().toISOString(),
    };
    setMensagens((prev) => [...prev, novaMensagem]);
  };

  const adicionarPaymentCard = (urlBoleto?: string, pixCopiaECola?: string) => {
    if (!urlBoleto && !pixCopiaECola) return;
    // Anexa o card à última mensagem do assistente quando possível —
    // assim fica visualmente ligado ao "Acordo formalizado!" da LucIA.
    setMensagens((prev) => {
      if (prev.length === 0) return prev;
      const idxUltimoAssistant = [...prev]
        .reverse()
        .findIndex((m) => m.role === "assistant");
      if (idxUltimoAssistant === -1) return prev;
      const realIdx = prev.length - 1 - idxUltimoAssistant;
      const copia = [...prev];
      copia[realIdx] = {
        ...copia[realIdx],
        payment: { urlBoleto, pixCopiaECola },
      };
      return copia;
    });
  };

  const formalizarAcordo = async (
    iddevedor: number,
    plano: number,
    periodicidade: number,
    diasentrada: number,
    onSucesso: () => void,
  ) => {
    try {
      const data = await formalizarAcordoAPI(
        iddevedor,
        plano,
        periodicidade,
        diasentrada,
      );

      if (data.sucesso && data.detalhes) {
        const terceira = data.detalhes.terceiraEtapaResponse as
          | { urlBoleto?: string; pixCopiaECola?: string }
          | undefined;
        adicionarMensagem(
          "Prontinho! Seu acordo foi formalizado com sucesso. Os dados de pagamento estão logo abaixo.",
          "assistant",
        );
        adicionarPaymentCard(terceira?.urlBoleto, terceira?.pixCopiaECola);
        onSucesso();
      } else {
        setIsTyping(false);
        adicionarMensagem(
          data.mensagem ||
            "Houve um problema ao formalizar o acordo. Por favor, tente novamente ou entre em contato conosco.",
          "assistant",
        );
      }
    } catch (error) {
      console.error("Erro ao formalizar:", error);
      setIsTyping(false);
      adicionarMensagem(
        "A formalização do acordo não foi concluída. Por favor, tente novamente ou entre em contato conosco.",
        "assistant",
      );
    }
  };

  const enviarMensagem = async (texto: string) => {
    adicionarMensagem(texto, "user");
    setIsTyping(true);

    try {
      const data = await enviarMensagemAPI(texto);
      setIsTyping(false);
      adicionarMensagem(data.resposta, "assistant");

      // Backend já formalizou internamente — anexa o card de pagamento à
      // última bolha da LucIA (visual limpo, sem paredão de texto).
      if (data.status === "acordo_formalizado") {
        if (data.urlBoleto || data.pixCopiaECola) {
          adicionarPaymentCard(data.urlBoleto, data.pixCopiaECola);
        } else {
          adicionarMensagem(
            "⚠️ O acordo foi formalizado, mas não recebemos os dados de pagamento. Entre em contato com a Cobrance.",
            "assistant",
          );
        }
        return;
      }

      // Erro durante formalização interna
      if (data.status === "erro_formalizacao") {
        adicionarMensagem(
          "⚠️ Não foi possível concluir a formalização. Por favor, tente novamente ou entre em contato com a Cobrance.",
          "assistant",
        );
        return;
      }

      // Fallback: backend sinalizou aceite mas não formalizou — tentar via /api/formalizar-acordo
      if (data.status === "acordo_fechado") {
        if (
          data.iddevedor != null &&
          data.plano != null &&
          data.periodicidade != null &&
          data.diasentrada != null
        ) {
          setIsTyping(true);
          formalizarAcordo(
            data.iddevedor,
            data.plano,
            data.periodicidade,
            data.diasentrada,
            () => {
              setIsTyping(false);
            },
          );
        } else {
          adicionarMensagem(
            "Não foi possível formalizar o acordo (dados insuficientes). Por favor, tente novamente.",
            "assistant",
          );
        }
      }
    } catch (error) {
      setIsTyping(false);
      adicionarMensagem(
        "Ops, tive um probleminha na conexão. Pode repetir?",
        "assistant",
      );
      console.error("Erro:", error);
    }
  };

  const limparConversa = async () => {
    if (!confirm("Deseja realmente limpar a conversa e começar do zero?")) {
      return;
    }

    try {
      await limparSessaoAPI();
      setMensagens([MENSAGEM_INICIAL]);
      setInputDisabled(false);
      setPlaceholder("Digite sua mensagem...");
      setIsTyping(false);
    } catch (error) {
      alert("Erro ao limpar sessão");
      console.error("Erro:", error);
    }
  };

  const gerarRelatorio = () => {
    const novaJanela = window.open("", "_blank");
    if (!novaJanela) {
      alert(
        "Seu navegador bloqueou a nova aba. Permita pop-ups para gerar o relatório.",
      );
      return;
    }

    const escapeHtml = (str: string) => {
      return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
    };

    const linhas = mensagens
      .map((m) => {
        const quando = new Date(m.ts).toLocaleString("pt-BR");
        const quem = m.role === "user" ? "Você" : "LucIA";
        return `
          <div class="msg ${m.role}">
            <div class="meta">
              <span class="who">${escapeHtml(quem)}</span>
              <span class="when">${escapeHtml(quando)}</span>
            </div>
            <div class="text">${escapeHtml(m.text).replaceAll("\n", "<br>")}</div>
          </div>
        `;
      })
      .join("\n");

    const geradoEm = new Date().toLocaleString("pt-BR");

    const html = `
      <!doctype html>
      <html lang="pt-br">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Relatório do Diálogo - LucIA</title>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet">
        <style>
          body { font-family: 'DM Sans', sans-serif; background:#0c0e12; margin:0; padding:32px; color:#c8d1de; }
          .wrap { max-width: 800px; margin: 0 auto; }
          h1 { margin: 0 0 4px 0; font-size: 20px; color: #e8ecf2; font-weight: 600; }
          .sub { color:#6b7a94; margin: 0 0 24px 0; font-size: 12px; letter-spacing: 0.5px; }
          .msg { background:#1a1e26; border:1px solid #2a303c; border-radius:12px; padding:16px; margin: 12px 0; }
          .msg.user { border-left: 3px solid #065f46; }
          .msg.assistant { border-left: 3px solid #2d9e5e; }
          .meta { display:flex; justify-content:space-between; gap:12px; color:#6b7a94; font-size: 11px; margin-bottom: 10px; }
          .who { font-weight:600; color:#e8ecf2; }
          .text { color:#c8d1de; font-size: 13.5px; line-height: 1.65; white-space: normal; }
          .actions { margin: 20px 0 0; display:flex; gap:10px; }
          button { cursor:pointer; border:1px solid #2a303c; background:#1a1e26; color:#c8d1de; padding:10px 16px; border-radius:10px; font-family: 'DM Sans', sans-serif; font-size: 13px; transition: all 0.2s; }
          button:hover { background:#222730; border-color: #2d9e5e; color: #2d9e5e; }
        </style>
      </head>
      <body>
        <div class="wrap">
          <h1>Relatório do Diálogo</h1>
          <p class="sub">LucIA · Gerado em: ${escapeHtml(geradoEm)}</p>
          <div class="actions">
            <button onclick="window.print()">Imprimir / Salvar em PDF</button>
            <button onclick="navigator.clipboard.writeText(document.body.innerText); alert('Copiado!')">Copiar texto</button>
          </div>
          ${linhas || '<div class="msg"><div class="text">Nenhuma mensagem registrada ainda.</div></div>'}
        </div>
      </body>
      </html>
    `;

    novaJanela.document.open();
    novaJanela.document.write(html);
    novaJanela.document.close();
  };

  return (
    <div
      className={clsx(
        "flex flex-col w-full max-w-[600px] h-[calc(100vh-4rem)] max-h-[900px] glass-panel border rounded-2xl overflow-hidden shadow-2xl relative",
        useTheme().theme === "light"
          ? "border-gray-200 shadow-black/10"
          : "border-lucia-border shadow-black/40",
      )}
    >
      {/* Subtle top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-lucia-accent/30 to-transparent" />

      <ChatHeader
        onGerarRelatorio={gerarRelatorio}
        onLimparConversa={limparConversa}
      />
      <MessageList mensagens={mensagens} isTyping={isTyping} />
      <ChatInput
        onEnviar={enviarMensagem}
        disabled={inputDisabled}
        placeholder={placeholder}
      />
    </div>
  );
}
