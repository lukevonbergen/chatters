// utils/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

const makeClient = (storage) =>
  createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: true, storage }
  });

// Look at previous choice in localStorage so sessions survive reloads
const pref =
  (typeof window !== 'undefined' &&
    localStorage.getItem('chatters_auth_storage')) || 'local';

const initialStorage = pref === 'session' ? sessionStorage : localStorage;

// Export a *mutable* client — SignIn can swap this out
export let supabase = makeClient(initialStorage);

/**
 * Call this before sign-in to swap auth persistence.
 * type = 'local'   → stays signed in (localStorage)
 * type = 'session' → logs out when browser closes (sessionStorage)
 */
export function setAuthStorage(type) {
  const storage = type === 'session' ? sessionStorage : localStorage;
  localStorage.setItem('chatters_auth_storage', type);
  supabase = makeClient(storage);
}