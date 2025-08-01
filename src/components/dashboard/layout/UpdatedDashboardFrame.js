import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useVenue } from '../../../context/VenueContext';
import { useEffect, useState } from 'react';
import { supabase } from '../../../utils/supabase';
import { Cog, Menu, X } from 'lucide-react';

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

const navLinks = [
  { to: '/', label: 'Overview' },
  { to: '/questions', label: 'Feedback' },
  { to: '/reports', label: 'Reports' },
  { to: '/floorplan', label: 'Floor Plan' },
  { to: '/staff', label: 'Staff' },
];

const UpdatedDashboardFrame = ({ children }) => {
  const [switchingVenue, setSwitchingVenue] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  if (!userInfo) {
    return (
      <div className="flex items-center justify-center h-screen bg-muted">
        <span className="text-muted-foreground">Loading...</span>
      </div>
    );
  }

  const allNavLinks = [...navLinks, ...(userRole === 'master' ? [{ to: '/locations', label: 'Locations' }] : [])];

  return (
    <div className="min-h-screen bg-background text-foreground" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Top nav */}
      <header className="border-b bg-white px-4 md:px-6 py-4 flex items-center justify-between shadow-sm relative z-50">
        {/* Left: Logo + Desktop Nav */}
        <div className="flex items-center gap-6">
          {/* Logo */}
          <img
            src="https://www.getchatters.com/img/Logo.svg"
            alt="Chatters"
            className="h-6 w-auto cursor-pointer"
            onClick={() => navigate('/')}
          />

          {/* Desktop Nav links */}
          <nav className="hidden lg:flex gap-6">
            {allNavLinks.map((link) => {
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

        {/* Right: Venue Switcher + Avatar + Mobile Menu Button */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Venue Switcher - Desktop */}
          <div className="hidden sm:block">
            {userRole === 'master' ? (
              <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                  <div title={venueName}>
                    <Button
                      variant="outline"
                      className="w-[140px] md:w-[200px] justify-between font-medium text-gray-700 border rounded-xl shadow-sm truncate whitespace-nowrap bg-white"
                    >
                      {switchingVenue ? (
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 border-2 border-t-transparent border-gray-500 rounded-full animate-spin" />
                          <span className="text-sm text-muted-foreground hidden md:inline">Switching...</span>
                        </div>
                      ) : (
                        venueName || 'Select Venue'
                      )}
                      <span className="ml-2 text-xs opacity-50">⌄</span>
                    </Button>
                  </div>
                </PopoverTrigger>

                <PopoverContent className="w-[140px] md:w-[200px] p-2 rounded-xl shadow-md bg-white">
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
                          await new Promise((res) => setTimeout(res, 500));
                          setCurrentVenue(v.id);
                          setPopoverOpen(false);
                          setSwitchingVenue(false);
                        }}
                        className={`w-full justify-start rounded-lg ${
                          v.id === venueId ? 'bg-black text-white' : ''
                        }`}
                      >
                        <span className="truncate">{v.name}</span>
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            ) : (
              <div className="text-sm font-medium text-gray-600 px-3 py-2 rounded-md border border-gray-200 bg-gray-50 max-w-[140px] md:max-w-[200px] truncate">
                {venueName}
              </div>
            )}
          </div>

          {/* Avatar menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-9 w-9 p-0 flex items-center justify-center rounded-full border border-gray-300 shadow-sm"
              >
                <Cog className="h-5 w-5 text-gray-600" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-48 rounded-xl border border-gray-200 bg-white shadow-md p-1 font-medium"
            >
              <DropdownMenuItem
                onClick={() => navigate('/settings')}
                className="rounded-md px-3 py-2 hover:bg-muted/50 cursor-pointer"
              >
                Account Settings
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                className="rounded-md px-3 py-2 text-red-600 hover:bg-red-100 hover:text-red-700 cursor-pointer"
                onClick={async () => {
                  await supabase.auth.signOut();
                  navigate('/signin');
                }}
              >
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            className="lg:hidden h-9 w-9 p-0 flex items-center justify-center"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={() => setMobileMenuOpen(false)}>
          <div 
            className="absolute right-0 top-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900">Menu</span>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Mobile venue switcher */}
            {userRole === 'master' && (
              <div className="p-4 border-b sm:hidden">
                <span className="text-sm font-medium text-gray-700 block mb-3">Switch Venue</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between font-medium text-gray-700 border rounded-xl shadow-sm bg-white"
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
                  </PopoverTrigger>

                  <PopoverContent className="w-72 p-2 rounded-xl shadow-md bg-white" side="bottom" align="start">
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
                            await new Promise((res) => setTimeout(res, 500));
                            setCurrentVenue(v.id);
                            setPopoverOpen(false);
                            setSwitchingVenue(false);
                            setMobileMenuOpen(false);
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
              </div>
            )}

            {/* Mobile navigation links */}
            <nav className="p-4">
              <div className="space-y-2">
                {allNavLinks.map((link) => {
                  const isActive = location.pathname.startsWith(link.to);

                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`block px-3 py-3 rounded-md text-base font-medium transition-colors ${
                        isActive
                          ? 'bg-black text-white'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>

              {/* Mobile settings */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <Link
                  to="/settings"
                  className="block px-3 py-3 rounded-md text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Account Settings
                </Link>
                <button
                  className="w-full text-left px-3 py-3 rounded-md text-base font-medium text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={async () => {
                    await supabase.auth.signOut();
                    navigate('/signin');
                    setMobileMenuOpen(false);
                  }}
                >
                  Sign Out
                </button>
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">{children}</main>
    </div>
  );
};

export default UpdatedDashboardFrame;