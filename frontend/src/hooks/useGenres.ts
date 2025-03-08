import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "../config";

interface GenreData {
    name: string;
    count: number;
}

interface ApiResponse {
    topGenres: string[];
    genreCount: Record<string, number>;
}

export const useGenres = (timeRange: string) => {
    const { data, isLoading, error } = useQuery<GenreData[]>({
        queryKey: ["genres", timeRange],
        queryFn: async () => {
            const response = await fetch(
                `${API_BASE_URL}/top-genres?time_range=${timeRange}`,
                {
                    credentials: 'include',
                }
            );


            const data: ApiResponse = await response.json();
            
            const genreData = data.topGenres
                .map(genre => ({
                    name: genre,
                    count: data.genreCount[genre] || 0,
                }))
                .filter(genre => genre.count > 0)
                .slice(0, 10);

            return genreData;
        },
        staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
        gcTime: 1000 * 60 * 30, // Cache for 30 minutes
        retry: false,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });

    return { 
        genres: data || [], 
        isLoading, 
        error: error ? (error as Error).message : null 
    };
};