import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { SessionContextProvider } from '@supabase/auth-helpers-react';

import App from './App';

// 👇 Create the Supabase client using your .env values
const supabaseClient = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

// 👇 Mount the app with routing + Supabase session provider
const root = createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <SessionContextProvider supabaseClient={supabaseClient}>
      <App />
    </SessionContextProvider>
  </BrowserRouter>
);
