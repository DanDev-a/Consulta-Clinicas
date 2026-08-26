import { useState, useRef, useEffect } from 'react';
import { Card, Button, Spinner, Alert } from '../../../components/ui';
import { RiSendPlaneLine, RiRobot2Line, RiUserLine } from 'react-icons/ri';
import type { ChatMessage } from '../types/ai';

const MAX_MESSAGE_LENGTH = 2000;

interface ChatMedicoProps {
  messages: ChatMessage[];
  loading: boolean;
  error?: string | null;
  onSend: (message: string) => Promise<void>;
}

export default function ChatMedico({ messages, loading, error, onSend }: ChatMedicoProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput('');
    await onSend(msg);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="flex flex-col h-[60vh] max-h-[500px]">
      <div className="p-4 border-b border-[var(--color-border-light)]">
        <h3 className="font-semibold flex items-center gap-2">
          <RiRobot2Line className="text-[var(--color-accent)]" />
          Chat Médico con IA
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={`${msg.timestamp.getTime()}-${i}`} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-[var(--color-accent-soft)] flex items-center justify-center flex-shrink-0">
                <RiRobot2Line className="text-[var(--color-accent)]" />
              </div>
            )}
            <div className={`max-w-[75%] p-3 rounded-2xl text-sm ${
              msg.role === 'user'
                ? 'bg-[var(--color-accent)] text-white rounded-br-sm'
                : 'bg-[var(--color-bg-secondary)] rounded-bl-sm'
            }`}>
              <div className="whitespace-pre-wrap">{msg.content}</div>
              <div className={`text-xs mt-1 ${msg.role === 'user' ? 'text-white/70' : 'text-[var(--color-text-muted)]'}`}>
                {msg.timestamp.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-[var(--color-bg-secondary)] flex items-center justify-center flex-shrink-0">
                <RiUserLine />
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div className="px-4">
          <Alert variant="danger">{error}</Alert>
        </div>
      )}

      <div className="p-4 border-t border-[var(--color-border-light)]">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
            onKeyDown={handleKeyDown}
            placeholder="Escribí tu consulta médica..."
            className="flex-1 px-4 py-2 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-light)] focus:outline-none focus:border-[var(--color-accent)] text-sm"
            disabled={loading}
            maxLength={MAX_MESSAGE_LENGTH}
          />
          <Button onClick={handleSend} disabled={loading || !input.trim()}>
            {loading ? <Spinner size="sm" /> : <RiSendPlaneLine />}
          </Button>
        </div>
        <div className="text-xs text-[var(--color-text-muted)] mt-1 text-right">
          {input.length}/{MAX_MESSAGE_LENGTH}
        </div>
      </div>
    </Card>
  );
}
