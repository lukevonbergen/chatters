import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useVenue } from '../../../context/VenueContext';
import { supabase } from '../../../utils/supabase';
import { isDevSite } from '../../../utils/domainUtils';
import ImpersonationBanner from '../../../components/ImpersonationBanner';
import {
  BarChart3,
  MessageSquare,
  Users,
  Map,
  Trophy,
  Settings,
  Menu,
  X,
  ChevronRight,
  Home,
  HelpCircle,
  Rss,
  UserPlus,
  CreditCard,
  Building2,
  FileText,
  QrCode,
  Table,
  LogOut,
  User,
  TrendingUp,
  Zap,
  Target,
  PieChart,
  Activity,
  Palette,
  UserCheck,
  Star,
  Award,
  MessageCircle,
  List
} from 'lucide-react';

const navItems = [
  { 
    id: 'overview', 
    label: 'Overview', 
    icon: Home, 
    path: '/dashboard', 
    color: 'text-blue-600' 
  },
  { 
    id: 'feedback', 
    label: 'Feedback', 
    icon: MessageSquare, 
    path: '/feedback/qr',
    color: 'text-green-600',
    subItems: [
      { label: 'QR Code & Sharing', path: '/feedback/qr', icon: QrCode },
      { label: 'Question Management', path: '/feedback/questions', icon: HelpCircle },
      { label: 'All Feedback', path: '/feedback/all', icon: List }
    ]
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: BarChart3,
    path: '/reports/feedback',
    color: 'text-purple-600',
    subItems: [
      { label: 'Feedback', path: '/reports/feedback', icon: MessageSquare },
      { label: 'Performance', path: '/reports/performance', icon: TrendingUp },
      { label: 'Impact', path: '/reports/impact', icon: Target },
      { label: 'Insights', path: '/reports/insights', icon: Zap },
      { label: 'Metrics', path: '/reports/metrics', icon: PieChart },
      { label: 'NPS', path: '/reports/nps', icon: Star },
      { label: 'Builder', path: '/reports/builder', icon: FileText }
    ]
  },
  {
    id: 'reviews',
    label: 'Reviews',
    icon: MessageCircle,
    path: '/reviews',
    color: 'text-yellow-600',
    badge: 'BETA'
  },
  {
    id: 'staff',
    label: 'Staff',
    icon: Users,
    path: '/staff/leaderboard',
    color: 'text-orange-600',
    subItems: [
      { label: 'Leaderboard', path: '/staff/leaderboard', icon: Trophy },
      { label: 'Recognition History', path: '/staff/recognition', icon: Award },
      { label: 'Managers', path: '/staff/managers', icon: UserCheck },
      { label: 'Employees', path: '/staff/employees', icon: Users },
      { label: 'Roles', path: '/staff/roles', icon: UserPlus, badge: 'BETA' },
      { label: 'Locations', path: '/staff/locations', icon: Building2, badge: 'BETA' }
    ]
  },
  { 
    id: 'floorplan', 
    label: 'Floor Plan', 
    icon: Map, 
    path: '/floorplan', 
    color: 'text-indigo-600' 
  },
  { 
    id: 'settings', 
    label: 'Settings', 
    icon: Settings, 
    path: '/settings/venues', 
    color: 'text-gray-600',
    subItems: [
      { label: 'Venues', path: '/settings/venues', icon: Building2 },
      { label: 'Feedback Settings', path: '/settings/feedback', icon: MessageSquare },
      { label: 'Branding', path: '/settings/branding', icon: Palette },
      { label: 'Integrations', path: '/settings/integrations', icon: Activity }
    ]
  }
];

// Account settings items for bottom section
const getAccountItems = (userRole, trialInfo) => {
  const items = [
    { label: 'Profile', path: '/account/profile', icon: User }
  ];
  
  // Show billing for master users OR if trial is expired (special billing access)
  if (userRole === 'master' || trialInfo?.isExpired) {
    items.push({ label: 'Billing', path: '/account/billing', icon: CreditCard });
  }
  
  return items;
};

