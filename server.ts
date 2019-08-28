const fs = require("fs");
const https = require("https");
const url = require("url");
const express = require("express");
const app = express();
const ws = require("ws");
const uuidv4 = require("uuid/v4");
const commandLineArgs = require("command-line-args");

const optionDefinitions = [
    { name: "redirectUri", alias: "r", type: String, defaultValue: "http://localhost/art" },
	{ name: "port", alias: "p", type: Number, defaultValue: 80 },
    { name: "clientID", alias: "c", type: String, defaultValue: "f837d8ee1f684e68b896f42f3c217158"},
    { name: "secretFile", alias: "s", type: String, defaultValue: "./CLIENT_SECRET" }
];
const options = commandLineArgs(optionDefinitions);

const CLIENT_ID = options.clientID;
const REDIRECT_URI = options.redirectUri;
const HTTP_PORT = options.port;

const CSFile = fs.readFileSync(options.secretFile);
const CLIENT_SECRET = CSFile.toString("utf8", 0, CSFile.length);

// map from user id to access_token
let userMap = {};

app.get("/login", (req, res) => {
	let scopes = "user-library-read";
	let redirectURL = "https://accounts.spotify.com/authorize" +
					  "?client_id=" + CLIENT_ID +
					  "&response_type=code" +
					  "&redirect_uri=" + encodeURIComponent(REDIRECT_URI) +
					  "&scope=" + encodeURIComponent(scopes);
	res.redirect(redirectURL);
});

app.get("/art", (req, res) => {
	if(req.query.error) {
		res.send(req.query.error);
	} else {
		res.sendFile(__dirname + "/public/art");
	}
});

app.use(express.static("./public", { "extensions": ["html"] }));

const httpServer = app.listen(HTTP_PORT, () => { console.log("Server running on port " + HTTP_PORT); });

function send(ws, eventName, data) {
	ws.send(JSON.stringify({
		"event": eventName,
		"data": data
	}));
}

const wss = new ws.Server({ server: httpServer });

wss.on("connection", (ws) => {
	ws.on("message", (msg) => {
		msg = JSON.parse(msg);
		wss.emit(msg.event, ws, msg.data);
	});
});

wss.on("callbackCode", (ws, wsData) => {
	let code = wsData.code;

	const options = {
		"hostname": "accounts.spotify.com",
		"method": "POST",
		"path": "/api/token",
		"headers": {
			"Content-Type": "application/x-www-form-urlencoded"
		},
		"auth": CLIENT_ID + ":" + CLIENT_SECRET
	};

	const postReq = https.request(options, (res) => {
		let data = "";
		res.on("data", (d) => {
			data += d;
		});

		res.on("end", () => {
			const parsedData = JSON.parse(data);
			if(!parsedData.error) {
				const userUuid = uuidv4();
				userMap[userUuid] = parsedData.access_token;
				send(ws, "setUserId", userUuid);

				ws.spotify = parsedData;
				getUserId(ws, () => getAndSendPlaylists(ws));
			} else {
				console.trace(parsedData.error);
			}
		});
	});

	postReq.end("grant_type=authorization_code" +
				"&code=" + code +
				"&redirect_uri=" + encodeURIComponent(REDIRECT_URI));
});

wss.on("userIdExists", (ws, wsData) => {
	// TODO: what if token is expired?
	// TODO: redirect to "/art" if "signed in" and at "/" (probably do on client side?)
	ws.spotify = { access_token: userMap[wsData.userId] };
	getUserId(ws, () => getAndSendPlaylists(ws));
});

function getAndSendPlaylists(ws) {
    let playlists = [];
    getPlaylists(ws.spotify.access_token, ws.spotify.id, (data) => {
        playlists = playlists.concat(data.items);
    }, () => {
        send(ws, "playlists", playlists);
    });
}

function getUserId(ws, callback) {
	const options = {
		"hostname": "api.spotify.com",
		"path": "/v1/me",
		"headers": {
			"Authorization": "Bearer " + ws.spotify.access_token
		}
	};

	https.get(options, (res) => {
		let data = "";
		res.on("data", (d) => {
			data += d;
		});

		res.on("end", () => {
			const spotifyData = JSON.parse(data);
			ws.spotify.id = spotifyData.id;
			callback();
		});
	});
}

function getPlaylists(access_token, userId, callback, finalCallback) {
	getPlaylistsNext(access_token,
					 "https://api.spotify.com/v1/users/" + userId + "/playlists",
					 callback, finalCallback);
}

function getPlaylistsNext(access_token, next, callback, finalCallback) {
	const options = url.parse(next);
	options.headers = {
			"Authorization": "Bearer " + access_token
	};

	const postReq = https.request(options, (res) => {
		let data = "";
		res.on("data", (d) => {
			data += d;
		});

		res.on("end", () => {
			const parsedData = JSON.parse(data);
			callback(parsedData);

			if(parsedData.error) {
				console.trace(parsedData.error);
			} else if(parsedData.next) {
				getPlaylistsNext(access_token, parsedData.next, callback, finalCallback);
			} else {
				finalCallback();
			}
		});
	});

	postReq.end("limit=50");
}

wss.on("playlistChosen", (ws, wsData) => {
	let songs = [];
	getPlaylistSongs(ws.spotify.access_token, ws.spotify.id, wsData.id, (data) => {
		songs = songs.concat(data.items);
	}, () => {
		send(ws, "songs", songs);
	});
});

function getPlaylistSongs(access_token, userId, playlistId, callback, finalCallback): void {
	getPlaylistSongsNext(access_token,
					 "https://api.spotify.com/v1/users/" + userId + "/playlists/" + playlistId + "/tracks",
					 callback, finalCallback);
}

function getPlaylistSongsNext(access_token: string, next: string, callback: (data: any) => void,
							  finalCallback: () => void): void {
	const options = url.parse(next);
	options.headers = {
			"Authorization": "Bearer " + access_token
	};

	const postReq = https.request(options, (res) => {
		let data = "";
		res.on("data", (d) => {
			data += d;
		});

		res.on("end", () => {
			const parsedData = JSON.parse(data);
			callback(parsedData);

			if(parsedData.error) {
				console.trace(parsedData.error);
			} else if(parsedData.next) {
				getPlaylistSongsNext(access_token, parsedData.next, callback, finalCallback);
			} else {
				finalCallback();
			}
		});
	});

	postReq.end("limit=100");
}

// TODO: separate this file