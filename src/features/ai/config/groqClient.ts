import Groq from 'groq-sdk';

const apiKey = import.meta.env.VITE_GROQ_API_KEY;
if (!apiKey) {
  console.error('VITE_GROQ_API_KEY is not set — AI features will not work');
}

export const groq = new Groq({
  apiKey: apiKey ?? '',
  dangerouslyAllowBrowser: true,
});

export const GROQ_MODEL = 'llama-3.3-70b-versatile';
