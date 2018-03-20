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

const artCanvas = document.getElementById("art");
const art = artCanvas.getContext("2d");

ws.on("songs", (songs) => {
	art.clearRect(0, 0, artCanvas.width, artCanvas.height);

	// TODO: center last line if it won't get filled
	// TODO: get rid of repeat album art (compare hashed image url's?)
	// TODO: blur images and add playlist name?
	// TODO: shuffle images
	// TODO: actually set playlist image
	let count = 0;
	songs.forEach((e) => {
		const thisCount = count++; // keeps track of order since requests are done asynchronously
		// TODO: have change based off size of playlist
		const imageUrl = e.track.album.images[2].url; // 64x64 image
		const req = new XMLHttpRequest();
		req.onreadystatechange = () => {
			if(req.readyState == 4) { // DONE
				const reader = new FileReader();
				reader.onload = () => {
					const img = new Image();
					img.onload = () => {
						// TODO: will need to change these numbers in the future
						const yCoord = Math.floor(thisCount / 10) * 64;
						const xCoord = (thisCount % 10) * 64;
						art.drawImage(img, xCoord, yCoord);
					}
					img.src = reader.result;
				}
				reader.readAsDataURL(req.response);
			}
		}
		req.open("GET", imageUrl);
		req.responseType = "blob";
		req.send();
	});
});
