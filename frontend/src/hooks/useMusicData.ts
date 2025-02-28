/**
 * Query for grabbing music data for our top songs and artists from the time frames we want
 */

import { useQuery } from '@tanstack/react-query';

const API_URL = 'http://localhost:8888';  

type MusicDataType = 'top-tracks' | 'recently-played';

function useMusicData(type: MusicDataType = 'top-tracks', timeRange?: string) {
  const endpoint = type === 'top-tracks' 
    ? `${API_URL}/top-tracks?time_range=${timeRange || 'short_term'}`
    : `${API_URL}/recently-played`;

  const { data, isLoading, error } = useQuery({
    queryKey: type === 'top-tracks' ? [type, timeRange] : [type],
    queryFn: async () => {
      const response = await fetch(endpoint, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const jsonData = await response.json();
      const items = jsonData.items || [];

      const transformedItems = items.slice(0, 16).map((item: any) => {
        if (type === 'recently-played') {
          return {
            name: item.track.name,
            artist: item.track.artists[0].name,
            albumImageUrl: item.track.album.images[0]?.url,
            uri: item.track.uri,
          };
        }
        return {
          name: item.name,
          artist: item.artists[0].name,
          albumImageUrl: item.album.images[0]?.url,
          uri: item.uri,
        };
      });

      return transformedItems;
    },
    // cache data 
    staleTime: 5 * 60 * 1000, 
    gcTime: 30 * 60 * 1000, 
    refetchOnWindowFocus: false, 
    refetchOnMount: false
  });

  return {
    musicData: data || [],
    isLoading,
    error,
  };
}

export default useMusicData;