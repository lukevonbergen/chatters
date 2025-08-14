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
    if (initialized) return;

    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          console.log('No session found, waiting for auth state change');
          return;
        }

        const userId = session.user.id;

        // IMPORTANT: no venue_id here
        const { data: userRow, error: userFetchError } = await supabase
          .from('users')
          .select('id, role, account_id')
          .eq('id', userId)
          .single();

        if (userFetchError || !userRow) {
          console.error('User fetch error:', userFetchError);
          return;
        }

        const role = userRow.role;
        const accountId = userRow.account_id ?? null;
        setUserRole(role);

        // Admins should not load VenueContext at all; bail out
        if (role === 'admin') {
          console.log('Admin user detected – skipping VenueContext venue fetch.');
          return;
        }

        // MASTER: require account_id; otherwise fallback via staff membership
        if (role === 'master') {
          if (!accountId) {
            console.warn('Master user missing account_id – attempting staff-based fallback.');
            const { data: staffRow, error: staffErr } = await supabase
              .from('staff')
              .select('venue_id, venues!inner(id, name)')
              .eq('user_id', userId)
              .limit(1)
              .single();

            if (staffErr || !staffRow?.venues?.id) {
              console.error('No fallback venue for master without account_id.');
              setAllVenues([]);
              return;
            }

            setAllVenues([{ id: staffRow.venues.id, name: staffRow.venues.name }]);
            setVenueId(staffRow.venues.id);
            setVenueName(staffRow.venues.name);
            localStorage.setItem('chatters_currentVenueId', staffRow.venues.id);
            return;
          }

          const { data: venues, error: venueError } = await supabase
            .from('venues')
            .select('id, name')
            .eq('account_id', accountId);

          if (venueError) {
            console.error('Venue fetch error (master):', venueError);
            return;
          }

          setAllVenues(venues || []);
          const cachedId = localStorage.getItem('chatters_currentVenueId');
          const validCached = (venues || []).find(v => v.id === cachedId);
          const selected = validCached || (venues || [])[0];

          if (selected) {
            setVenueId(selected.id);
            setVenueName(selected.name);
            localStorage.setItem('chatters_currentVenueId', selected.id);
          }
          return;
        }

        // MANAGER: resolve via staff membership
        if (role === 'manager') {
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
            .eq('user_id', userId); // <- no eq on venues.account_id when it's null

          console.log('Manager staff query result:', {
            staffRows,
            staffError,
            userId,
            accountId: accountId
          });

          if (staffError) {
            console.error('Staff row error:', staffError);
            return;
          }

          if (!staffRows || staffRows.length === 0) {
            console.warn('Manager has no venue assignments in staff table');
            setAllVenues([]);
            return;
          }

          // If we know accountId, constrain client-side
          const filtered = accountId
            ? staffRows.filter(r => r.venues?.account_id === accountId)
            : staffRows;

          const userVenues = filtered
            .map(row => ({ id: row.venues?.id, name: row.venues?.name }))
            .filter(v => !!v?.id);

          const uniqueVenues = userVenues.filter(
            (venue, idx, arr) => arr.findIndex(v => v.id === venue.id) === idx
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
          return;
        }

        // UNKNOWN ROLE: conservative staff fallback
        const { data: staffRow, error: staffErr } = await supabase
          .from('staff')
          .select('venue_id, venues!inner(id, name)')
          .eq('user_id', userId)
          .limit(1)
          .single();

        if (staffErr || !staffRow?.venues?.id) {
          console.error('No venue found for this user.');
          setAllVenues([]);
          return;
        }

        setAllVenues([{ id: staffRow.venues.id, name: staffRow.venues.name }]);
        setVenueId(staffRow.venues.id);
        setVenueName(staffRow.venues.name);
        localStorage.setItem('chatters_currentVenueId', staffRow.venues.id);
      } catch (error) {
        console.error('VenueContext initialization error:', error);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session ? 'session exists' : 'no session');

        if (event === 'SIGNED_IN' && session && !initialized) {
          console.log('User signed in, initializing venue context...');
          setTimeout(() => { init(); }, 100);
        }

        if (event === 'SIGNED_OUT') {
          setVenueId('');
          setVenueName('');
          setAllVenues([]);
          setUserRole(null);
          setInitialized(false);
          setLoading(false);
        }
      }
    );

    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log('Existing session found, initializing...');
        init();
      } else {
        setLoading(false);
      }
    })();

    return () => {
      subscription.unsubscribe();
    };
  }, [initialized]);

  const setCurrentVenue = (id) => {
    const found = allVenues.find(v => v.id === id);
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
