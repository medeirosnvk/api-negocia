import { useEffect, useRef } from 'react';
import type { Mensagem } from '../types';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';

interface MessageListProps {
  mensagens: Mensagem[];
  isTyping: boolean;
}

export function MessageList({ mensagens, isTyping }: MessageListProps) {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens, isTyping]);

  return (
    <div className="flex-1 overflow-y-auto scrollbar-lucia px-4 md:px-6 py-6 space-y-4">
      {mensagens.map((mensagem, index) => (
        <MessageBubble key={`${mensagem.ts}-${index}`} mensagem={mensagem} />
      ))}

      {isTyping && (
        <div className="flex justify-start animate-fade-in">
          <TypingIndicator />
        </div>
      )}

      <div ref={endOfMessagesRef} />
    </div>
  );
}
