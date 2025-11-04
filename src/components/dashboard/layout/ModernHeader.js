import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useVenue } from '../../../context/VenueContext';
import { supabase } from '../../../utils/supabase';
import {
  ChevronDown,
  Settings,
  LogOut,
  Building2,
  Check,
  ExternalLink,
  BarChart3,
  MessageSquare,
  Users,
  Map,
  Trophy,
  Home,
  Plus,
  Clock
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '../../ui/dropdown-menu';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '../../ui/popover';
import { Button } from '../../ui/button';

const mainMenuItems = [
  { id: 'overview', label: 'Overview', icon: Home, path: '/dashboard' },
  { id: 'feedback', label: 'Feedback', icon: MessageSquare, path: '/questions' },
  { id: 'reports', label: 'Reports', icon: BarChart3, path: '/reports' },
  { id: 'staff', label: 'Staff', icon: Users, path: '/staff' },
  { id: 'floorplan', label: 'Floor Plan', icon: Map, path: '/floorplan' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
];

const subMenuItems = {
  feedback: [
    { label: 'Manage Questions', path: '/questions' },
    { label: 'Feedback Feed', path: '/feedbackfeed' }
  ],
  staff: [
    { label: 'Manage Staff', path: '/staff' },
    { label: 'Leaderboard', path: '/staff/leaderboard' }
  ]
};

const ModernHeader = ({ sidebarCollapsed, trialInfo }) => {
  const [switchingVenue, setSwitchingVenue] = useState(false);
  const [venuePopoverOpen, setVenuePopoverOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { venueId, venueName, allVenues, setCurrentVenue, userRole } = useVenue();

  const getCurrentSection = () => {
    const currentPath = location.pathname;

    // Special handling for account settings pages
    if (currentPath.startsWith('/account/')) {
      return { id: 'account', label: 'Account Settings', icon: Settings, path: '/account' };
    }

    // Special handling for different path patterns
    if (currentPath.startsWith('/settings/')) {
      return mainMenuItems.find(item => item.id === 'settings') || mainMenuItems[0];
    }

    if (currentPath.startsWith('/feedback/') || currentPath === '/questions' || currentPath === '/feedbackfeed') {
      return mainMenuItems.find(item => item.id === 'feedback') || mainMenuItems[0];
    }

    if (currentPath.startsWith('/reports/')) {
      return mainMenuItems.find(item => item.id === 'reports') || mainMenuItems[0];
    }

    if (currentPath.startsWith('/staff/')) {
      return mainMenuItems.find(item => item.id === 'staff') || mainMenuItems[0];
    }

    // Default path-based matching
    const currentItem = mainMenuItems.find(item =>
      currentPath === item.path || currentPath.startsWith(item.path + '/')
    );
    return currentItem || mainMenuItems[0];
  };

  const getCurrentSubItems = () => {
    const currentSection = getCurrentSection();
    return subMenuItems[currentSection.id] || [];
  };

  const getSubtitleForSection = () => {
    const currentPath = location.pathname;
    const currentSection = getCurrentSection();

    // Settings subtitles
    if (currentPath.startsWith('/settings/') || currentPath.startsWith('/settings?')) {
      if (currentPath === '/settings/venues' || currentPath === '/settings?tab=Venue') return 'Venue information and settings';
      if (currentPath === '/settings/feedback' || currentPath === '/settings?tab=Feedback') return 'Feedback configuration';
      if (currentPath === '/settings/branding' || currentPath === '/settings?tab=Branding') return 'Brand colors and logo';
      if (currentPath === '/settings/integrations' || currentPath === '/settings?tab=Integrations') return 'Third-party integrations';
      if (currentPath === '/settings/billing' || currentPath === '/settings?tab=Billing') return 'Subscription and billing';
      if (currentPath === '/settings' || currentPath === '/settings?tab=Account') return 'Profile settings';
      return 'Account configuration';
    }

    // Account Settings pages (accessed via settings dropdown)
    if (currentPath === '/account/profile') {
      return 'Profile settings';
    }
    if (currentPath === '/account/billing') {
      return 'Subscription and billing';
    }

    // Feedback subtitles
    if (currentSection.id === 'feedback') {
      if (currentPath === '/questions' || currentPath === '/feedback/questions') return 'Manage feedback questions';
      if (currentPath === '/feedbackfeed') return 'Live feedback feed';
      if (currentPath === '/feedback/qr') return 'QR code configuration';
      return 'Manage customer feedback';
    }

    // Reports subtitles
    if (currentSection.id === 'reports') {
      if (currentPath === '/reports/ratings') return 'Rating trends and analysis';
      if (currentPath === '/reports/nps') return 'Net Promoter Score';
      if (currentPath === '/reports/sentiment') return 'Sentiment analysis';
      if (currentPath === '/reports/questions') return 'Question performance';
      return 'Analytics and insights';
    }

    // Staff subtitles
    if (currentSection.id === 'staff') {
      if (currentPath === '/staff/leaderboard') return 'Team performance rankings';
      if (currentPath === '/staff') return 'Team management';
      return 'Team management';
    }

    // Floor Plan subtitles
    if (currentSection.id === 'floorplan') {
      return 'Venue layout and table management';
    }

    // Overview
    if (currentSection.id === 'overview') {
      return 'Welcome to your dashboard';
    }

    return 'Welcome to your dashboard';
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleOpenKiosk = () => {
    const w = window.screen?.availWidth ?? window.innerWidth;
    const h = window.screen?.availHeight ?? window.innerHeight;
    const features = `popup=yes,toolbar=0,location=0,menubar=0,scrollbars=1,status=0,resizable=1,left=0,top=0,width=${w},height=${h}`;
    const win = window.open('/kiosk', 'kioskWindow', features);
    if (!win) return;

    try {
      win.focus();
      const tryFullscreen = () => {
        const doc = win.document;
        const el = doc?.documentElement || doc?.body;
        if (!el) return;
        const req = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen;
        req?.call(el).catch(() => {});
      };
      win.addEventListener('load', tryFullscreen);
      setTimeout(() => {
        try { tryFullscreen(); } catch {}
      }, 800);
    } catch {}
  };

  const currentSection = getCurrentSection();
  const currentSubItems = getCurrentSubItems();
  const CurrentIcon = currentSection.icon;

  return (
    <header
      className={`fixed top-0 right-0 z-30 h-16 bg-white border-b border-gray-200 transition-all duration-300 ${
        sidebarCollapsed ? 'left-16' : 'left-64'
      }`}
    >
      <div className="flex items-center justify-between h-full px-6">
        {/* Left Side - Page Title */}
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {currentSection.label}
            </h1>
            <p className="text-sm text-gray-500">
              {getSubtitleForSection()}
            </p>
          </div>
        </div>

        {/* Right Side - Venue Selector + Settings */}
        <div className="flex items-center gap-3">
          {/* Trial Info */}
          {trialInfo && trialInfo.isActive && userRole === 'master' && (
            <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
              <Clock className="w-4 h-4 text-gray-700" />
              <span className="text-sm text-gray-700">
                Trial: <span className="font-semibold">{trialInfo.daysLeft}</span> day{trialInfo.daysLeft !== 1 ? 's' : ''} left
              </span>
              <button
                onClick={() => navigate('/settings/billing')}
                className="ml-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                Upgrade
              </button>
            </div>
          )}

          {/* Kiosk Mode Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenKiosk}
            className="hidden md:flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <span>Kiosk</span>
            <ExternalLink className="w-4 h-4" />
          </Button>

          {/* Venue Selector */}
          {(userRole === 'master' || allVenues.length > 1) && (
            <Popover open={venuePopoverOpen} onOpenChange={setVenuePopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 px-3 py-2 h-10 min-w-[160px] justify-between border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  {switchingVenue ? (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 border-2 border-t-transparent border-gray-500 rounded-full animate-spin" />
                      <span className="text-sm text-gray-500">Switching...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 min-w-0">
                      <Building2 className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <span className="truncate text-sm font-medium text-gray-900">
                        {venueName || 'Select Venue'}
                      </span>
                    </div>
                  )}
                  <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                </Button>
              </PopoverTrigger>
              <PopoverContent 
                className="w-64 p-0 rounded-xl shadow-xl border border-gray-200 bg-white z-[100] relative" 
                side="bottom" 
                align="end"
                sideOffset={8}
              >
                <div className="p-3 border-b border-gray-100">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Switch Venue
                  </div>
                </div>
                <div className="p-2 max-h-64 overflow-y-auto">
                  {allVenues.map((venue) => (
                    <Button
                      key={venue.id}
                      variant="ghost"
                      disabled={switchingVenue}
                      onClick={async () => {
                        if (venue.id === venueId) {
                          setVenuePopoverOpen(false);
                          return;
                        }
                        setSwitchingVenue(true);
                        await new Promise((resolve) => setTimeout(resolve, 300));
                        setCurrentVenue(venue.id);
                        setVenuePopoverOpen(false);
                        setSwitchingVenue(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 mb-1 rounded-lg ${
                        venue.id === venueId ? 'bg-gray-100 text-gray-900' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="truncate text-sm">{venue.name}</span>
                      </div>
                      {venue.id === venueId && (
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                      )}
                    </Button>
                  ))}
                </div>
                {userRole === 'master' && (
                  <div className="p-2 border-t border-gray-100">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        navigate('/settings?tab=Venue');
                        setVenuePopoverOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
                    >
                      <Plus className="w-4 h-4" />
                      Add New Venue
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          )}

        </div>
      </div>
    </header>
  );
};

export default ModernHeader;