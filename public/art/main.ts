// TODO: change below to .ts after migration
/// <reference path="../js/artUtil.ts" />

import {PriorityQueue} from "../js/priorityQueue";
import {PlaylistArtController} from "./playlistArtController";
import {PlaylistArtView} from "./playlistArtView";
import {Point} from "../js/point";
import {WebSocketEventManager} from "../js/webSocketEventManager";

const view = new PlaylistArtView();
const controller = new PlaylistArtController();

// Config values
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
    window.history.pushState({}, "", window.location.origin + "/art"); // TODO: make constant
};

wsManager.addHandler("setUserId", (uuid) => {
	localStorage.setItem("userId", uuid);
});

wsManager.addHandler("playlists", (playlists) => {
    playlists.forEach((e) => {
        const newOption = document.createElement("option");
        newOption.textContent = e.name;
        newOption.value = e.id;
        controller.dom_playlistSelect.appendChild(newOption);
    });
});

wsManager.addHandler("songs", (songs) => {
    for(let i = 0; i < artMap.length; i++) {
        artMap[i].fill(false);
    }
    artCtx.clearRect(0, 0, dom_artCanvas.width, dom_artCanvas.height);

    // TODO: blur images and add playlist name?
    // TODO: actually set playlist image
    // TODO: configure on page before creating (max/min size, ordered by date/random)
    // TODO: base size off frequency of album (similar to removeDuplicates but increment value)
    songs = removeDuplicates(songs);

    const priQ = new PriorityQueue();
    priQ.add(new Point(0, 0));

    addAllSongs(songs, priQ);
});

controller.dom_playlistForm.onsubmit = (e) => {
	e.preventDefault();

	// set config values
	let minSize = parseInt(controller.dom_configMinSize.value);
	let maxSize = parseInt(controller.dom_configMaxSize.value);
	if(minSize > maxSize) {
		view.dom_configError.textContent = "Min size > Max size";
		view.dom_configError.style.visibility = "visible";
		return;
	} else {
		view.dom_configError.style.visibility = "hidden";
	}
	Config.minSize = minSize;
	Config.maxSize = maxSize;
	
	view.dom_a_download.style.visibility = "hidden";

	wsManager.send("playlistChosen", { "id": controller.dom_playlistSelect.value });
};

const dom_artCanvas = document.createElement("canvas");
dom_artCanvas.width = 1280;
dom_artCanvas.height = 1280;
const artCtx = dom_artCanvas.getContext("2d");

const previewCtx = view.dom_previewCanvas.getContext("2d");

const CANVAS_SIZE = dom_artCanvas.width;
// TODO: this is used in art_util, shouldn't be able to be accessed from there
// TODO: if we only use this for collision detection, change to quadtree?
const artMap = new Array(CANVAS_SIZE);
for(let i = 0; i < artMap.length; i++) {
	artMap[i] = new Array(CANVAS_SIZE);
	artMap[i].fill(false);
}

function addAllSongs(songs: any[], priQ: PriorityQueue): void {
	let shuffledSongs = shuffle(songs);
	let running = 0; // keeps track of how many songs are still being processed
	for(let i = 0; i < shuffledSongs.length; i++) {
		const e = shuffledSongs[i];
		const imageUrl = e.track.album.images[0].url; // 640x640 image, resized later
		running++;

		// TODO: make helper function that does all this for you
		// TODO: takes in URL and callback once image is ready
		const req = new XMLHttpRequest();
		req.onreadystatechange = () => {
			if(req.readyState === 4) { // DONE
				const reader = new FileReader();
				reader.onload = () => {
					const img = new Image();
					img.onload = () => {
						if(!priQ.empty()) {
							addArt(artCtx, artMap, img, priQ);
						}
						running--;
						if(!running) { // all songs have been processed
							if(priQ.empty()) {
								drawArt(previewCtx, dom_artCanvas, 0, 0, view.dom_previewCanvas.width, 3);
								view.dom_a_download.href = dom_artCanvas.toDataURL("image/jpeg");
								view.dom_a_download.style.visibility = "visible";
							} else {
								console.log("running again...");
								addAllSongs(songs, priQ);
							}
						}
					};
					img.src = <string> reader.result;
				};
				reader.readAsDataURL(req.response);
			}
		};
		req.open("GET", imageUrl);
		req.responseType = "blob";
		req.send();
	}
}

