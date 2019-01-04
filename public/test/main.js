// config values
const Config = {
	minSize: 150,
	maxSize: 250
};

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
	runTest(playlistSelect.value);
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
// TODO: making an array this large is almost certainly avoidable
for(let i = 0; i < artMap.length; i++) {
	artMap[i] = new Array(CANVAS_SIZE);
	artMap[i].fill(false);
}

let testImageSrc;
let total = 0;
const runs = 100;
let i = 0;
function runTest(jsonFile) {
	let req = new XMLHttpRequest();
    req.onreadystatechange = () => {
        if(req.readyState === 4) { // DONE
            const reader = new FileReader();
            reader.onload = () => {
                testImageSrc = reader.result;
                let req = new XMLHttpRequest();
                req.onreadystatechange = () => {
                	if(req.readyState === 4) {
                        total = 0;
                        i = 0;
                        timeAndTest(JSON.parse(req.response));
                    }
				};
                req.open("GET", "json/" + jsonFile);
                req.send();
            };
            reader.readAsDataURL(req.response);
        }
    };
    req.open("GET", "border.png");
    req.responseType = "blob";
    req.send();
}

function timeAndTest(songs) {
    let start = Date.now();
    testSongs(songs, () => {
        i++;
        total += Date.now() - start;
        if(i < runs) {
            timeAndTest(songs);
        } else {
        	console.log(total / runs);
		}
    });
}

function testSongs(songs, callback) {
	for(let i = 0; i < artMap.length; i++) {
		artMap[i].fill(false);
	}
	art.clearRect(0, 0, artCanvas.width, artCanvas.height);

	songs = removeDuplicates(songs);

	const priQ = new PriorityQueue();
	priQ.add(new Point(0, 0));

	addAllSongs(songs, priQ, callback);
}

function addAllSongs(songs, priQ, callback) {
	let shuffledSongs = shuffle(songs);
	let running = 0; // keeps track of how many songs are still being processed
	for(let i = 0; i < shuffledSongs.length; i++) {
		running++;

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
					callback();
				} else {
					addAllSongs(songs, priQ, callback);
				}
			}
		};
		img.src = testImageSrc;
	}
}
