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

  useEffect(() => {
    const init = async () => {
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (authError || !auth?.user) {
        console.error('Supabase auth error:', authError);
        setLoading(false);
        return;
      }

      const userId = auth.user.id;

      const { data: userRow, error: userFetchError } = await supabase
        .from('users')
        .select('id, role, account_id, venue_id')
        .eq('id', userId)
        .single();

      if (userFetchError || !userRow) {
        console.error('User fetch error:', userFetchError);
        setLoading(false);
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
          setLoading(false);
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
        const { data: staffRow, error: staffError } = await supabase
          .from('staff')
          .select('venue_id, venues(name)')
          .eq('user_id', userId)
          .single();

        if (staffError || !staffRow?.venue_id) {
          console.error('Staff row error:', staffError);
          setLoading(false);
          return;
        }

        setVenueId(staffRow.venue_id);
        setVenueName(staffRow.venues?.name || '');
        setAllVenues([{ id: staffRow.venue_id, name: staffRow.venues?.name || '' }]);
      }

      setLoading(false);
    };

    init();
  }, []);

  const setCurrentVenue = (id) => {
    const found = allVenues.find((v) => v.id === id);
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
      {!loading && children}
    </VenueContext.Provider>
  );
};