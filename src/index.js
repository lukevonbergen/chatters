import { createRoot } from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-react';
import { SessionContextProvider } from '@supabase/auth-helpers-react';

const supabaseClient = createBrowserSupabaseClient();

const root = createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <SessionContextProvider supabaseClient={supabaseClient}>
      <App />
    </SessionContextProvider>
  </BrowserRouter>
);
