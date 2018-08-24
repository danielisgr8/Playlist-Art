class Point {
	constructor(y, x) {
		this.y = y;
		this.x = x;
	}

	compare(p) {
		if(this.y > p.y) {
			return 1;
		} else if(this.y == p.y) {
			return 0;
		} else {
			return -1;
		}
	}

	toString() {
		return `(${this.y}, ${this.x})`;
	}
}

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

let callbackCode = window.location.href.match(/\?code=(.*)/)[1];
let callbackEv = {
	"event": "callbackCode",
	"data": {
		"code": callbackCode
	}
};

ws.onopen = (e) => {
	ws.send(JSON.stringify(callbackEv));
};

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

function removeDuplicates(arr) {
	const res = [];
	const urls = {};
	for(let i = 0; i < arr.length; i++) {
		const e = arr[i];
		const imageUrl = e.track.album.images[0].url;
		if(!urls[imageUrl]) {
			res.push(e);
			urls[imageUrl] = 1;
		}
	}
	return res;
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
			if(req.readyState == 4) { // DONE
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

function shuffle(arr) {
	const res = [];
	const arrCopy = arr.slice();
	while(arrCopy.length != 0) {
		const randI = Math.floor(Math.random() * arrCopy.length);
		res.push(arrCopy[randI]);
		arrCopy.splice(randI, 1);
	}
	return res;
}

function addArt(img, priQ) {
	console.log(priQ.toString());
	const nextStart = priQ.popMin();

	const maxWidth = distToNextWall(nextStart);
	let width = Math.floor(Math.random() * (Config.maxSize - Config.minSize) + 1) + Config.minSize; // minSize to maxSize (inclusive)
	if((width > maxWidth) || (maxWidth - width < Config.minSize)) { // if width would be too large or wouldn't leave enough room until next wall, use maxWidth
		width = maxWidth;
	}
	if(nextStart.y + width - 1 >= CANVAS_SIZE) { // would extend past the bottom of the canvas
		width = CANVAS_SIZE - nextStart.y;
	}

	const neighborY = tallestY(nextStart.x + width);
	if(!outOfBounds(neighborY + 1, nextStart.x + width) &&
	   (neighborY < nextStart.y ||
	   (neighborY >= nextStart.y && nextStart.y + width - 1 > neighborY))) {
		priQ.add(new Point(neighborY + 1, nextStart.x + width)); // add point above where square to the right was passed
	}
	if(!outOfBounds(nextStart.y + width, nextStart.x) &&
	   (outOfBounds(nextStart.y + width, nextStart.x - 1) || artMap[nextStart.y + width][nextStart.x - 1])) {
		priQ.add(new Point(nextStart.y + width, nextStart.x)); // if wall to left of top of new square, add point
	}

	for(let i = nextStart.y; i < nextStart.y + width; i++) {
		for(let j = nextStart.x; j < nextStart.x + width; j++) {
			artMap[i][j] = true;
		}
	}

	drawArt(art, img, nextStart.x, nextStart.y, width, 3);
}

function distToNextWall(p) {
	let count = 0;
	while(!outOfBounds(p.y, p.x + count) && !artMap[p.y][p.x + count]) {
		count++;
	}
	return count;
}

// returns the tallest point at the given x coordinate
function tallestY(x) {
	let y = 0;
	while(y < artMap.length && artMap[y][x]) {
		y++;
	}
	return y - 1; // went one past last point
}

function outOfBounds(y, x) {
	return (y < 0 || y >= CANVAS_SIZE ||
			x < 0 || x >= CANVAS_SIZE);
}

// draws the image through steps number of iterations to avoid ugly scaling
function drawArt(ctx, img, x, y, size, steps) {
    const multi = Math.pow(size / img.width, 1 / steps);
    const imgCanvas = document.createElement("canvas");
    imgCanvas.width = img.width * multi;
    imgCanvas.height = img.height * multi;

    const iCCtx = imgCanvas.getContext("2d");
    let thisSize = img.width * multi;
    let oldSize = thisSize;
    iCCtx.drawImage(img, 0, 0, thisSize, thisSize);
    for(let i = 1; i < steps; i++) {
        thisSize *= multi;
        iCCtx.drawImage(imgCanvas, 0, 0, oldSize, oldSize, 0, 0, thisSize, thisSize);
        oldSize = thisSize;
    }
    ctx.drawImage(imgCanvas, 0, 0, thisSize, thisSize, x, y, thisSize, thisSize);
}