const Sidebar = ({ collapsed, setCollapsed }) => {
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const [trialInfo, setTrialInfo] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { userRole } = useVenue();
  
  // Get account items based on user role and trial status
  const accountItems = getAccountItems(userRole, trialInfo);

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const hasActiveSubitem = (subItems) => {
    return subItems?.some(subItem => isActive(subItem.path));
  };

  // Fetch trial information for billing access control
  React.useEffect(() => {
    const fetchTrialInfo = async () => {
      if (userRole !== 'master' && userRole !== 'manager') return;
      
      try {
        const { data: authData } = await supabase.auth.getUser();
        const userId = authData?.user?.id;
        if (!userId) return;

        // Get user account info
        const { data: userRow } = await supabase
          .from('users')
          .select('account_id, role')
          .eq('id', userId)
          .single();

        if (!userRow) return;

        // For managers, get account_id through their venue
        let accountIdToCheck = userRow.account_id;
        if (userRow.role === 'manager' && !accountIdToCheck) {
          const { data: staffRow } = await supabase
            .from('staff')
            .select('venues!inner(account_id)')
            .eq('user_id', userId)
            .limit(1)
            .single();
            
          accountIdToCheck = staffRow?.venues?.account_id;
        }

        if (!accountIdToCheck) return;

        // Fetch account trial/subscription info
        const { data: accountData } = await supabase
          .from('accounts')
          .select('trial_ends_at, is_paid')
          .eq('id', accountIdToCheck)
          .single();

        if (accountData) {
          const trialEndsAt = accountData.trial_ends_at ? new Date(accountData.trial_ends_at) : null;
          const now = new Date();
          const isExpired = trialEndsAt && now > trialEndsAt && !accountData.is_paid;
          const isActive = trialEndsAt && now <= trialEndsAt && !accountData.is_paid;
          
          setTrialInfo({
            isExpired,
            isActive,
            trialEndsAt
          });
        }
      } catch (error) {
        console.error('Error fetching trial info:', error);
      }
    };

    fetchTrialInfo();
  }, [userRole]);

  // Auto-open submenu based on current route
  React.useEffect(() => {
    const currentItem = navItems.find(item => 
      item.subItems && item.subItems.some(subItem => isActive(subItem.path))
    );
    if (currentItem && !collapsed) {
      setActiveSubmenu(currentItem.id);
    }
  }, [location.pathname, collapsed]);

  const toggleSubmenu = (itemId) => {
    if (collapsed) {
      setCollapsed(false);
      setActiveSubmenu(itemId);
    } else {
      setActiveSubmenu(activeSubmenu === itemId ? null : itemId);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('chatters_remember_email');
    localStorage.removeItem('chatters_remember_me');
    localStorage.removeItem('impersonation');
    localStorage.removeItem('chatters_currentVenueId');
    sessionStorage.removeItem('chatters_temp_session');
    navigate('/signin');
  };

  return (
    <>
      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 z-40 h-screen bg-white border-r border-gray-200 transition-all duration-300 flex flex-col ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {!collapsed && (
            <div className="flex flex-col gap-1">
              <img
                src={isDevSite() ? "/img/CTS_DEV_LOGO.svg" : "https://www.getchatters.com/img/Logo.svg"}
                alt="Chatters"
                className="h-6 w-auto"
              />
              <ImpersonationBanner />
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {collapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="mt-4 px-2 flex-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const itemActive = isActive(item.path) || hasActiveSubitem(item.subItems);
            const showSubmenu = !collapsed && activeSubmenu === item.id && item.subItems;

            return (
              <div key={item.id} className="mb-1">
                {/* Main Nav Item */}
                {item.subItems ? (
                  <button
                    onClick={() => toggleSubmenu(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 group ${
                      itemActive
                        ? 'bg-gray-100 text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center">
                      <Icon className={`w-5 h-5 ${itemActive ? item.color : 'text-gray-400 group-hover:text-gray-600'}`} />
                      {!collapsed && (
                        <span className="ml-3 font-medium text-sm">{item.label}</span>
                      )}
                    </div>
                    {!collapsed && item.subItems && (
                      <ChevronRight 
                        className={`w-4 h-4 transition-transform duration-200 ${
                          showSubmenu ? 'rotate-90' : ''
                        }`} 
                      />
                    )}
                  </button>
                ) : (
                  <Link
                    to={item.path}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 group ${
                      itemActive
                        ? 'bg-gray-100 text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    title={collapsed ? item.label : ''}
                  >
                    <div className="flex items-center">
                      <Icon className={`w-5 h-5 ${itemActive ? item.color : 'text-gray-400 group-hover:text-gray-600'}`} />
                      {!collapsed && (
                        <span className="ml-3 font-medium text-sm">{item.label}</span>
                      )}
                    </div>
                    {!collapsed && item.badge && (
                      <span className="px-1.5 py-0.5 text-[10px] font-semibold text-blue-700 bg-blue-100 rounded uppercase tracking-wide">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )}

                {/* Submenu Items */}
                {showSubmenu && (
                  <div className="ml-2 mt-1 space-y-1 border-l-2 border-gray-100 pl-4">
                    {item.subItems.map((subItem) => {
                      const SubIcon = subItem.icon;
                      return (
                        <Link
                          key={subItem.path}
                          to={subItem.path}
                          className={`flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors group ${
                            isActive(subItem.path)
                              ? 'bg-blue-50 text-blue-700 font-medium'
                              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                          }`}
                        >
                          <div className="flex items-center">
                            <SubIcon className="w-4 h-4 mr-2" />
                            {subItem.label}
                          </div>
                          {subItem.badge && (
                            <span className="px-1.5 py-0.5 text-[10px] font-semibold text-blue-700 bg-blue-100 rounded uppercase tracking-wide">
                              {subItem.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Account Actions - Bottom of Sidebar */}
        <div className="mt-auto p-2 border-t border-gray-200">
          {/* Account Settings Section */}
          {!collapsed && (
            <div className="mb-2">
              <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Account Settings
              </p>
              <div className="space-y-1">
                {accountItems.map((item) => {
                  const ItemIcon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors group ${
                        isActive(item.path)
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                      }`}
                    >
                      <ItemIcon className="w-4 h-4 mr-2" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Collapsed Account Links */}
          {collapsed && (
            <div className="space-y-1 mb-2">
              {accountItems.map((item) => {
                const ItemIcon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 group ${
                      isActive(item.path)
                        ? 'bg-gray-100 text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    title={item.label}
                  >
                    <ItemIcon className={`w-5 h-5 ${isActive(item.path) ? 'text-gray-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                  </Link>
                );
              })}
            </div>
          )}

          {/* Sign Out */}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center px-3 py-2 rounded-lg transition-all duration-200 group text-red-600 hover:bg-red-50"
            title={collapsed ? 'Sign Out' : ''}
          >
            <LogOut className="w-5 h-5 text-red-500" />
            {!collapsed && (
              <span className="ml-3 font-medium text-sm">Sign Out</span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {!collapsed && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}
    </>
  );
};

export default Sidebar;