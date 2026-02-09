export function TypingIndicator() {
  return (
    <div className="bg-lucia-panel border border-lucia-border rounded-2xl px-4 py-3 inline-flex items-center gap-1.5">
      <div className="w-1.5 h-1.5 bg-lucia-accent/60 rounded-full animate-typing-pulse" />
      <div className="w-1.5 h-1.5 bg-lucia-accent/60 rounded-full animate-typing-pulse" style={{ animationDelay: '0.25s' }} />
      <div className="w-1.5 h-1.5 bg-lucia-accent/60 rounded-full animate-typing-pulse" style={{ animationDelay: '0.5s' }} />
    </div>
  );
}
