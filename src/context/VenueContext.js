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
          return;
        }

        const userId = session.user.id;

        // Check for impersonation
        const impersonationData = localStorage.getItem('impersonation');
        if (impersonationData) {
          const { accountId } = JSON.parse(impersonationData);

          // Load venues for impersonated account
          const { data: venues, error: venueError } = await supabase
            .from('venues')
            .select('id, name')
            .eq('account_id', accountId);

          if (!venueError && venues && venues.length > 0) {
            setUserRole('master'); // Impersonate as master
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
        }

        const { data: userRow, error: userFetchError } = await supabase
          .from('users')
          .select('id, role, account_id')
          .eq('id', userId)
          .single();

        if (userFetchError || !userRow) {
          return;
        }

        const role = userRow.role;
        const accountId = userRow.account_id ?? null;
        setUserRole(role);

        // Admins should not load VenueContext at all; bail out
        if (role === 'admin') {
          return;
        }

        // MASTER: require account_id; otherwise fallback via staff membership
        if (role === 'master') {
          if (!accountId) {
            const { data: staffRow, error: staffErr } = await supabase
              .from('staff')
              .select('venue_id, venues!inner(id, name)')
              .eq('user_id', userId)
              .limit(1)
              .single();

            if (staffErr || !staffRow?.venues?.id) {
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
            .eq('user_id', userId);

          if (staffError) {
            return;
          }

          if (!staffRows || staffRows.length === 0) {
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
          setAllVenues([]);
          return;
        }

        setAllVenues([{ id: staffRow.venues.id, name: staffRow.venues.name }]);
        setVenueId(staffRow.venues.id);
        setVenueName(staffRow.venues.name);
        localStorage.setItem('chatters_currentVenueId', staffRow.venues.id);
      } catch (error) {
        // Silent error handling
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session && !initialized) {
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