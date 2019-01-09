export class PlaylistArtController {
    public dom_playlistForm: HTMLFormElement;
    public dom_playlistSelect: HTMLSelectElement;
    public dom_configMinSize: HTMLInputElement;
    public dom_configMaxSize: HTMLInputElement;

    constructor() {
        this.dom_playlistForm = <HTMLFormElement> document.getElementById("playlistForm");
        this.dom_playlistSelect = <HTMLSelectElement> document.getElementById("playlistSelect");
        this.dom_configMinSize = <HTMLInputElement> document.getElementById("minSize");
        this.dom_configMaxSize = <HTMLInputElement> document.getElementById("maxSize");
    }
}