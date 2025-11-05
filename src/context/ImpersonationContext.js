import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

const ImpersonationContext = createContext();

export const useImpersonation = () => {
  const context = useContext(ImpersonationContext);
  if (!context) {
    throw new Error('useImpersonation must be used within ImpersonationProvider');
  }
  return context;
};

export const ImpersonationProvider = ({ children }) => {
  const [impersonation, setImpersonation] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminStatus();
    loadImpersonation();

    // Listen for impersonation changes via custom event
    const handleImpersonationEvent = (event) => {
      if (event.detail?.impersonation) {
        setImpersonation(event.detail.impersonation);
      } else {
        setImpersonation(null);
      }
    };

    // Also listen for storage changes (when impersonation is set in another tab)
    const handleStorageChange = () => {
      loadImpersonation();
    };

    window.addEventListener('impersonationChanged', handleImpersonationEvent);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('impersonationChanged', handleImpersonationEvent);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email?.endsWith('@getchatters.com')) {
        setIsAdmin(true);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadImpersonation = () => {
    try {
      const stored = localStorage.getItem('impersonation');
      if (stored) {
        const parsed = JSON.parse(stored);
        setImpersonation(parsed);
      }
    } catch (error) {
      localStorage.removeItem('impersonation');
    }
  };

  const startImpersonation = async (accountId, accountName) => {
    if (!isAdmin) {
      return false;
    }

    try {
      const impersonationData = {
        accountId,
        accountName,
        startedAt: new Date().toISOString()
      };

      localStorage.setItem('impersonation', JSON.stringify(impersonationData));
      setImpersonation(impersonationData);

      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('impersonationChanged', {
        detail: { impersonation: impersonationData }
      }));

      return true;
    } catch (error) {
      return false;
    }
  };

  const endImpersonation = () => {
    localStorage.removeItem('impersonation');
    setImpersonation(null);
  };

  const value = {
    impersonation,
    isAdmin,
    loading,
    startImpersonation,
    endImpersonation,
    isImpersonating: !!impersonation
  };

  return (
    <ImpersonationContext.Provider value={value}>
      {children}
    </ImpersonationContext.Provider>
  );
};
