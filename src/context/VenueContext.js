import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';

const VenueContext = createContext();
export const useVenue = () => useContext(VenueContext);

export const VenueProvider = ({ children }) => {
  const [venueId, setVenueId] = useState('');
  const [venueName, setVenueName] = useState('');
  const [allVenues, setAllVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
  const init = async () => {
    const { data: auth, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error('Auth error:', authError);
      return;
    }

    const user = auth?.user;
    if (!user) return;

    const { data: userRow, error: userFetchError } = await supabase
      .from('users')
      .select('id, role, account_id')
      .eq('id', user.id)
      .single();

    if (userFetchError || !userRow) {
      console.error('User fetch error:', userFetchError);
      return;
    }

    setUserRole(userRow.role);

    if (userRow.role === 'master') {
      if (!userRow.account_id) {
        console.warn('No account_id found for master user');
        return;
      }

      const { data: venues, error: venueError } = await supabase
        .from('venues')
        .select('id, name')
        .eq('account_id', userRow.account_id)

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
      const { data: staff, error: staffError } = await supabase
        .from('staff')
        .select('venue_id, venues(name)')
        .eq('user_id', user.id)
        .single();

      if (staffError || !staff?.venue_id) {
        console.error('Staff fetch error or missing venue:', staffError);
        return;
      }

      setVenueId(staff.venue_id);
      setVenueName(staff.venues?.name || '');
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
        loading,
        allVenues,
        userRole,
        setCurrentVenue,
      }}
    >
      {children}
    </VenueContext.Provider>
  );
};