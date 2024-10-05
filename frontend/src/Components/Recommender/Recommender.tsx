import React, { useState } from 'react';

interface RecommenderProps {
  topTracks: Array<{ uri: string }>;
}

const Recommender: React.FC<RecommenderProps> = ({ topTracks }) => {
  const [recommendedTracks, setRecommendedTracks] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(false);

  const getRecommendations = async () => {
    setLoading(true);
    try {
      console.log('Top Tracks:', topTracks); 
      const response = await fetch('http://localhost:8888/get-recommendations', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          topTracks: topTracks.map((track) => track.uri),
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
    <div className="p-4">
      <button 
        onClick={getRecommendations} 
        disabled={loading} 
        className="bg-green-500 ml-44 text-white px-4 py-2 rounded hover:bg-green-600"
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
                <a href={track.url} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">Listen</a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Recommender;
