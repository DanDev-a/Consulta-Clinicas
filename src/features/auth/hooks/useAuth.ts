import { useState } from 'react';
import { supabase } from '../../../config/supabaseClient';

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signInWithEmail = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setLoading(false);
    return !error;
  };

  const signUpWithEmail = async (email: string, password: string, metadata?: Record<string, any>) => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: metadata ? { data: metadata } : undefined,
    });
    if (error) setError(error.message);
    setLoading(false);
    return !error;
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/app` },
    });
    if (error) setError(error.message);
    setLoading(false);
    return !error;
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    });
    if (error) setError(error.message);
    setLoading(false);
    return !error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return {
    loading,
    error,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    resetPassword,
    signOut,
  };
}