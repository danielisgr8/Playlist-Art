export class ArtConfig {
    public minSize: number;
    public maxSize: number;
    public canvasSize: number;

    constructor(minSize: number, maxSize: number, canvasSize: number) {
        this.minSize = minSize;
        this.maxSize = maxSize;
        this.canvasSize = canvasSize;
    }
}