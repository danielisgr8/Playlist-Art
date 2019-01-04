class Point {
    constructor(y, x) {
        this.y = y;
        this.x = x;
    }

    compare(p) {
        if(this.y > p.y) {
            return 1;
        } else if(this.y === p.y) {
            return 0;
        } else {
            return -1;
        }
    }

    toString() {
        return `(${this.y}, ${this.x})`;
    }
}

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

function shuffle(arr) {
    const res = [];
    const arrCopy = arr.slice();
    while(arrCopy.length !== 0) {
        const randI = Math.floor(Math.random() * arrCopy.length);
        res.push(arrCopy[randI]);
        arrCopy.splice(randI, 1);
    }
    return res;
}

function addArt(img, priQ) {
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