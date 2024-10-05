# Stats-For-Spotify-Clone
Stats for Spotify Clone for Aggieworks Takehome Assignment

# IMPORTANT

You MUST have a Spotify account (sorry Apple users)

<ol>
  <li>Login in to your Spotify account at  https://developer.spotify.com/</li>
  <li>Click the dropdown menu at the right and go to Dashboard</li>
  <li> Click Create App</li>
  <li>Name your app and put a description</li>
  <li>IMPORTANT!!!</li>
    <l> At Redirect URIs, copy and paste this link http://localhost:8888/callback
  <li>Click on Web API and agree to the terms and conditions</li>
  <li>Once your app is made, click on Settings</li>
  <li>Copy your client ID and client secret ID then go to the backend directory and create a .env file</li>
  <li>In the .env file, add your Spotify credentials, there's a .env.example file showing the variable name being used and how it's formatted</li>
  
      <l>SPOTIFY_CLIENT_ID=""</l>

      <l>SPOTIFY_CLIENT_SECRET=""</l>
</ol>

To run:
<ol>
  <li>cd into frontend/src and npm i, then npm start</li>
  <li>cd into backend and npm i, then npm run dev</li>
  <li>Click login and enjoy :)</li>
</ol>
