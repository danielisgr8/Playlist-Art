![](https://i.imgur.com/taudJcz.jpg)

# Playlist-Art

Playlist Art creates art for your Spotify playlists. Upon selecting a playlist, album art from each song in the playlist will be combined into a "collage" the user can download and use. Currently, album art will be given a random size and placed into a random part of the final image. The user can customize minimum and maximum art sizes. I am currently working on more ways to combine the art.

# Running the server
`server.ts` hosts an HTTP and WebSocket server for the client to connect to. It also handles communicating with the Spotify API. To use the Spotify API, a client secret from your Spotify application is used. This is done by reading from a file named `CLIENT_SECRET` in this repository's directory. Create this file and paste in your client secret.

Use `node server` or `npm run start` to run the server.
