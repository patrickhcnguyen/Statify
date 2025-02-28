/**
 * Query for grabbing music data for our top songs and artists from the time frames we want
 */

import { useQuery } from '@tanstack/react-query';

const API_URL = 'http://localhost:8888';  

function useMusicData(timeRange: string = 'short_term') {
  const {data: topTracks, isLoading, error} = useQuery({
    queryKey: ['topTracks', timeRange],
    queryFn: () => getTopTracks(timeRange),
    // cache data 
    staleTime: 5 * 60 * 1000, 
    gcTime: 30 * 60 * 1000, 
    refetchOnWindowFocus: false, 
    refetchOnMount: false
  })

  return {
    topTracks: topTracks?.items?.slice(0, 10),
    isLoading,
    error,
  }
}

const getTopTracks = async (timeRange: string) => {
      const response = await fetch(`${API_URL}/top-tracks?time_range=${timeRange}`, {
          credentials: 'include'
      });

      return await response.json();
}


export default useMusicData;