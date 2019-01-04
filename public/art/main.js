// config values
const Config = {
	minSize: 150,
	maxSize: 250
};

const wsManager = new WebSocketEventManager("ws://" + window.location.hostname + ":9090");

wsManager.onopen = (e) => {
    let event, data, userId;
    if((userId = localStorage.getItem("userId"))) {
    	event = "userIdExists";
    	data = { "userId": userId }; // TODO: should just be String? (requires change on server too)
    } else {
        let callbackCode = window.location.href.match(/\?code=(.*)/)[1];
        event = "callbackCode";
        data = { "code": callbackCode }; // TODO: should just be String? (requires change on server too)
    }

    wsManager.send(event, data);
    window.history.pushState({}, "", window.origin + "/art"); // TODO: make constant
};

wsManager.addHandler("setUserId", (uuid) => {
	localStorage.setItem("userId", uuid);
});

wsManager.addHandler("playlists", (playlists) => {
    playlists.forEach((e) => {
        const newOption = document.createElement("option");
        newOption.textContent = e.name;
        newOption.value = e.id;
        playlistSelect.appendChild(newOption);
    });
});

wsManager.addHandler("songs", (songs) => {
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

const playlistForm = document.getElementById("playlistForm");
const playlistSelect = document.getElementById("playlistSelect");

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

	wsManager.send("playlistChosen", { "id": playlistSelect.value });
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
								console.log("running again...");
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
