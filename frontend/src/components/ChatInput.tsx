import { useState, type KeyboardEvent } from 'react';
import { ArrowUp } from 'lucide-react';
import clsx from 'clsx';

interface ChatInputProps {
  onEnviar: (mensagem: string) => void;
  disabled: boolean;
  placeholder: string;
}

export function ChatInput({ onEnviar, disabled, placeholder }: ChatInputProps) {
  const [mensagem, setMensagem] = useState('');

  const handleEnviar = () => {
    if (!mensagem.trim() || disabled) return;
    onEnviar(mensagem.trim());
    setMensagem('');
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !disabled) {
      handleEnviar();
    }
  };

  const canSend = mensagem.trim().length > 0 && !disabled;

  return (
    <div className="glass-header border-t border-lucia-border px-4 py-3 relative z-10">
      <div className="flex items-center gap-2.5">
        <div className="flex-1 relative">
          <input
            type="text"
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            className={clsx(
              'w-full glass-input text-lucia-bright placeholder-lucia-muted/50 rounded-xl px-4 py-3 text-sm font-body outline-none transition-all duration-300',
              'border border-lucia-border',
              'focus:border-lucia-accent/40 focus:shadow-[0_0_0_3px_rgba(212,168,83,0.08)]',
              disabled && 'opacity-40 cursor-not-allowed'
            )}
          />
        </div>
        <button
          onClick={handleEnviar}
          disabled={!canSend}
          className={clsx(
            'relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300',
            canSend
              ? 'bg-gradient-to-br from-lucia-accent to-amber-700 text-lucia-bg shadow-lg shadow-lucia-accent-soft hover:shadow-lucia-accent-glow active:scale-95'
              : 'bg-lucia-elevated text-lucia-muted/30 cursor-not-allowed'
          )}
          title="Enviar mensagem"
        >
          <ArrowUp size={18} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
