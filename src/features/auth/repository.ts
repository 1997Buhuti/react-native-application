/**
 * Auth API — the only place that talks to Supabase Auth and the login browser.
 * Hooks and screens call these named operations; they never touch `supabase.auth` directly.
 */

import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

import { supabase } from '../../lib/supabase/client';

// Completes the login on web popups. A no-op on iOS and Android.
WebBrowser.maybeCompleteAuthSession();

/**
 * Where Google sends the user after login, which Supabase then forwards to the app.
 * Expo Go gives an `exp://` URL and a built app gives `reactnativeapplication://`.
 * Both must be listed under Supabase > Authentication > URL Configuration > Redirect URLs.
 */
const redirectTo = Linking.createURL('auth/callback');

if (__DEV__) {
  // Copy this value into the Supabase redirect allowlist while you set up the project.
  console.log('[auth] redirect URL:', redirectTo);
}

const throwIfError = (error: { message: string } | null) => {
  if (error) throw new Error(error.message);
};

/**
 * Opens Google login in the system browser, then stores the session.
 * Resolves without error when the user cancels, because cancelling is not a failure.
 */
export async function signInWithGoogle(): Promise<void> {
  // Step 1: ask Supabase for the Google login URL. Don't let Supabase open the browser itself.
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });
  throwIfError(error);
  if (!data.url) throw new Error('Supabase did not return a Google sign-in URL');

  // Step 2: open that URL in a browser sheet and wait until it redirects back into the app.
  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== 'success') return;

  // Step 3: read the one-time `code` (or the error) from the redirect URL.
  const params = Linking.parse(result.url).queryParams ?? {};
  if (params.error) {
    throw new Error(String(params.error_description ?? params.error));
  }

  const code = params.code;
  if (typeof code !== 'string') throw new Error('Login finished without an auth code');

  // Step 4: trade the code for a session. supabase-js saves it and emits SIGNED_IN.
  const exchange = await supabase.auth.exchangeCodeForSession(code);
  throwIfError(exchange.error);
}

/**
 * Creates an account with email and password.
 * Returns true when the user must click a confirmation email before signing in.
 */
export async function signUpWithPassword(email: string, password: string): Promise<boolean> {
  const { data, error } = await supabase.auth.signUp({ email, password });
  throwIfError(error);
  // With "Confirm email" on, Supabase returns no session until the link is clicked.
  return data.session === null;
}

/** Signs in an existing user with email and password. */
export async function signInWithPassword(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  throwIfError(error);
}

/** Ends the session on this device. */
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  throwIfError(error);
}
