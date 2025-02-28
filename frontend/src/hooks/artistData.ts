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
        queryKey: ['topArtists', timeRange, currentIndex],
        queryFn: async () => {
            const response = await fetch(`${API_URL}/top-artists?time_range=${timeRange}&index=${currentIndex}`, {
                credentials: 'include'
            });
            if (!response.ok) {
                throw new Error('Failed to fetch artist');
            }
            return response.json();
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false
    });

    return {
        currentArtist: data?.items?.[0],
        isLoading,
        error
    };
}

export type { Artist };
export default useArtistData;