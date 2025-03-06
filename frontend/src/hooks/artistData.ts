import { useQuery } from '@tanstack/react-query';

const API_URL = 'http://localhost:8888';

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
    const { data, isLoading, error } = useQuery<{ items: Artist[] }>({
        queryKey: ['topArtists', timeRange],
        queryFn: async () => {
            const response = await fetch(`${API_URL}/top-artists?time_range=${timeRange}&limit=15`, {
                credentials: 'include'
            });
            
            if (response.status === 429) {
                const data = await response.json();
                await new Promise(resolve => 
                    setTimeout(resolve, (data.retryAfter || 30) * 1000)
                );
                throw new Error('Rate limited, retrying...');
            }

            if (!response.ok) {
                throw new Error('Failed to fetch artists');
            }
            
            return response.json();
        },
        staleTime: 1000 * 60 * 60,
        gcTime: 1000 * 60 * 60 * 2,
        retry: 2,
        retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
        refetchOnMount: false,
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