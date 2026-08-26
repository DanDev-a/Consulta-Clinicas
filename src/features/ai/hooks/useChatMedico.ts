import { useState, useCallback, useRef } from 'react';
import { supabase } from '../../../config/supabaseClient';
import { groq, GROQ_MODEL } from '../config/groqClient';
import type { ChatMessage } from '../types/ai';

export function useChatMedico(userId: string | undefined) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesRef = useRef<ChatMessage[]>([]);

  const startChat = useCallback(() => {
    const welcome: ChatMessage[] = [{
      role: 'assistant',
      content: 'Hola, soy tu asistente médico. ¿En qué puedo ayudarte? Podés preguntarme sobre diagnósticos, tratamientos, interacciones medicamentosas o cualquier consulta médica.',
      timestamp: new Date(),
    }];
    setMessages(welcome);
    messagesRef.current = welcome;
  }, []);

  const sendMessage = async (
    content: string,
    _diagnosticoIAId?: number,
    pacienteId?: string
  ): Promise<void> => {
    const userMsg: ChatMessage = { role: 'user', content, timestamp: new Date() };
    const previousMessages = messagesRef.current;
    const updatedMessages = [...previousMessages, userMsg];
    setMessages(updatedMessages);
    messagesRef.current = updatedMessages;
    setLoading(true);
    setError(null);

    try {
      const systemContext = `Sos un asistente médico de la Clinica Proyecto.
Respondé en español, de forma clara y concisa.
Si no estás seguro de algo, decilo.
No reemplazás la opinión de un médico profesional.
Contexto del paciente: ${pacienteId ? 'Paciente seleccionado en el sistema' : 'Sin paciente específico'}`;

      const groqMessages = [
        { role: 'system' as const, content: systemContext },
        ...previousMessages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
        { role: 'user' as const, content },
      ];

      const completion = await groq.chat.completions.create({
        messages: groqMessages,
        model: GROQ_MODEL,
        temperature: 0.5,
        max_completion_tokens: 1024,
      });

      const assistantContent = completion.choices[0]?.message?.content ?? 'No pude generar una respuesta.';
      const assistantMsg: ChatMessage = { role: 'assistant', content: assistantContent, timestamp: new Date() };

      const finalMessages = [...updatedMessages, assistantMsg];
      setMessages(finalMessages);
      messagesRef.current = finalMessages;

      const tokensInput = completion.usage?.prompt_tokens ?? 0;
      const tokensOutput = completion.usage?.completion_tokens ?? 0;

      if (userId) {
        await supabase.from('ai_memory').insert({
          id_doctor: userId,
          id_paciente: pacienteId ?? null,
          session_id: null,
          content: `Chat: ${content} → ${assistantContent.slice(0, 200)}`,
          metadata: { type: 'chat', tokens_input: tokensInput, tokens_output: tokensOutput },
        });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al procesar mensaje';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const fetchChatHistory = useCallback(async (pacienteId: string) => {
    try {
      const { data } = await supabase
        .from('ai_memory')
        .select('content, created_at')
        .eq('id_paciente', pacienteId)
        .eq('id_doctor', userId)
        .like('content', 'Chat: %')
        .order('created_at', { ascending: true })
        .limit(50);

      const history: ChatMessage[] = [];
      for (const row of data ?? []) {
        const match = row.content.match(/^Chat: (.+?) → (.+)$/s);
        if (match) {
          history.push({ role: 'user', content: match[1], timestamp: new Date(row.created_at) });
          history.push({ role: 'assistant', content: match[2], timestamp: new Date(row.created_at) });
        }
      }
      if (history.length > 0) {
        setMessages(history);
        messagesRef.current = history;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar historial');
    }
  }, [userId]);

  const clearChat = useCallback(() => {
    setMessages([]);
    messagesRef.current = [];
    setError(null);
  }, []);

  return { messages, loading, error, startChat, sendMessage, fetchChatHistory, clearChat };
}
