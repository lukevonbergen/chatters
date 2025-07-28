import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  BarChart,
  Settings,
  Map,
  QrCode,
  User,
} from 'lucide-react';
import { supabase } from '../utils/supabase';
import { useVenue } from '../context/VenueContext';

const DashboardFrame = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { venueName, venueId, setCurrentVenue, allVenues, userRole } = useVenue();

  const [copied, setCopied] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const email = userData?.user?.email;
      if (!email) return navigate('/signin');

      const { data: user } = await supabase
        .from('users')
        .select('email, role, account_id, venue_id, first_name, last_name')
        .eq('email', email)
        .single();
      if (!user) return navigate('/signin');

      const { data: account } = await supabase
        .from('accounts')
        .select('trial_ends_at, is_paid')
        .eq('id', user.account_id)
        .single();
      if (!account) return navigate('/signin');

      const trialExpired = !account.is_paid && new Date() > new Date(account.trial_ends_at);

      setUserInfo({
        email: user.email,
        role: user.role,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        is_paid: account.is_paid,
        trial_ends_at: account.trial_ends_at,
        trialExpired,
      });

      if (trialExpired && location.pathname !== '/settings/billing') {
        navigate('/settings/billing');
      }
    };

    fetchUserInfo();
  }, [location.pathname, navigate]);

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

  const NavLink = ({ to, children, icon: Icon }) => {
    const isActive = location.pathname === to || location.pathname.startsWith(to);
    return (
      <Link
        to={to}
        className={`flex items-center gap-2 text-sm px-3 py-2 rounded transition-all duration-200 ${
          isActive ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-600'
        }`}
      >
        {Icon && <Icon className="w-5 h-5" />}
        {children}
      </Link>
    );
  };

  if (!userInfo) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      {!userInfo.is_paid && new Date() <= new Date(userInfo.trial_ends_at) && (
        <div className="bg-yellow-100 text-yellow-800 p-3 text-sm text-center">
          You're on a free trial. You have{' '}
          {Math.ceil((new Date(userInfo.trial_ends_at) - new Date()) / (1000 * 60 * 60 * 24))} day(s) left.
          <a href="/settings/billing" className="underline ml-1">Upgrade now</a>
        </div>
      )}

      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="https://www.getchatters.com/img/Logo.svg"
              alt="Chatters Logo"
              className="h-7 w-auto cursor-pointer"
              onClick={() => navigate('/dashboard')}
            />
            {userInfo.role === 'master' && allVenues.length > 0 ? (
              <select
                value={venueId}
                onChange={(e) => setCurrentVenue(e.target.value)} // ✅ Removed setTimeout
                className="text-sm text-gray-600 border border-gray-300 rounded px-2 py-1 cursor-pointer"
              >
                {allVenues.map((v) => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            ) : (
              <span className="text-sm text-gray-500">{venueName || 'Loading venue...'}</span>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <button
                onClick={() => {
                  if (!venueId) return;
                  navigator.clipboard.writeText(venueId);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                disabled={!venueId}
                className="flex items-center text-xs text-gray-500 hover:text-gray-700 transition"
                title="Copy Venue ID"
              >
                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8l6 6v8a2 2 0 01-2 2h-2" />
                </svg>
                {copied ? 'Copied!' : 'Copy Venue ID'}
              </button>
            </div>

            <div className="relative" ref={dropdownRef}>
              <img
                src={`https://ui-avatars.com/api/?name=${userInfo.first_name || 'User'}`}
                alt="User"
                className="w-8 h-8 rounded-full border cursor-pointer"
                onClick={() => setDropdownOpen(prev => !prev)}
              />
              {dropdownOpen && (
                <div className="absolute right-0 top-10 flex flex-col bg-white border shadow-lg rounded-md min-w-[180px] z-50">
                  <div className="px-4 py-3 text-sm text-gray-700 border-b">
                    <div className="font-medium">{userInfo.first_name} {userInfo.last_name}</div>
                    <div className="text-xs text-gray-500">{userInfo.email}</div>
                  </div>
                  <Link to="/settings" className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Account Settings
                  </Link>
                  <button onClick={() => setIsLogoutModalOpen(true)} className="text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap gap-4 items-center">
          <NavLink to="/" icon={LayoutDashboard}>Overview</NavLink>
          <NavLink to="/questions" icon={MessageSquare}>Questions</NavLink>
          <NavLink to="/reports" icon={BarChart}>Reports</NavLink>
          <NavLink to="/floorplan" icon={Map}>Floor Plan</NavLink>
          <NavLink to="/templates" icon={QrCode}>QR Templates</NavLink>
          <NavLink to="/staff" icon={User}>Staff</NavLink>
          <NavLink to="/settings" icon={Settings}>Settings</NavLink>
          {userInfo.role === 'master' && (
            <NavLink to="/locations" icon={Map}>Locations</NavLink>
          )}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>

      {isLogoutModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Confirm Logout</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to sign out?</p>
            <div className="flex justify-end gap-4">
              <button onClick={() => setIsLogoutModalOpen(false)} className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600">
                Cancel
              </button>
              <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardFrame;