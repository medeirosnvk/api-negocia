import React from 'react';
import type { Mensagem } from '../types';
import clsx from 'clsx';
import { useTheme } from '../hooks/useTheme';

interface MessageBubbleProps {
  mensagem: Mensagem;
}

function formatarTexto(texto: string, isLight: boolean) {
  const combinedRegex = /(https?:\/\/[^\s]+)|(\*\*[^*]+\*\*|\*[^*]+\*)/g;

  const partes: (string | React.JSX.Element)[] = [];
  let lastIndex = 0;
  let match;
  let keyCounter = 0;

  while ((match = combinedRegex.exec(texto)) !== null) {
    if (match.index > lastIndex) {
      partes.push(texto.substring(lastIndex, match.index));
    }

    if (match[1]) {
      partes.push(
        <a
          key={`link-${keyCounter++}`}
          href={match[1]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-lucia-accent hover:text-lucia-accent-hover underline underline-offset-2 decoration-lucia-accent/40 break-all transition-colors"
        >
          {match[1]}
        </a>
      );
    } else if (match[2]) {
      const conteudo = match[2].replace(/\*/g, '');
      partes.push(
        <strong key={`bold-${keyCounter++}`} className={clsx("font-semibold", isLight ? "text-gray-900" : "text-lucia-bright")}>
          {conteudo}
        </strong>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < texto.length) {
    partes.push(texto.substring(lastIndex));
  }

  return partes.length > 0 ? partes : [texto];
}

export function MessageBubble({ mensagem }: MessageBubbleProps) {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const isUser = mensagem.role === 'user';
  const timestamp = new Date(mensagem.ts);
  const horaFormatada = timestamp.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={clsx(
        'flex animate-slide-up',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={clsx(
          'max-w-[80%] md:max-w-[72%] rounded-2xl px-4 py-3 transition-colors',
          isUser
            ? isLight
              ? 'bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200'
              : 'bg-gradient-to-br from-emerald-900/80 to-emerald-950 border border-emerald-500/10'
            : isLight
              ? 'bg-white border border-gray-200'
              : 'bg-lucia-panel border border-lucia-border'
        )}
      >
        <p className={clsx(
          'text-[13.5px] leading-[1.65] whitespace-pre-wrap break-words font-body',
          isUser
            ? isLight ? 'text-emerald-900' : 'text-emerald-100'
            : isLight ? 'text-gray-700' : 'text-lucia-text'
        )}>
          {formatarTexto(mensagem.text, isLight)}
        </p>
        <div
          className={clsx(
            'text-[10px] mt-1.5 text-right font-mono tracking-wider',
            isUser
              ? isLight ? 'text-emerald-600/50' : 'text-emerald-400/40'
              : isLight ? 'text-gray-400' : 'text-lucia-muted/50'
          )}
        >
          {horaFormatada}
        </div>
      </div>
    </div>
  );
}
