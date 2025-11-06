// utils/supabase.js
import { createClient } from '@supabase/supabase-js';
import perfLogger from './performanceLogger';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Create base Supabase client
const baseSupabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storage: localStorage,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Wrap Supabase client to add performance logging
const createPerformanceProxy = (target, tableName = '') => {
  return new Proxy(target, {
    get(obj, prop) {
      const value = obj[prop];

      // If it's a function that returns a promise, wrap it with performance logging
      if (typeof value === 'function') {
        return function(...args) {
          const result = value.apply(obj, args);

          // If the result is a PromiseBuilder (has .then), wrap it
          if (result && typeof result.then === 'function') {
            const queryLabel = `${tableName}.${String(prop)}${args.length ? `(${JSON.stringify(args[0]).substring(0, 50)}...)` : '()'}`;

            // Wrap the promise to log timing
            const startTime = performance.now();
            return result.then((data) => {
              const duration = performance.now() - startTime;
              const rowCount = Array.isArray(data?.data) ? data.data.length : null;
              perfLogger.logQuery(queryLabel, duration, rowCount, data?.error);
              return data;
            }).catch((error) => {
              const duration = performance.now() - startTime;
              perfLogger.logQuery(queryLabel, duration, null, error);
              throw error;
            });
          }

          // If it's a query builder (from, select, etc.), proxy it too
          if (result && typeof result === 'object' && (prop === 'from' || prop === 'rpc')) {
            return createPerformanceProxy(result, args[0] || tableName);
          }

          return result;
        };
      }

      return value;
    }
  });
};

// Export wrapped Supabase client
export const supabase = process.env.NODE_ENV === 'development'
  ? createPerformanceProxy(baseSupabase)
  : baseSupabase;