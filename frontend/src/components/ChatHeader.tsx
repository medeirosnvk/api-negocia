import { FileText, RotateCcw, Sun, Moon } from "lucide-react";
import { useTheme } from "../App";
import clsx from "clsx";

interface ChatHeaderProps {
  onGerarRelatorio: () => void;
  onLimparConversa: () => void;
}

export function ChatHeader({
  onGerarRelatorio,
  onLimparConversa,
}: ChatHeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === "light";

  return (
    <div
      className={clsx(
        "glass-header border-b relative z-10",
        isLight ? "border-gray-200" : "border-lucia-border",
      )}
    >
      <div className="flex items-center gap-3 px-5 py-4">
        {/* Avatar with Cobrance Logo */}
        <div className="relative">
          <img
            src="/logo_cobrance.png"
            alt="Cobrance"
            className="w-10 h-10 rounded-xl object-contain p-0.5 bg-white shadow-lg shadow-lucia-accent-soft"
          />
          <div
            className={clsx(
              "absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-lucia-success rounded-full border-2",
              isLight ? "border-white" : "border-lucia-surface",
            )}
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h1
            className={clsx(
              "font-display font-semibold text-[15px] tracking-tight",
              isLight ? "text-gray-900" : "text-lucia-bright",
            )}
          >
            LucIA - Cobrance
          </h1>
          <p
            className={clsx(
              "text-xs font-body tracking-wide",
              isLight ? "text-gray-500" : "text-lucia-muted",
            )}
          >
            Assistente de Negociação
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleTheme}
            className={clsx(
              "group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 hover:text-lucia-accent hover:bg-lucia-accent-soft",
              isLight ? "text-gray-500" : "text-lucia-muted",
            )}
            title={isLight ? "Modo escuro" : "Modo claro"}
          >
            {theme === "dark" ? (
              <Sun
                size={14}
                className="transition-transform group-hover:rotate-45"
              />
            ) : (
              <Moon
                size={14}
                className="transition-transform group-hover:-rotate-12"
              />
            )}
          </button>
          <button
            onClick={onGerarRelatorio}
            className={clsx(
              "group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 hover:text-lucia-accent hover:bg-lucia-accent-soft",
              isLight ? "text-gray-500" : "text-lucia-muted",
            )}
            title="Abrir relatório do diálogo em uma nova aba"
          >
            <FileText
              size={14}
              className="transition-transform group-hover:scale-110"
            />
            <span className="hidden sm:inline">Relatório</span>
          </button>
          <button
            onClick={onLimparConversa}
            className={clsx(
              "group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 hover:text-lucia-error hover:bg-red-500/10",
              isLight ? "text-gray-500" : "text-lucia-muted",
            )}
            title="Limpar conversa"
          >
            <RotateCcw
              size={14}
              className="transition-transform group-hover:-rotate-90"
            />
            <span className="hidden sm:inline">Nova conversa</span>
          </button>
        </div>
      </div>
    </div>
  );
}
