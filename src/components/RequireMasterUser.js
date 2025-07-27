import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';

export default function RequireMasterUser({ children }) {
  const [isAllowed, setIsAllowed] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkRole = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const email = userData?.user?.email;

      if (!email) {
        navigate('/signin');
        return;
      }

      const { data: user } = await supabase
        .from('users')
        .select('role')
        .eq('email', email)
        .single();

      if (!user || user.role !== 'master') {
        navigate('/'); // or a 403 page
        return;
      }

      setIsAllowed(true);
    };

    checkRole();
  }, [navigate]);

  if (isAllowed === null) return null; // or a loading spinner

  return children;
}
