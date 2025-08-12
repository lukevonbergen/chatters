import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';

const VenueContext = createContext();
export const useVenue = () => useContext(VenueContext);

export const VenueProvider = ({ children }) => {
  const [venueId, setVenueId] = useState('');
  const [venueName, setVenueName] = useState('');
  const [allVenues, setAllVenues] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Only run initialization once
    if (initialized) return;

    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log('No session found, waiting for auth state change');
          return;
        }

        const userId = session.user.id;

        const { data: userRow, error: userFetchError } = await supabase
          .from('users')
          .select('id, role, account_id')
          .eq('id', userId)
          .single();

        if (userFetchError || !userRow) {
          console.error('User fetch error:', userFetchError);
          return;
        }

        setUserRole(userRow.role);

        if (userRow.role === 'master') {
          const { data: venues, error: venueError } = await supabase
            .from('venues')
            .select('id, name')
            .eq('account_id', userRow.account_id);

          if (venueError) {
            console.error('Venue fetch error:', venueError);
            return;
          }

          setAllVenues(venues || []);

          const cachedId = localStorage.getItem('chatters_currentVenueId');
          const validCached = venues?.find((v) => v.id === cachedId);
          const selected = validCached || venues?.[0];

          if (selected) {
            setVenueId(selected.id);
            setVenueName(selected.name);
            localStorage.setItem('chatters_currentVenueId', selected.id);
          }

        } else {
          // Handle manager role - get venues they have access to
          const { data: staffRows, error: staffError } = await supabase
            .from('staff')
            .select(`
              venue_id,
              venues!inner (
                id,
                name,
                account_id
              )
            `)
            .eq('user_id', userId)
            .eq('venues.account_id', userRow.account_id);

          console.log('Manager staff query result:', { staffRows, staffError, userId, accountId: userRow.account_id });

          if (staffError) {
            console.error('Staff row error:', staffError);
            return;
          }

          if (!staffRows || staffRows.length === 0) {
            console.warn('Manager has no venue assignments in staff table');
            setAllVenues([]);
            return;
          }

          const userVenues = staffRows.map(row => ({
            id: row.venues.id,
            name: row.venues.name
          }));

          const uniqueVenues = userVenues.filter((venue, index, array) => 
            array.findIndex(v => v.id === venue.id) === index
          );

          setAllVenues(uniqueVenues);

          const cachedId = localStorage.getItem('chatters_currentVenueId');
          const validCached = uniqueVenues.find(v => v.id === cachedId);
          const selected = validCached || uniqueVenues[0];

          if (selected) {
            setVenueId(selected.id);
            setVenueName(selected.name);
            localStorage.setItem('chatters_currentVenueId', selected.id);
          }
        }
      } catch (error) {
        console.error('VenueContext initialization error:', error);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    // Add auth state change listener to handle login
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session ? 'session exists' : 'no session');
        
        if (event === 'SIGNED_IN' && session && !initialized) {
          console.log('User signed in, initializing venue context...');
          // Small delay to ensure everything is ready
          setTimeout(() => {
            init();
          }, 100);
        }
        
        if (event === 'SIGNED_OUT') {
          // Reset state on sign out
          setVenueId('');
          setVenueName('');
          setAllVenues([]);
          setUserRole(null);
          setInitialized(false);
          setLoading(false);
        }
      }
    );

    // Try to initialize if already logged in
    const checkExistingSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log('Existing session found, initializing...');
        init();
      } else {
        setLoading(false); // No session, stop loading
      }
    };

    checkExistingSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [initialized]);

  const setCurrentVenue = (id) => {
    const found = allVenues.find((v) => v.id === id);
    if (!found) return;

    console.log('[Chatters] Switching to venue:', found);
    setVenueId(found.id);
    setVenueName(found.name);
    localStorage.setItem('chatters_currentVenueId', found.id);
  };

  return (
    <VenueContext.Provider
      value={{
        venueId,
        venueName,
        allVenues,
        userRole,
        setCurrentVenue,
        loading,
      }}
    >
      {children}
    </VenueContext.Provider>
  );
};