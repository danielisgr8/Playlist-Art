export class PlaylistArtView
{
    public dom_previewCanvas: HTMLCanvasElement;
    public dom_a_download: HTMLAnchorElement;
    public dom_configError: HTMLParagraphElement;

    constructor() {
        this.dom_previewCanvas = <HTMLCanvasElement> document.getElementById("preview");
        this.dom_a_download = <HTMLAnchorElement> document.getElementById("download");
        this.dom_configError = <HTMLParagraphElement> document.getElementById("configError");
    }
}