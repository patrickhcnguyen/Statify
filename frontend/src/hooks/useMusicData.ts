/**
 * Query for grabbing music data for our top songs and artists from the time frames we want
 */

import { useQuery } from '@tanstack/react-query';

const API_URL = 'http://localhost:8888';  

function useMusicData(timeRange: string = 'short_term') {
  const {data: topTracks, isLoading, error} = useQuery({
    queryKey: ['topTracks', timeRange],
    queryFn: () => getTopTracks(timeRange)
  })

  const {data: topArtists} = useQuery({
    queryKey: ['topArtists', timeRange],
    queryFn: () => getTopArtists(timeRange)
  })

  return {
    topTracks: topTracks?.items?.slice(0, 2),
    isLoading,
    error,
    topArtists: topArtists?.items?.slice(0, 2)
  }
}

const getTopTracks = async (timeRange: string) => {
      const response = await fetch(`${API_URL}/top-tracks?time_range=${timeRange}`, {
          credentials: 'include'
      });

      return await response.json();
}

const getTopArtists = async (timeRange: string) => {
    try {
        const response = await fetch(`${API_URL}/top-artists?time_range=${timeRange}`, {
            credentials: 'include'
        });
        
        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Response data:', data);
        
        return data;
    } catch (error) {
        console.error('Error in getTopArtists:', error);
        throw error;
    }
};

export default useMusicData;