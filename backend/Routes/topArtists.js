/**
 * Spotify Top Artists API Routes
 * 
 * This module provides endpoints for retrieving a user's top artists from Spotify
 * and related artist recommendations.
 * 
 * Routes:
 * - GET /top-artists: Retrieves user's top artists with pagination and time range filtering
 * - GET /artist-recommendations/:artistId: Gets track recommendations for a specific artist
 * 
 * Features:
 * - Response caching to reduce API calls
 * - Rate limit handling with automatic retries
 * - Batch processing to avoid Spotify API rate limits
 * - Enriched artist data including follow status and top tracks
 */

const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config();
const NodeCache = require('node-cache');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const cache = new NodeCache();

router.get('/top-artists', async function(req, res) {
    const accessToken = req.cookies.access_token;
    if (!accessToken) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const timeRange = req.query.time_range || 'short_term';
    const offset = parseInt(req.query.offset) || 0;
    const limit = parseInt(req.query.limit) || 15; 
    
    // Add caching
    const cacheKey = `top-artists-${timeRange}-${offset}-${limit}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
        return res.json(cachedData);
    }
    
    console.log(`\n=== Starting API Calls for ${limit} artists ===`);

    try {
        const { default: fetch } = await import('node-fetch');
        
        // 1. Get basic artist info with pagination
        console.log(`1. Fetching top ${limit} artists...`);
        const artistsResponse = await fetch('https://api.spotify.com/v1/me/top/artists?' + new URLSearchParams({
            limit: limit.toString(),
            offset: offset.toString(),
            time_range: timeRange
        }), {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        if (artistsResponse.status === 429) {
            console.log('❌ Rate limited on top artists call');
            const retryAfter = artistsResponse.headers.get('retry-after');
            return res.status(429).json({ error: 'Rate limited', retryAfter: parseInt(retryAfter) || 30 });
        }

        const artistsData = await artistsResponse.json();
        if (!artistsData.items?.length) {
            console.log('❌ No artists found');
            return res.status(404).json({ error: 'No artists found' });
        }

        // Process artists in batches to avoid rate limits
        const batchSize = 5; // Process 3 artists at a time
        const enrichedArtists = [];
        
        for (let i = 0; i < artistsData.items.length; i += batchSize) {
            const batch = artistsData.items.slice(i, i + batchSize);
            
            // Process batch in parallel
            const batchPromises = batch.map(async (artist) => {
                try {
                    const artistId = artist.id;
                    
                    // Make these calls in parallel
                    const [followCheckResponse, topTracksResponse, albumsResponse] = await Promise.all([
                        fetch(`https://api.spotify.com/v1/me/following/contains?type=artist&ids=${artistId}`, 
                            { headers: { 'Authorization': `Bearer ${accessToken}` } }),
                        fetch(`https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US&limit=3`,
                            { headers: { 'Authorization': `Bearer ${accessToken}` } }),
                        fetch(`https://api.spotify.com/v1/artists/${artistId}/albums?limit=20&market=US`,
                            { headers: { 'Authorization': `Bearer ${accessToken}` } })
                    ]);
                    
                    if (followCheckResponse.status === 429) {
                        console.log('❌ Rate limited on follow check call');
                        const retryAfter = followCheckResponse.headers.get('retry-after');
                        console.log(`Waiting ${retryAfter || 30}s before retrying...`);
                        await delay((parseInt(retryAfter) || 30) * 1000);
                        return null;
                    }

                    const [isFollowed] = await followCheckResponse.json();
                    const topTracksData = await topTracksResponse.json();
                    const topTracks = (topTracksData.tracks || [])
                        .slice(0, 3)
                        .map(track => ({
                            name: track.name,
                            uri: track.uri
                        }));

                    const albumsData = await albumsResponse.json();
                    const randomAlbum = albumsData.items[Math.floor(Math.random() * albumsData.items.length)];

                    return {
                        id: artist.id,
                        name: artist.name,
                        genres: artist.genres,
                        followers: artist.followers.total,
                        albumImageUrl: artist.images[0]?.url,
                        randomImageUrl: randomAlbum?.images[0]?.url || artist.images[0]?.url,
                        isFollowed,
                        topTracks,
                        uri: artist.uri,
                        external_urls: artist.external_urls
                    };
                } catch (error) {
                    console.error(`Error processing artist ${artist.name}:`, error);
                    return null;
                }
            });

            const batchResults = (await Promise.all(batchPromises)).filter(Boolean);
            enrichedArtists.push(...batchResults);
            
            // Add a small delay between batches to avoid rate limits
            if (i + batchSize < artistsData.items.length) {
                await delay(500);
            }
        }

        // console.log(`=== Completed API Calls for ${enrichedArtists.length} artists ===\n`);
        
        // Store in cache before sending response - increase cache time to 1 hour
        cache.set(cacheKey, { items: enrichedArtists }, 3600); 
        res.json({ items: enrichedArtists });
    } catch (error) {
        console.error('Error fetching artist data:', error);
        res.status(500).json({ error: 'Failed to fetch artist data' });
    }
});

router.get('/artist-recommendations/:artistId', async function(req, res) {
    const accessToken = req.cookies.access_token;
    const { artistId } = req.params;

    if (!accessToken) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const { default: fetch } = await import('node-fetch');
        
        // Get artist name first
        const artistResponse = await fetch(
            `https://api.spotify.com/v1/artists/${artistId}`,
            { headers: { 'Authorization': `Bearer ${accessToken}` } }
        );
        const artistData = await artistResponse.json();

        // Get recommendations using search
        const searchResponse = await fetch(
            `https://api.spotify.com/v1/search?q=artist:"${encodeURIComponent(artistData.name)}"&type=track&market=US&limit=50`,
            { headers: { 'Authorization': `Bearer ${accessToken}` } }
        );
        const searchData = await searchResponse.json();

        let recommendedTracks = [];
        if (searchData?.tracks?.items) {
            recommendedTracks = searchData.tracks.items
                .filter(track => track.artists.some(a => a.id === artistId))
                .sort(() => Math.random() - 0.5)
                .slice(0, 3)
                .map(track => ({
                    name: track.name,
                    uri: track.uri
                }));
        }

        res.json(recommendedTracks);
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        res.status(500).json({ error: 'Failed to fetch recommendations' });
    }
});

module.exports = router;
