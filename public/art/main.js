// config values
const Config = {
	minSize: 150,
	maxSize: 250
};

const ws = new WebSocket("ws://" + window.location.hostname + ":9090");

const wsEvents = {};
ws.on = (event, callback) => {
	wsEvents[event] = callback;
};

ws.onmessage = (e) => {
	const msg = JSON.parse(e.data);

	const event = wsEvents[msg.event];
	if(event) {
		event(msg.data);
	}
};

ws.onopen = (e) => {
	let event, userId;
	if((userId = localStorage.getItem("userId"))) {
		event = {
			"event": "userIdExists",
			"data": {
				"userId": userId
			}
		};
	} else {
        let callbackCode = window.location.href.match(/\?code=(.*)/)[1];
        event = {
            "event": "callbackCode",
            "data": {
                "code": callbackCode
            }
        };
    }

    ws.send(JSON.stringify(event));
    window.history.pushState({}, "", window.origin + "/art"); // TODO: make constant
};

ws.on("setUserId", (uuid) => {
	localStorage.setItem("userId", uuid);
});

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

const minSizeEl = document.getElementById("minSize");
const maxSizeEl = document.getElementById("maxSize");
const configError = document.getElementById("configError");

playlistForm.onsubmit = (e) => {
	e.preventDefault();

	// set config values
	let minSize = parseInt(minSizeEl.value);
	let maxSize = parseInt(maxSizeEl.value);
	if(minSize > maxSize) {
		configError.textContent = "Min size > Max size";
		configError.style.visibility = "visible";
		return;
	} else {
		configError.style.visibility = "hidden";
	}
	Config.minSize = minSize;
	Config.maxSize = maxSize;
	
	downloadA.style.visibility = "hidden";
	ws.send(JSON.stringify({
		"event": "playlistChosen",
		"data": {
			"id": playlistSelect.value
		}
	}));
};

const artCanvas = document.createElement("canvas");
artCanvas.width = "1280";
artCanvas.height = "1280";
const art = artCanvas.getContext("2d");
const previewCanvas = document.getElementById("preview");
const preview = previewCanvas.getContext("2d");
const downloadA = document.getElementById("download");

const CANVAS_SIZE = artCanvas.width;
const artMap = new Array(CANVAS_SIZE);
for(let i = 0; i < artMap.length; i++) {
	artMap[i] = new Array(CANVAS_SIZE);
	artMap[i].fill(false);
}

ws.on("songs", (songs) => {
	for(let i = 0; i < artMap.length; i++) {
		artMap[i].fill(false);
	}
	art.clearRect(0, 0, artCanvas.width, artCanvas.height);

	// TODO: blur images and add playlist name?
	// TODO: actually set playlist image
	// TODO: configure on page before creating (max/min size, ordered by date/random)
	// TODO: base size off frequency of album (similar to removeDuplicates but increment value)
	songs = removeDuplicates(songs);

	const priQ = new PriorityQueue();
	priQ.add(new Point(0, 0));

	addAllSongs(songs, priQ);
});

function addAllSongs(songs, priQ) {
	let shuffledSongs = shuffle(songs);
	let running = 0; // keeps track of how many songs are still being processed
	for(let i = 0; i < shuffledSongs.length; i++) {
		const e = shuffledSongs[i];
		const imageUrl = e.track.album.images[0].url; // 640x640 image, resized later
		running++;

		const req = new XMLHttpRequest();
		req.onreadystatechange = () => {
			if(req.readyState === 4) { // DONE
				const reader = new FileReader();
				reader.onload = () => {
					const img = new Image();
					img.onload = () => {
						if(!priQ.empty()) {
							addArt(img, priQ);
						}
						running--;
						if(!running) { // all songs have been processed
							if(priQ.empty()) {
								drawArt(preview, artCanvas, 0, 0, previewCanvas.width, 3);
								downloadA.href = artCanvas.toDataURL("image/jpeg");
								downloadA.style.visibility = "visible";
							} else {
								console.log("running again...")
								addAllSongs(songs, priQ);
							}
						}
					};
					img.src = reader.result;
				};
				reader.readAsDataURL(req.response);
			}
		};
		req.open("GET", imageUrl);
		req.responseType = "blob";
		req.send();
	}
}

// TODO: separate into multiple files
// TODO: e.g. create WebSocketHandler class