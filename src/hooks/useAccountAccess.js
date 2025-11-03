import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { checkAccountAccess, getUserAccountId } from '../utils/accountAccess';

/**
 * Hook to check account access and redirect if necessary
 *
 * @param {object} options
 * @param {boolean} options.redirectOnExpired - Whether to redirect to billing if access is denied (default: true)
 * @param {boolean} options.allowDemo - Whether to allow demo accounts (default: true)
 * @returns {object} { hasAccess, loading, accountData, reason }
 */
export const useAccountAccess = ({ redirectOnExpired = true, allowDemo = true } = {}) => {
  const [hasAccess, setHasAccess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accountData, setAccountData] = useState(null);
  const [reason, setReason] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const checkAccess = async () => {
      try {
        // Get current user
        const { data: authData } = await supabase.auth.getUser();
        const userId = authData?.user?.id;

        if (!userId) {
          setHasAccess(false);
          setReason('Not authenticated');
          setLoading(false);
          navigate('/signin');
          return;
        }

        // Get user's account ID
        const accountId = await getUserAccountId(userId);

        if (!accountId) {
          setHasAccess(false);
          setReason('No account found');
          setLoading(false);
          return;
        }

        // Check account access
        const result = await checkAccountAccess(accountId);

        setHasAccess(result.hasAccess);
        setAccountData(result.accountData);
        setReason(result.reason);
        setLoading(false);

        // Redirect to billing if access denied and redirect is enabled
        if (!result.hasAccess && redirectOnExpired) {
          // Don't redirect demo accounts if they're not allowed
          if (result.accountData?.account_type === 'demo' && !allowDemo) {
            return;
          }

          navigate('/billing');
        }
      } catch (error) {
        console.error('Error checking account access:', error);
        setHasAccess(false);
        setReason('Error checking access');
        setLoading(false);
      }
    };

    checkAccess();
  }, [navigate, redirectOnExpired, allowDemo]);

  return { hasAccess, loading, accountData, reason };
};

/**
 * Hook to get account type without access checking
 * Useful for showing different UI based on account type
 */
export const useAccountType = () => {
  const [accountType, setAccountType] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getAccountType = async () => {
      try {
        const { data: authData } = await supabase.auth.getUser();
        const userId = authData?.user?.id;

        if (!userId) {
          setLoading(false);
          return;
        }

        const accountId = await getUserAccountId(userId);

        if (!accountId) {
          setLoading(false);
          return;
        }

        const { data: account } = await supabase
          .from('accounts')
          .select('account_type')
          .eq('id', accountId)
          .single();

        setAccountType(account?.account_type || null);
        setLoading(false);
      } catch (error) {
        console.error('Error getting account type:', error);
        setLoading(false);
      }
    };

    getAccountType();
  }, []);

  return { accountType, loading };
};
