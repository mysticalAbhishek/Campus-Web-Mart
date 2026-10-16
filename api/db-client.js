import { createClient } from '@supabase/supabase-js';
import localSupabase from './local-db.js';
import { triggerRestore } from './db-wake.js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Fallback to local SQLite if remote Supabase is unavailable or dead
const isDeadRemote = !supabaseUrl || supabaseUrl.includes('sloeklcnymqdkkvntpxn.supabase.co');

let supabase = localSupabase;

if (!isDeadRemote && supabaseUrl.startsWith('http')) {
  try {
    supabase = createClient(supabaseUrl, serviceKey, {
      global: {
        fetch: async (url, options) => {
          const res = await fetch(url, options);
          if (!res.ok && res.status >= 500) triggerRestore();
          return res;
        },
      },
    });
  } catch (err) {
    console.warn('[db-client] Falling back to local database:', err.message);
    supabase = localSupabase;
  }
}

export default supabase;
