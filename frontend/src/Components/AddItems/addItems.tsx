import React from 'react';

const AddItems = ({ playlistId, trackUris }: { playlistId: string, trackUris: string[] }) => {
    
    const handleAddTracks = async () => {
        try {
            const response = await fetch('http://localhost:8888/add-tracks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'credentials': 'include',
                },
                body: JSON.stringify({
                    playlistId,
                    trackUris
                })
            });

            if (!response.ok) {
                throw new Error(`Failed to add tracks: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Tracks added to playlist:', data);
        } catch (error) {
            console.error('Error adding tracks:', error);
        }
    };

    return (
        <div>
            <button onClick={handleAddTracks}>Add Tracks to Playlist</button>
        </div>
    );
};

export default AddItems;
