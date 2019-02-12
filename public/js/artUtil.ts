import {Point} from "./geometry/point";
import {PriorityQueue} from "./priorityQueue";
import {ArtConfig} from "./artConfig";

export class ArtUtil {
    public static removeDuplicates(arr: any[]): any[] {
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

    public static shuffle(arr: any[]): any[] {
        const res = [];
        const arrCopy = arr.slice();
        while(arrCopy.length !== 0) {
            const randI = Math.floor(Math.random() * arrCopy.length);
            res.push(arrCopy[randI]);
            arrCopy.splice(randI, 1);
        }
        return res;
    }

    // TODO: have this do less, probably just return Point this image should be placed at
    // TODO: shouldn't take in nearly as many parameters
    public static addArt(artCtx: CanvasRenderingContext2D, artMap: boolean[][], img: HTMLImageElement,
                         priQ: PriorityQueue<Point>, artConfig: ArtConfig): void {
        const nextStart = priQ.popMin();

        const maxWidth = this.distToNextWall(nextStart, artMap, artConfig.canvasSize, artConfig.canvasSize);
        let width = Math.floor(Math.random() * (artConfig.maxSize - artConfig.minSize) + 1) + artConfig.minSize; // minSize to maxSize (inclusive)
        if((width > maxWidth) || (maxWidth - width < artConfig.minSize)) { // if width would be too large or wouldn't leave enough room until next wall, use maxWidth
            width = maxWidth;
        }
        if(nextStart.y + width - 1 >= artConfig.canvasSize) { // would extend past the bottom of the canvas
            width = artConfig.canvasSize - nextStart.y;
        }

        const neighborY = this.tallestY(nextStart.x + width, artMap);
        if(!this.outOfBounds(neighborY + 1, nextStart.x + width, artConfig.canvasSize, artConfig.canvasSize) &&
            (neighborY < nextStart.y ||
                (neighborY >= nextStart.y && nextStart.y + width - 1 > neighborY))) {
            priQ.add(new Point(neighborY + 1, nextStart.x + width)); // add point above where square to the right was passed
        }
        if(!this.outOfBounds(nextStart.y + width, nextStart.x, artConfig.canvasSize, artConfig.canvasSize) &&
            (this.outOfBounds(nextStart.y + width, nextStart.x - 1, artConfig.canvasSize, artConfig.canvasSize) || artMap[nextStart.y + width][nextStart.x - 1])) {
            priQ.add(new Point(nextStart.y + width, nextStart.x)); // if wall to left of top of new square, add point
        }

        for(let i = nextStart.y; i < nextStart.y + width; i++) {
            for(let j = nextStart.x; j < nextStart.x + width; j++) {
                artMap[i][j] = true;
            }
        }

        this.drawArt(artCtx, img, nextStart.x, nextStart.y, width, 3);
    }

    private static distToNextWall(p, artMap: boolean[][], yLimit: number, xLimit: number): number {
        let count = 0;
        while(!this.outOfBounds(p.y, p.x + count, yLimit, xLimit) && !artMap[p.y][p.x + count]) {
            count++;
        }
        return count;
    }

    // returns the tallest point at the given x coordinate
    private static tallestY(x: number, artMap: boolean[][]): number {
        let y = 0;
        while(y < artMap.length && artMap[y][x]) {
            y++;
        }
        return y - 1; // went one past last point
    }

    private static outOfBounds(y: number, x: number, yLimit: number, xLimit: number): boolean {
        return (y < 0 || y >= yLimit ||
            x < 0 || x >= xLimit);
    }

    // draws the image through steps number of iterations to avoid ugly scaling
    public static drawArt(ctx, img, x, y, size, steps): void {
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
}