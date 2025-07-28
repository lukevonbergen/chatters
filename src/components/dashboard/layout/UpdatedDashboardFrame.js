import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useVenue } from '../../../context/VenueContext';
import { useEffect, useState } from 'react';
import { supabase } from '../../../utils/supabase';
import { Settings } from 'lucide-react'

import { Button } from '../../../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '../../../components/ui/dropdown-menu';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '../../../components/ui/popover';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '../../../components/ui/avatar';


const navLinks = [
  { to: '/', label: 'Overview' },
  { to: '/questions', label: 'Feedback' },
  { to: '/reports', label: 'Reports' },
  { to: '/floorplan', label: 'Floor Plan' },
  { to: '/staff', label: 'Staff' },
  { to: '/settings/profile', label: 'Settings' },
];

const UpdatedDashboardFrame = ({ children }) => {
  const [switchingVenue, setSwitchingVenue] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { venueId, venueName, allVenues, setCurrentVenue, userRole } = useVenue();
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const email = userData?.user?.email;
      if (!email) return navigate('/signin');

      const { data: user } = await supabase
        .from('users')
        .select('email, role, first_name, last_name')
        .eq('email', email)
        .single();

      if (!user) return navigate('/signin');
      setUserInfo(user);
    };

    loadUser();
  }, [navigate]);

  if (!userInfo) {
    return (
      <div className="flex items-center justify-center h-screen bg-muted">
        <span className="text-muted-foreground">Loading...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Top nav */}
<header className="border-b bg-white px-6 py-4 flex items-center justify-between shadow-sm">
  {/* Left: Logo + Nav */}
  <div className="flex items-center gap-6">
    {/* Logo */}
    <img
      src="https://www.getchatters.com/img/Logo.svg"
      alt="Chatters"
      className="h-6 w-auto cursor-pointer"
      onClick={() => navigate('/')}
    />

    {/* Nav links */}
<nav className="flex gap-6">
  {[...navLinks, ...(userRole === 'master' ? [{ to: '/locations', label: 'Locations' }] : [])].map((link) => {
    const isActive = location.pathname.startsWith(link.to);

    return (
      <Link
        key={link.to}
        to={link.to}
        className={`relative text-sm transition-colors after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 after:bg-black after:transition-all after:duration-300 hover:after:w-full ${
          isActive
            ? 'font-bold text-black after:w-full'
            : 'font-normal text-muted-foreground hover:text-black'
        }`}
      >
        {link.label}
      </Link>
    );
  })}
</nav>
  </div>

  {/* Right: Venue Switcher + Avatar */}
  <div className="flex items-center gap-4">
    {userRole === 'master' && (
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
  <PopoverTrigger asChild>
    <div title={venueName}>
      <Button
        variant="outline"
        className="w-[200px] justify-between font-medium text-gray-700 border rounded-xl shadow-sm truncate whitespace-nowrap"
      >
        {switchingVenue ? (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-t-transparent border-gray-500 rounded-full animate-spin" />
            <span className="text-sm text-muted-foreground">Switching...</span>
          </div>
        ) : (
          venueName || 'Select Venue'
        )}
        <span className="ml-2 text-xs opacity-50">⌄</span>
      </Button>
    </div>
  </PopoverTrigger>

  <PopoverContent className="w-[200px] p-2 rounded-xl shadow-md">
    <div className="flex flex-col space-y-1">
      {allVenues.map((v) => (
        <Button
          key={v.id}
          variant={v.id === venueId ? 'default' : 'ghost'}
          size="sm"
          disabled={switchingVenue}
          onClick={async () => {
            if (v.id === venueId) return;
            setSwitchingVenue(true);
            await new Promise((res) => setTimeout(res, 500)); // simulate fetch
            setCurrentVenue(v.id);
            setPopoverOpen(false); // closes popover
            setSwitchingVenue(false);
          }}
          className={`w-full justify-start rounded-lg ${
            v.id === venueId ? 'bg-black text-white' : ''
          }`}
        >
          {v.name}
        </Button>
      ))}
    </div>
  </PopoverContent>
</Popover>
    )}

    {/* Avatar menu */}
<DropdownMenu>
  <DropdownMenuTrigger asChild>
  <Button
    variant="ghost"
    className="h-9 w-9 p-0 flex items-center justify-center rounded-full border border-gray-300 shadow-sm"
  >
    <Settings className="h-5 w-5 text-gray-600" />
  </Button>
</DropdownMenuTrigger>

  <DropdownMenuContent
    align="end"
    className="w-48 rounded-xl border border-gray-200 shadow-md p-1 font-medium"
  >
    <DropdownMenuItem
      onClick={() => navigate('/settings/profile')}
      className="rounded-md px-3 py-2 hover:bg-muted/50 cursor-pointer"
    >
      Account Settings
    </DropdownMenuItem>

    <DropdownMenuSeparator />

    <DropdownMenuItem
      className="rounded-md px-3 py-2 text-red-600 hover:bg-red-100 hover:text-red-700 cursor-pointer"
      onClick={async () => {
        await supabase.auth.signOut()
        navigate('/signin')
      }}
    >
      Sign Out
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
  </div>
</header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
};

export default UpdatedDashboardFrame;