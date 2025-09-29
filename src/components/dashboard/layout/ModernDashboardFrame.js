import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useVenue } from '../../../context/VenueContext';
import { supabase } from '../../../utils/supabase';
import Sidebar from './Sidebar';
import ModernHeader from './ModernHeader';
import { FiClock, FiZap } from 'react-icons/fi';
import { Button } from '../../ui/button';

const ModernDashboardFrame = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [trialInfo, setTrialInfo] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { userRole } = useVenue();

  useEffect(() => {
    const loadUser = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const email = userData?.user?.email;
      const userId = userData?.user?.id;
      
      if (!email) return navigate('/signin');
      
      const { data: user } = await supabase
        .from('users')
        .select('email, role, account_id')
        .eq('id', userId)
        .single();
      
      if (!user) return navigate('/signin');
      
      setUserInfo(user);

      // Only fetch trial info for master users
      if (user.role === 'master') {
        const accountIdToCheck = user.account_id;

        if (accountIdToCheck) {
          const { data: account } = await supabase
            .from('accounts')
            .select('trial_ends_at, is_paid, demo_account')
            .eq('id', accountIdToCheck)
            .single();

          if (account?.trial_ends_at && !account.is_paid && !account.demo_account) {
            const trialEndDate = new Date(account.trial_ends_at);
            const daysLeft = Math.max(
              0,
              Math.ceil((trialEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
            );
            
            setTrialInfo({
              endsAt: trialEndDate,
              daysLeft: daysLeft,
              isActive: daysLeft > 0,
              isExpired: daysLeft <= 0,
              isPaid: account.is_paid,
              isDemoAccount: account.demo_account || false
            });
          }
        }
      }
    };
    loadUser();
  }, [navigate]);

  // Handle responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Check initial size

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Redirect expired trials
  const isOnBillingRoute = location.pathname === '/settings/billing' || location.pathname.startsWith('/settings/billing');
  
  useEffect(() => {
    if (trialInfo?.isExpired && !isOnBillingRoute) {
      navigate('/settings/billing');
    }
  }, [trialInfo?.isExpired, isOnBillingRoute, navigate]);

  if (!userInfo) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Trial Banner */}
      {trialInfo && trialInfo.isActive && userRole === 'master' && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 px-6 py-3">
          <div className="flex items-center justify-between max-w-full">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                <FiZap className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                <span className="text-blue-900 font-semibold text-sm">
                  Trial Account
                </span>
                <div className="flex items-center gap-1 text-blue-700 text-sm">
                  <FiClock className="w-3 h-3" />
                  <span>
                    <span className="font-bold">{trialInfo.daysLeft}</span> day{trialInfo.daysLeft !== 1 ? 's' : ''} remaining
                  </span>
                </div>
              </div>
            </div>
            <Button
              onClick={() => navigate('/settings')}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-xl shadow-sm transition-all duration-200"
            >
              Upgrade Now
            </Button>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

      {/* Header */}
      <ModernHeader sidebarCollapsed={sidebarCollapsed} />

      {/* Main Content */}
      <main 
        className={`transition-all duration-300 ${
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        } ${
          trialInfo && trialInfo.isActive && userRole === 'master' ? 'mt-28' : 'mt-16'
        }`}
      >
        <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default ModernDashboardFrame;