import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { supabase } from './utils/supabase';

import App from './App';

const root = createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <SessionContextProvider supabaseClient={supabase}>
      <App />
    </SessionContextProvider>
  </BrowserRouter>
);
console.log('ENV URL:', process.env.REACT_APP_SUPABASE_URL)
