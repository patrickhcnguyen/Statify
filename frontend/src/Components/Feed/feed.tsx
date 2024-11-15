import React, { useEffect, useState } from 'react';

interface Playlist {
  playlistID: string;
  name: string;
  trackURIs: string[];
  createdAt: string;
  imageBase64?: string;
  displayName?: string;
}

interface User {
  userID: string;
  displayName: string; 
  playlists: Playlist[];
}

const Feed: React.FC = () => {
  const [feedData, setFeedData] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const playlistsPerPage = 9;

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const response = await fetch('http://localhost:8888/feed', {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch feed data');
        }

        const data = await response.json();
        setFeedData(data);
      } catch (err) {
        setError('Failed to load feed');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchFeed();
  }, []);

  // Calculate pagination values
  const getAllPlaylists = () => {
    return feedData
      .flatMap(user => 
        user.playlists.map(playlist => ({
          ...playlist,
          displayName: user.displayName
        }))
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const indexOfLastPlaylist = currentPage * playlistsPerPage;
  const indexOfFirstPlaylist = indexOfLastPlaylist - playlistsPerPage;
  const currentPlaylists = getAllPlaylists().slice(indexOfFirstPlaylist, indexOfLastPlaylist);
  const totalPages = Math.ceil(getAllPlaylists().length / playlistsPerPage);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0);
  };

  if (loading) {
    return <div>Loading feed...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="feed-container p-4 max-w-7xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">User Playlists Feed</h2>
      {feedData.length === 0 ? (
        <p>No playlists available.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentPlaylists.map((playlist) => (
              <div key={playlist.playlistID} className="playlist-card bg-gray-100 p-4 rounded-lg shadow-md">
                {playlist.imageBase64 && (
                  <img
                    src={playlist.imageBase64}
                    className="w-full aspect-square object-cover mb-2 rounded"
                    alt={playlist.name}
                  />
                )}
                <h3 className="font-bold text-base sm:text-lg truncate">{playlist.name}</h3>
                <p className="text-gray-600 text-sm">Created by {playlist.displayName}</p>
                <p className="text-gray-500 text-xs mt-2">
                  Created on: {new Date(playlist.createdAt).toLocaleDateString()}
                </p>
                <a
                  href={`https://open.spotify.com/playlist/${playlist.playlistID}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline mt-4 block text-sm"
                >
                  View on Spotify
                </a>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-center mt-8 space-x-2">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded ${
                currentPage === 1 
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              Previous
            </button>
            
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => paginate(index + 1)}
                className={`px-4 py-2 rounded ${
                  currentPage === index + 1
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {index + 1}
              </button>
            ))}

            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded ${
                currentPage === totalPages 
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Feed;
