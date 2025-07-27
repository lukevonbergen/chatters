import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';

const VenueContext = createContext();

export const useVenue = () => useContext(VenueContext);

export const VenueProvider = ({ children }) => {
  const [venueName, setVenueName] = useState('');
  const [venueId, setVenueId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVenue = async () => {
      const { data: auth, error: authError } = await supabase.auth.getUser();
      const user = auth?.user;

      if (!user) {
        console.warn('⚠️ No user signed in');
        setLoading(false);
        return;
      }

      const email = user.email;

      // Step 1: Get user record to get account_id
      const { data: userRow, error: userError } = await supabase
        .from('users')
        .select('account_id')
        .eq('email', email)
        .single();

      if (userError || !userRow?.account_id) {
        console.error('❌ Failed to fetch user/account_id:', userError);
        setLoading(false);
        return;
      }

      const accountId = userRow.account_id;

      // Step 2: Get the first venue under that account
      const { data: venueList, error: venueError } = await supabase
        .from('venues')
        .select('id, name')
        .eq('account_id', accountId)
        .order('created_at', { ascending: true })
        .limit(1);

      if (venueError) {
        console.error('❌ Error fetching venue:', venueError);
        setLoading(false);
        return;
      }

      if (!venueList || venueList.length === 0) {
        console.warn('🚫 No venue found for account');
        setLoading(false);
        return;
      }

      const venue = venueList[0];
      setVenueName(venue.name);
      setVenueId(venue.id);
      setLoading(false);
    };

    fetchVenue();
  }, []);

  return (
    <VenueContext.Provider value={{ venueName, venueId, loading }}>
      {children}
    </VenueContext.Provider>
  );
};