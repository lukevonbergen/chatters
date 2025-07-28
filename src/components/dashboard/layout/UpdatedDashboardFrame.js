import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useVenue } from '../../../context/VenueContext';
import { useEffect, useState } from 'react';
import { supabase } from '../../../utils/supabase';

import { Button } from '../../../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
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
    <div className="min-h-screen bg-background text-foreground">
      {/* Top nav */}
      <header className="border-b bg-white px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <img
            src="https://www.getchatters.com/img/Logo.svg"
            alt="Chatters"
            className="h-6 w-auto cursor-pointer"
            onClick={() => navigate('/')}
          />

          {/* Venue Switcher or Static */}
          {userRole === 'master' ? (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  {venueName || 'Select Venue'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48">
                <div className="flex flex-col space-y-1">
                  {allVenues.map((v) => (
                    <Button
                      key={v.id}
                      variant={v.id === venueId ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setCurrentVenue(v.id)}
                    >
                      {v.name}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          ) : (
            <span className="text-sm text-muted-foreground">{venueName}</span>
          )}

          {/* Nav links */}
          <nav className="flex gap-4">
            {[...navLinks, ...(userRole === 'master' ? [{ to: '/locations', label: 'Locations' }] : [])].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-medium transition-colors ${
                  location.pathname.startsWith(link.to)
                    ? 'text-black'
                    : 'text-muted-foreground hover:text-black'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Avatar menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="h-8 w-8 cursor-pointer border">
              <AvatarImage src={`https://ui-avatars.com/api/?name=${userInfo.first_name}`} />
              <AvatarFallback>{userInfo.first_name?.[0]}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate('/settings/profile')}>
              Account Settings
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate('/signin');
              }}
            >
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
};

export default UpdatedDashboardFrame;