import './index.css';
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ModalProvider } from './context/ModalContext';
import { Toaster } from 'react-hot-toast';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import * as Sentry from '@sentry/react';
import { browserTracingIntegration } from '@sentry/react';

import MarketingRoutes from './MarketingRoutes';
import DashboardRoutes from './DashboardRoutes';

// 🔐 Replace with your actual Sentry DSN
Sentry.init({
  dsn: 'your-sentry-dsn',
  integrations: [browserTracingIntegration()],
  tracesSampleRate: 1.0,
  sendDefaultPii: true,
});

function App() {
  const [isDashboardDomain, setIsDashboardDomain] = useState(false);

useEffect(() => {
  if (typeof window !== 'undefined') {
    setIsDashboardDomain(window.location.hostname.startsWith('my.'));

    const hash = window.location.hash;
    if (hash.includes('type=invite')) {
      const redirectUrl = `/set-password${hash}`;
      window.history.replaceState(null, '', redirectUrl);
    }
  }
}, []);

  return (
    <Router>
      <ModalProvider>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <Sentry.ErrorBoundary fallback={<p>Something went wrong!</p>} showDialog>
          {isDashboardDomain ? <DashboardRoutes /> : <MarketingRoutes />}
        </Sentry.ErrorBoundary>
        <Analytics />
        <SpeedInsights />
      </ModalProvider>
    </Router>
  );
}

export default App;