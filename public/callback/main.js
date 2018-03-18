const ws = new WebSocket("ws://" + window.location.hostname + ":9090");

const wsEvents = {};
ws.on = (event, callback) => {
	wsEvents[event] = callback;
}

ws.onmessage = (e) => {
	const msg = JSON.parse(e.data);

	const event = wsEvents[msg.event];
	if(event) {
		event(msg.data);
	}
}

let callbackCode = window.location.href.match(/\?code=(.*)/)[1];
let callbackEv = {
	"event": "callbackCode",
	"data": {
		"code": callbackCode
	}
}

ws.onopen = (e) => {
	ws.send(JSON.stringify(callbackEv));
}

const playlistForm = document.getElementById("playlistForm");
const playlistSelect = document.getElementById("playlistSelect");

ws.on("playlists", (playlists) => {
	playlists.forEach((e) => {
		const newOption = document.createElement("option");
		newOption.textContent = e.name;
		newOption.value = e.id;
		playlistSelect.appendChild(newOption);
	});
});

playlistForm.onsubmit = (e) => {
	e.preventDefault();
	
	ws.send(JSON.stringify({
		"event": "playlistChosen",
		"data": {
			"id": playlistSelect.value
		}
	}));
}

ws.on("songs", (songs) => {
	songs.forEach((e) => {
		console.log(e.track.name);
	});
});
