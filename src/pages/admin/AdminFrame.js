// /pages/admin/AdminFrame.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Plus, User } from 'lucide-react';
import { supabase } from '../../utils/supabase';

const AdminFrame = ({ children }) => {
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState({ email: '' });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) return navigate('/signin');
      setUserInfo({ email: data.user.email });
    };
    fetchUser();
  }, []);

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
    navigate('/signin');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-lg font-bold text-gray-800">Chatters Admin</div>

          <div className="relative" ref={dropdownRef}>
            <button onClick={() => setDropdownOpen(prev => !prev)}>
              <img
                src={`https://ui-avatars.com/api/?name=${userInfo.email}`}
                className="w-8 h-8 rounded-full border"
                alt="avatar"
              />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 top-10 bg-white border rounded shadow w-48 z-50">
                <div className="px-4 py-3 text-sm text-gray-700 border-b">
                  <div className="font-medium">{userInfo.email}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="inline-block w-4 h-4 mr-1" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex gap-4">
          <Link
            to="/admin"
            className="text-sm text-gray-700 hover:text-blue-600"
          >
            <User className="inline-block w-4 h-4 mr-1" />
            Admin Home
          </Link>
          <Link
            to="/admin/create-user"
            className="text-sm text-gray-700 hover:text-blue-600"
          >
            <Plus className="inline-block w-4 h-4 mr-1" />
            Create User
          </Link>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
};

export default AdminFrame;
