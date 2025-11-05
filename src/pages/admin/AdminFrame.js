// /pages/admin/AdminFrame.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { supabase } from '../../utils/supabase';

const AdminFrame = ({ children }) => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({ email: '', role: null });
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    const fetchUser = async () => {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;
      if (!user) {
        navigate('/signin', { replace: true });
        return;
      }

      const email = (user.email || '').toLowerCase();
      const { data: userRow, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!mounted) return;

      const role = userRow?.role ?? null;
      const isAdminByRole = role === 'admin';
      const isAdminByDomain = email.endsWith('@getchatters.com');

      if (!isAdminByRole && !isAdminByDomain) {
        navigate('/dashboard', { replace: true });
        return;
      }

      setUserInfo({ email, role: role || (isAdminByDomain ? 'admin' : null) });
      setLoading(false);
    };

    fetchUser();
    return () => { mounted = false; };
  }, [navigate]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/signin', { replace: true });
  };

  if (loading) {
    return <div className="p-6">Loading admin…</div>;
  }

  return (
    <div className="min-h-screen">
      {/* Main content - pages handle their own layout including logout */}
      {children}
    </div>
  );
};

export default AdminFrame;
