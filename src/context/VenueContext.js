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
      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;
      if (!user) return;

      const { data: userRow } = await supabase
        .from('users')
        .select('id, role, account_id')
        .eq('id', user.id)
        .single();

      if (!userRow) return;

      setUserRole(userRow.role);

      if (userRow.role === 'master') {
        // Fetch all venues under this account
        const { data: venues } = await supabase
          .from('venues')
          .select('id, name')
          .eq('account_id', userRow.account_id)
          .order('created_at', { ascending: true });

        setAllVenues(venues || []);

        const cachedId = localStorage.getItem('chatters_currentVenueId');
        const validCached = venues?.find((v) => v.id === cachedId);

        const selected = validCached ? validCached : venues?.[0];
        if (selected) {
          setVenueId(selected.id);
          setVenueName(selected.name);
          localStorage.setItem('chatters_currentVenueId', selected.id);
        }
      } else {
        // Manager/staff access: fetch venue from staff
        const { data: staff } = await supabase
          .from('staff')
          .select('venue_id, venues(name)')
          .eq('user_id', user.id)
          .single();

        if (staff?.venue_id) {
          setVenueId(staff.venue_id);
          setVenueName(staff.venues?.name || '');
        }
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