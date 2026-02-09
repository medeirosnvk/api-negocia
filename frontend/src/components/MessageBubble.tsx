import React from 'react';
import type { Mensagem } from '../types';
import clsx from 'clsx';

interface MessageBubbleProps {
  mensagem: Mensagem;
}

function formatarTexto(texto: string) {
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
        <strong key={`bold-${keyCounter++}`} className="font-semibold text-lucia-bright">
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
            ? 'bg-gradient-to-br from-lucia-user to-[#162d4a] border border-blue-500/10'
            : 'bg-lucia-panel border border-lucia-border'
        )}
      >
        <p className={clsx(
          'text-[13.5px] leading-[1.65] whitespace-pre-wrap break-words font-body',
          isUser ? 'text-lucia-user-text' : 'text-lucia-text'
        )}>
          {formatarTexto(mensagem.text)}
        </p>
        <div
          className={clsx(
            'text-[10px] mt-1.5 text-right font-mono tracking-wider',
            isUser ? 'text-blue-400/40' : 'text-lucia-muted/50'
          )}
        >
          {horaFormatada}
        </div>
      </div>
    </div>
  );
}
