// App.js
import './index.css';
import React, { useEffect, useState } from 'react';
import { ModalProvider } from './context/ModalContext';
import { Toaster } from 'react-hot-toast';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import * as Sentry from '@sentry/react';
import { browserTracingIntegration } from '@sentry/react';

import MarketingRoutes from './MarketingRoutes';
import AppRoutes from './AppRoutes'; // ✅ now controls dashboard vs admin

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

      if (hash.includes('type=recovery') && !window.location.pathname.includes('/reset-password')) {
        const redirectUrl = `/reset-password${hash}`;
        window.location.replace(redirectUrl);
        return;
      }

      if (hash.includes('type=invite') && !window.location.pathname.includes('/set-password')) {
        const redirectUrl = `/set-password${hash}`;
        window.history.replaceState(null, '', redirectUrl);
      }
    }
  }, []);

  return (
    <div className={isDashboardDomain ? 'font-sans' : 'font-marketing'}>
      <ModalProvider>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <Sentry.ErrorBoundary fallback={<p>Something went wrong!</p>} showDialog>
          {isDashboardDomain ? <AppRoutes /> : <MarketingRoutes />}
        </Sentry.ErrorBoundary>
        <Analytics />
        <SpeedInsights />
      </ModalProvider>
    </div>
  );
}

export default App;
