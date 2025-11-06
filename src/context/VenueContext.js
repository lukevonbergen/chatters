import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase, logQuery } from '../utils/supabase';

const VenueContext = createContext();
export const useVenue = () => useContext(VenueContext);

export const VenueProvider = ({ children }) => {
  const [venueId, setVenueId] = useState('');
  const [venueName, setVenueName] = useState('');
  const [allVenues, setAllVenues] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const isInitializingRef = useRef(false);

  useEffect(() => {
    if (initialized) return;

    const init = async (forceReload = false) => {
      // Prevent concurrent initialization using ref (synchronous check)
      if (isInitializingRef.current && !forceReload) {
        console.log('%c⚠️  [PERF] Skipping duplicate VenueContext Init', 'color: #f59e0b; font-weight: bold');
        return;
      }

      isInitializingRef.current = true;
      console.log('%c⏱️  [PERF] Starting: VenueContext Init', 'color: #8b5cf6; font-weight: bold');
      const contextStartTime = performance.now();

      // If forcing reload, reset initialized flag
      if (forceReload) {
        setInitialized(false);
      }
      try {
        const sessionStartTime = performance.now();
        const { data: { session } } = await supabase.auth.getSession();
        const sessionDuration = performance.now() - sessionStartTime;
        console.log(`%c✓ [CONTEXT] getSession: ${sessionDuration.toFixed(2)}ms`, 'color: #8b5cf6; font-weight: bold');
        if (!session) {
          return;
        }

        const userId = session.user.id;

        // Check for impersonation - admins can view any account
        const impersonationData = localStorage.getItem('impersonation');
        if (impersonationData) {
          const { accountId } = JSON.parse(impersonationData);

          // Admin users can query venues directly (RLS allows admin access)
          const impersonationResult = await logQuery(
            'venues:impersonation',
            supabase
              .from('venues')
              .select('id, name')
              .eq('account_id', accountId)
              .order('name')
          );
          const venues = impersonationResult.data;
          const venueError = impersonationResult.error;

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

        const userResult = await logQuery(
          'users:fetch_role',
          supabase
            .from('users')
            .select('id, role, account_id')
            .eq('id', userId)
            .single()
        );
        const userRow = userResult.data;
        const userFetchError = userResult.error;

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
            const staffResult = await logQuery(
              'staff:master_fallback',
              supabase
                .from('staff')
                .select('venue_id, venues!inner(id, name)')
                .eq('user_id', userId)
                .limit(1)
                .single()
            );
            const staffRow = staffResult.data;
            const staffErr = staffResult.error;

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

          const venuesResult = await logQuery(
            'venues:master',
            supabase
              .from('venues')
              .select('id, name')
              .eq('account_id', accountId)
          );
          const venues = venuesResult.data;
          const venueError = venuesResult.error;

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
          const staffResult = await logQuery(
            'staff:manager',
            supabase
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
          );
          const staffRows = staffResult.data;
          const staffError = staffResult.error;

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
        const staffFallbackResult = await logQuery(
          'staff:unknown_role_fallback',
          supabase
            .from('staff')
            .select('venue_id, venues!inner(id, name)')
            .eq('user_id', userId)
            .limit(1)
            .single()
        );
        const staffRow = staffFallbackResult.data;
        const staffErr = staffFallbackResult.error;

        if (staffErr || !staffRow?.venues?.id) {
          setAllVenues([]);
          return;
        }

        setAllVenues([{ id: staffRow.venues.id, name: staffRow.venues.name }]);
        setVenueId(staffRow.venues.id);
        setVenueName(staffRow.venues.name);
        localStorage.setItem('chatters_currentVenueId', staffRow.venues.id);
      } catch (error) {
        console.error('%c❌ [PERF] VenueContext Init Failed', 'color: #ef4444; font-weight: bold', error);
      } finally {
        const totalDuration = performance.now() - contextStartTime;
        const color = totalDuration < 500 ? '#22c55e' : totalDuration < 1000 ? '#eab308' : totalDuration < 2000 ? '#f97316' : '#ef4444';
        console.log(
          `%c✓ [PERF] VenueContext Init Complete: ${totalDuration.toFixed(2)}ms`,
          `color: ${color}; font-weight: bold`
        );
        setLoading(false);
        setInitialized(true);
        isInitializingRef.current = false;
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

    // Listen for impersonation changes
    const handleImpersonationChange = () => {
      setInitialized(false);
      setLoading(true);
      init(true);
    };

    window.addEventListener('impersonationChanged', handleImpersonationChange);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('impersonationChanged', handleImpersonationChange);
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