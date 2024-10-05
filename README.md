# Stats-For-Spotify-Clone
Stats for Spotify Clone for Aggieworks Takehome Assignment

My old repository got corrupted somehow...so I switched to a new one, but if you'd want to see the prior commit history here is the old repo

<l>https://github.com/patrickhcnguyen/Stats-For-Spotify-Clone/</l>

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
  <li>Copy your client ID and client secret ID then go to the backend/Routes/auth.js</li>
  <li>In auth.js, there is a client_id and client_secret</li>
  
      const client_id = ""

      const client_secret = ""

  <li>Replace the client_id with the Spotify client ID and the client_secret with the Spotify secret client ID from your dashboard </li>
</ol>

To run:
<ol>
  <li>Open up two terminals</li>
  <li>cd into frontend/src and npm i, then npm start</li>
  <li>cd into backend and npm i, then npm run dev</li>
  <li>Click login and enjoy :)</li>
</ol>
