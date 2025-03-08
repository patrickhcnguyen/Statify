import { useQuery, useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '../config';

const API_URL = API_BASE_URL;

interface Artist {
    id: string;
    name: string;
    albumImageUrl: string;
    randomImageUrl: string;
    genres: string[];
    followers: number;
    popularity: number;
    isFollowed: boolean;
    uri: string;
    external_urls: {
        spotify: string;
    };
    topTracks: {
        name: string;
        uri: string;
    }[];
}

function useArtistData(timeRange: string = 'short_term', currentIndex: number = 0) {
    // Get the query client to potentially invalidate queries
    const queryClient = useQueryClient();
    
    const { data, isLoading, error } = useQuery<{ items: Artist[] }>({
        // Use a unique query key for each time range
        queryKey: ['topArtists', timeRange],
        queryFn: async () => {
            // Add a timestamp parameter to prevent browser caching
            const timestamp = new Date().getTime();
            const response = await fetch(`${API_BASE_URL}/top-artists?time_range=${timeRange}&limit=15&_t=${timestamp}`, {
                credentials: 'include',
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });
            
            if (response.status === 429) {
                const data = await response.json();
                await new Promise(resolve => 
                    setTimeout(resolve, (data.retryAfter || 30) * 1000)
                );
                throw new Error('Rate limited, retrying...');
            }

            if (response.status === 401) {
                // If unauthorized, invalidate all queries to force refetch after login
                queryClient.invalidateQueries();
                throw new Error('Unauthorized. Please log in again.');
            }

            if (!response.ok) {
                throw new Error('Failed to fetch artists');
            }
            
            return response.json();
        },
        staleTime: 0, // Set staleTime to 0 to always refetch when component mounts
        gcTime: 1000 * 60 * 5, // Reduce cache time to 5 minutes
        retry: 2,
        retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
        refetchOnMount: true, // Always refetch when component mounts
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });

    return {
        currentArtist: data?.items?.[currentIndex],
        allArtists: data?.items || [],
        isLoading,
        error
    };
}

export type { Artist };
export default useArtistData;