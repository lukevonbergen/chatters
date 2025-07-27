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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Step 1: Get account_id from users table
      const { data: userRecord, error: userError } = await supabase
        .from('users')
        .select('account_id')
        .eq('email', user.email)
        .single();

      if (!userRecord?.account_id) {
        console.warn('No account_id found for user');
        return;
      }

      // Step 2: Get the first venue for that account
      const { data: venue, error: venueError } = await supabase
        .from('venues')
        .select('id, name')
        .eq('account_id', userRecord.account_id)
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      if (venue) {
        setVenueName(venue.name);
        setVenueId(venue.id);
      } else {
        console.warn('No venue found for account');
      }

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