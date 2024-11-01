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
    <div className="mt-4 ml-32">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Select up to 5 tracks for recommendations:</h3>
        <p className="text-sm text-gray-600 mb-4">
          {selectedTracks.size === 0 
            ? "No tracks selected - will use top 5 tracks by default" 
            : `${selectedTracks.size} tracks selected`}
        </p>
        <div className="max-h-60 overflow-y-auto border rounded-lg p-4">
          {topTracks.map((track) => (
            <div 
              key={track.uri}
              className={`flex items-center p-2 hover:bg-gray-100 cursor-pointer rounded ${
                selectedTracks.has(track.uri) ? 'bg-blue-50' : ''
              }`}
              onClick={() => toggleTrackSelection(track.uri)}
            >
              <input
                type="checkbox"
                checked={selectedTracks.has(track.uri)}
                onChange={() => toggleTrackSelection(track.uri)}
                className="mr-3"
              />
              <div>
                <p className="font-medium">{track.name}</p>
                <p className="text-sm text-gray-600">{track.artist}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button 
        onClick={getRecommendations}
        disabled={loading}
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 w-full disabled:bg-gray-400"
      >
        {loading ? 'Loading...' : 'Get Recommendations'}
      </button>

      {recommendedTracks.length > 0 && (
        <div className="mt-4">
          <h3 className="text-xl font-bold">Recommended Tracks:</h3>
          <ul className="space-y-4">
            {recommendedTracks.map((track) => (
              <li key={track.url} className="flex items-center space-x-4 border-b pb-2">
                <img src={track.image} alt={track.name} className="w-16 h-16 rounded" />
                <div className="flex-1">
                  <h4 className="font-semibold">{track.name}</h4>
                  <p className="text-gray-600">{track.artists}</p>
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
