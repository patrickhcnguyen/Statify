import React, { useEffect, useState } from 'react';
import backgroundImage from '../../assets/background/background.svg';
import { Button } from '../button';

interface Playlist {
  playlistID: string;
  name: string;
  trackURIs: string[];
  createdAt: string;
  imageBase64?: string;
  displayName?: string;
  userID: string;
}

interface User {
  userID: string;
  displayName: string; 
  playlists: Playlist[];
}

const Community: React.FC = () => {
  const [feedData, setFeedData] = useState<User[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const playlistsPerPage = 9;

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('http://localhost:8888/user-profile', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setCurrentUserId(data.id);
        }
      } catch (err) {
        console.error('Error fetching current user:', err);
      }
    };

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
  
    fetchCurrentUser();
    fetchFeed();
  }, []);

  const handleDelete = async (playlistId: string, userID: string) => {
    try {
      const response = await fetch(`http://localhost:8888/feed/playlist/${playlistId}?userID=${userID}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete playlist');
      }

      setFeedData(prevData => 
        prevData.map(user => ({
          ...user,
          playlists: user.playlists.filter(playlist => playlist.playlistID !== playlistId)
        }))
      );
    } catch (error) {
      console.error('Error deleting playlist:', error);
      setError('Failed to delete playlist');
    }
  };

  // Calculate pagination values
  const getAllPlaylists = () => {
    return feedData
      .flatMap(user => 
        user.playlists.map(playlist => ({
          ...playlist,
          displayName: user.displayName,
          userID: user.userID
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
    return <div className="text-white text-2xl font-pixelify flex items-center justify-center h-screen">Loading feed...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div 
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="feed-container p-4 pt-[100px] max-w-7xl mx-auto">
        {feedData.length === 0 ? (
          <p>No playlists available.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentPlaylists.map((playlist) => (
                <div key={playlist.playlistID} className="playlist-card p-4 rounded-lg relative">
                  {currentUserId === playlist.userID && (
                    <button
                      onClick={() => handleDelete(playlist.playlistID, playlist.userID)}
                      className="absolute top-2 right-2 p-2 text-red-500 hover:text-red-700 rounded-full"
                      title="Delete playlist"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                  
                  {playlist.imageBase64 && (
                    <img
                      src={playlist.imageBase64}
                      className="w-full aspect-square object-cover mb-2"
                      alt={playlist.name}
                    />
                  )}
                  <h3 className="font-bold text-base sm:text-lg truncate font-pixelify">{playlist.name}</h3>
                  <p className="text-gray-200 text-sm font-pixelify">Created by {playlist.displayName}</p>
                  <p className="text-gray-300 text-xs mt-2 font-pixelify">
                    Created on: {new Date(playlist.createdAt).toLocaleDateString()}
                  </p>
                  <a
                    href={`https://open.spotify.com/playlist/${playlist.playlistID}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-400 hover:text-green-500 hover:underline mt-4 block text-sm font-pixelify"
                  >
                    View on Spotify
                  </a>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-center mt-8">
              <Button 
                variant="secondary" 
                className="min-w-[200px] bg-black/50 flex items-center justify-center gap-4"
              >
                <span
                  onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                  className={`cursor-pointer px-2 ${
                    currentPage === 1 ? 'text-gray-500' : 'text-white hover:text-green-400'
                  }`}
                >
                  ←
                </span>

                {[...Array(totalPages)].map((_, index) => (
                  <span
                    key={index + 1}
                    onClick={() => paginate(index + 1)}
                    className={`cursor-pointer px-2 hover:text-green-400 ${
                      currentPage === index + 1 ? 'text-green-500' : 'text-white'
                    }`}
                  >
                    {index + 1}
                  </span>
                ))}

                <span
                  onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
                  className={`cursor-pointer px-2 ${
                    currentPage === totalPages ? 'text-gray-500' : 'text-white hover:text-green-400'
                  }`}
                >
                  →
                </span>
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Community;
