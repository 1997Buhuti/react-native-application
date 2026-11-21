/**
 * Declares auth state for the UI: the current session plus sign-in, sign-up, and sign-out actions.
 * `session` follows Supabase auth events, so the UI never needs to poll.
 */

import type { Session } from '@supabase/supabase-js';
import { useCallback, useEffect, useState } from 'react';

import { supabase } from '../../lib/supabase/client';

import * as authRepo from './repository';

type AuthState = {
  /** Null when signed out. */
  session: Session | null;
  /** True until we know whether a saved session exists on this device. */
  loading: boolean;
  /** True while a sign-in, sign-up, or sign-out request is running. */
  busy: boolean;
  error: string | null;
  /** Non-error message for the user, such as "check your email". */
  notice: string | null;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signUpWithPassword: (email: string, password: string) => Promise<void>;
  /** Not wired to a button right now. Kept for when Google login is added back. */
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

export function useAuth(): AuthState {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    // Restore a session saved by a previous launch.
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (alive) setSession(data.session);
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : 'Could not restore session');
      } finally {
        if (alive) setLoading(false);
      }
    })();

    // Runs on sign-in, sign-out, and token refresh.
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => {
      if (alive) setSession(next);
    });

    return () => {
      alive = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  // Every action shares the same busy and error handling, so each one stays a single line.
  const run = useCallback(async (action: () => Promise<void>, fallbackMessage: string) => {
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      await action();
    } catch (e) {
      setError(e instanceof Error ? e.message : fallbackMessage);
    } finally {
      setBusy(false);
    }
  }, []);

  const signInWithPassword = useCallback(
    (email: string, password: string) =>
      run(() => authRepo.signInWithPassword(email, password), 'Sign-in failed'),
    [run]
  );

  const signUpWithPassword = useCallback(
    (email: string, password: string) =>
      run(async () => {
        const needsConfirmation = await authRepo.signUpWithPassword(email, password);
        if (needsConfirmation) {
          setNotice('Check your email and click the confirmation link, then sign in.');
        }
      }, 'Sign-up failed'),
    [run]
  );

  const signInWithGoogle = useCallback(
    () => run(() => authRepo.signInWithGoogle(), 'Google sign-in failed'),
    [run]
  );

  const signOut = useCallback(() => run(() => authRepo.signOut(), 'Sign-out failed'), [run]);

  return {
    session,
    loading,
    busy,
    error,
    notice,
    signInWithPassword,
    signUpWithPassword,
    signInWithGoogle,
    signOut,
  };
}
