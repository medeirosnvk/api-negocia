import { FileText, RotateCcw, Sparkles } from "lucide-react";

interface ChatHeaderProps {
  onGerarRelatorio: () => void;
  onLimparConversa: () => void;
}

export function ChatHeader({
  onGerarRelatorio,
  onLimparConversa,
}: ChatHeaderProps) {
  return (
    <div className="glass-header border-b border-lucia-border relative z-10">
      <div className="flex items-center gap-3 px-5 py-4">
        {/* Avatar */}
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-lucia-accent to-amber-700 flex items-center justify-center shadow-lg shadow-lucia-accent-soft">
            <Sparkles size={18} className="text-lucia-bg" />
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-lucia-success rounded-full border-2 border-lucia-surface" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h1 className="text-lucia-bright font-display font-semibold text-[15px] tracking-tight">
            LucIA
          </h1>
          <p className="text-lucia-muted text-xs font-body tracking-wide">
            Assistente de Negociação
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onGerarRelatorio}
            className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-lucia-muted hover:text-lucia-accent hover:bg-lucia-accent-soft text-xs font-medium transition-all duration-200"
            title="Abrir relatório do diálogo em uma nova aba"
          >
            <FileText size={14} className="transition-transform group-hover:scale-110" />
            <span className="hidden sm:inline">Relatório</span>
          </button>
          <button
            onClick={onLimparConversa}
            className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-lucia-muted hover:text-lucia-error hover:bg-red-500/10 text-xs font-medium transition-all duration-200"
            title="Limpar conversa"
          >
            <RotateCcw size={14} className="transition-transform group-hover:-rotate-90" />
            <span className="hidden sm:inline">Nova conversa</span>
          </button>
        </div>
      </div>
    </div>
  );
}
