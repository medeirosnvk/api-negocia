import { useState } from "react";
import clsx from "clsx";
import { Copy, Check, ExternalLink, QrCode, FileText } from "lucide-react";
import { useTheme } from "../hooks/useTheme";

interface PaymentCardProps {
  urlBoleto?: string;
  pixCopiaECola?: string;
}

export function PaymentCard({ urlBoleto, pixCopiaECola }: PaymentCardProps) {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const [copied, setCopied] = useState(false);

  const copiarPix = async () => {
    if (!pixCopiaECola) return;
    try {
      await navigator.clipboard.writeText(pixCopiaECola);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback para navegadores que bloqueiam clipboard API
      const el = document.createElement("textarea");
      el.value = pixCopiaECola;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!urlBoleto && !pixCopiaECola) return null;

  return (
    <div
      className={clsx(
        "mt-3 rounded-xl border overflow-hidden",
        isLight
          ? "bg-emerald-50/50 border-emerald-200"
          : "bg-emerald-900/20 border-emerald-500/20",
      )}
    >
      {/* Header */}
      <div
        className={clsx(
          "px-3 py-2 border-b flex items-center gap-2",
          isLight
            ? "bg-emerald-100/60 border-emerald-200 text-emerald-900"
            : "bg-emerald-900/30 border-emerald-500/20 text-emerald-200",
        )}
      >
        <div
          className={clsx(
            "w-6 h-6 rounded-full flex items-center justify-center",
            isLight ? "bg-emerald-200" : "bg-emerald-700/50",
          )}
        >
          <Check size={14} strokeWidth={3} />
        </div>
        <span className="text-xs font-semibold tracking-wide uppercase">
          Pagamento disponível
        </span>
      </div>

      <div className="p-3 space-y-3">
        {/* Boleto */}
        {urlBoleto && (
          <a
            href={urlBoleto}
            target="_blank"
            rel="noopener noreferrer"
            className={clsx(
              "flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg transition-colors border group",
              isLight
                ? "bg-white border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50"
                : "bg-lucia-panel border-emerald-500/20 hover:border-emerald-400/60 hover:bg-emerald-900/30",
            )}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={clsx(
                  "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                  isLight
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-emerald-800/40 text-emerald-300",
                )}
              >
                <FileText size={16} />
              </div>
              <div className="min-w-0">
                <div
                  className={clsx(
                    "text-[11px] uppercase tracking-wider font-semibold",
                    isLight ? "text-emerald-600" : "text-emerald-400",
                  )}
                >
                  Boleto
                </div>
                <div
                  className={clsx(
                    "text-[13px] font-medium truncate",
                    isLight ? "text-gray-800" : "text-lucia-bright",
                  )}
                >
                  Abrir em nova aba
                </div>
              </div>
            </div>
            <ExternalLink
              size={15}
              className={clsx(
                "flex-shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5",
                isLight ? "text-emerald-600" : "text-emerald-400",
              )}
            />
          </a>
        )}

        {/* PIX */}
        {pixCopiaECola && (
          <div
            className={clsx(
              "rounded-lg border overflow-hidden",
              isLight
                ? "bg-white border-emerald-200"
                : "bg-lucia-panel border-emerald-500/20",
            )}
          >
            <div
              className={clsx(
                "px-3 py-2 flex items-center gap-2.5 border-b",
                isLight
                  ? "border-emerald-100 bg-emerald-50/40"
                  : "border-emerald-500/10 bg-emerald-900/10",
              )}
            >
              <div
                className={clsx(
                  "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                  isLight
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-emerald-800/40 text-emerald-300",
                )}
              >
                <QrCode size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className={clsx(
                    "text-[11px] uppercase tracking-wider font-semibold",
                    isLight ? "text-emerald-600" : "text-emerald-400",
                  )}
                >
                  PIX Copia e Cola
                </div>
                <div
                  className={clsx(
                    "text-[11px]",
                    isLight ? "text-gray-500" : "text-lucia-muted",
                  )}
                >
                  Toque em copiar e cole no app do seu banco
                </div>
              </div>
            </div>
            <div className="p-2.5 flex items-stretch gap-2">
              <code
                className={clsx(
                  "flex-1 font-mono text-[10.5px] leading-relaxed px-2.5 py-2 rounded-md break-all max-h-20 overflow-y-auto scrollbar-lucia",
                  isLight
                    ? "bg-gray-50 text-gray-600 border border-gray-200"
                    : "bg-lucia-bg text-lucia-muted border border-lucia-border",
                )}
              >
                {pixCopiaECola}
              </code>
              <button
                onClick={copiarPix}
                className={clsx(
                  "flex-shrink-0 px-3 rounded-md flex items-center gap-1.5 text-xs font-semibold transition-colors",
                  copied
                    ? isLight
                      ? "bg-emerald-600 text-white"
                      : "bg-emerald-500 text-white"
                    : isLight
                      ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                      : "bg-emerald-800/40 text-emerald-300 hover:bg-emerald-700/50",
                )}
              >
                {copied ? (
                  <>
                    <Check size={13} strokeWidth={3} />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    Copiar
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        <p
          className={clsx(
            "text-[11px] leading-snug flex items-start gap-1.5 pt-0.5",
            isLight ? "text-gray-500" : "text-lucia-muted",
          )}
        >
          <span>⚠️</span>
          <span>
            Guarde estas informações. Após o pagamento, o sistema confirmará
            automaticamente.
          </span>
        </p>
      </div>
    </div>
  );
}
