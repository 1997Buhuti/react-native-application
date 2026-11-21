/**
 * Single Supabase client for the app.
 * URL + publishable key come from EXPO_PUBLIC_* env (safe with RLS on the table).
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';

import type { Database } from './database.types';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    'Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Copy .env.example → .env.'
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabasePublishableKey, {
  auth: {
    // Keeps the login session on the device, so users stay signed in after a restart.
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    // Phones have no browser URL to read a session from, so we handle the login redirect ourselves.
    detectSessionInUrl: false,
    // PKCE sends back a one-time `code` that we exchange for a session. The default
    // implicit flow would return tokens directly in the URL.
    flowType: 'pkce',
  },
});

// Refresh the session only while the app is in the foreground. Supabase recommends this on mobile.
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
