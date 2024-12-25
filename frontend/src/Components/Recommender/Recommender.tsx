import React, { useState } from 'react';

interface Track {
  name: string;
  artist: string;
  uri: string;
}

interface RecommenderProps {
  topTracks: Track[];
}

const Recommender: React.FC<RecommenderProps> = ({ topTracks }) => {
  const [recommendedTracks, setRecommendedTracks] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTracks, setSelectedTracks] = useState<Set<string>>(new Set());

  const toggleTrackSelection = (uri: string) => {
    const newSelection = new Set(selectedTracks);
    if (newSelection.has(uri)) {
      newSelection.delete(uri);
    } else if (newSelection.size < 5) {
      newSelection.add(uri);
    }
    setSelectedTracks(newSelection);
  };

  const getRecommendations = async () => {
    setLoading(true);
    try {
      const tracksToUse = selectedTracks.size > 0 
        ? Array.from(selectedTracks)
        : topTracks.slice(0, 5).map(track => track.uri);

      const response = await fetch('http://localhost:8888/get-recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          topTracks: tracksToUse,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setRecommendedTracks(data);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="w-[296px]">
        <h3 className="text-white font-picnic text-[2.1vw] min-text-[24px] max-text-[32px] leading-tight">
          Want some recs? Select up to 5 tracks for recommendations, otherwise I'll do it for you!
        </h3>
      </div>
      
      <button 
        onClick={getRecommendations}
        disabled={loading}
        className="w-[296px] h-[45px] rounded-[15px] bg-white/50 font-picnic text-black hover:opacity-80 transition-opacity mt-6"
      >
        {loading ? 'Loading...' : 'Get recommendations'}
      </button>

      {recommendedTracks.length > 0 && (
        <div className="mt-6 w-[296px]">
          <ul className="space-y-4">
            {recommendedTracks.map((track) => (
              <li key={track.url} className="flex items-center space-x-4 bg-white/50 p-3 rounded-[15px]">
                <img src={track.image} alt={track.name} className="w-12 h-12 rounded" />
                <div className="flex-1">
                  <h4 className="font-picnic text-black">{track.name}</h4>
                  <p className="font-picnic text-gray-600 text-sm">{track.artists}</p>
                </div>
                <a href={track.url} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">
                  Listen
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Recommender;
