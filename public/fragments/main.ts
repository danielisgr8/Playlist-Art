import {Quadtree} from "../js/geometry/quadtree";
import {Line, Orientation} from "../js/geometry/line";
import {Point} from "../js/geometry/point";
import {Geometric} from "../js/geometry/geometric";

const vDivisions = 5;
const hDivisions = 5;

const dom_canvas = <HTMLCanvasElement> document.getElementById("canvas");
const dom_resultCanvas = <HTMLCanvasElement> document.getElementById("resultCanvas");
const ctx = dom_canvas.getContext("2d");
const resultCtx = dom_resultCanvas.getContext("2d");

const qt = new Quadtree<Line>(0, 0, dom_canvas.width, dom_canvas.height);

let widthDivision = dom_canvas.width / vDivisions;
let heightDivision = dom_canvas.height / hDivisions;
let pidCounter = 0;

qt.insert(new Line(0, 0, dom_canvas.height, Orientation.V, pidCounter++));
for(let i = 1; i < vDivisions; i++) {
    let nextX = i * widthDivision;
    let nextY = 0;
    let nextOri = Orientation.V;
    while(nextY < dom_canvas.height) {
        let length = (nextOri == Orientation.V ? randomInt(50, 100) :
            (randomInt(0, 2) ? randomInt(-15, 0) : randomInt(1, 15)));
        if(nextOri == Orientation.V && length + nextY > dom_canvas.height) length = dom_canvas.height - nextY;
        const line = new Line(nextX, nextY, length, nextOri, pidCounter);
        qt.insert(line);
        if(nextOri == Orientation.V) {
            nextOri = Orientation.H;
            nextY += length;
        } else {
            nextOri = Orientation.V;
            nextX += length;
        }
    }
    pidCounter++;
}
qt.insert(new Line(dom_canvas.width, 0, dom_canvas.height, Orientation.V, pidCounter++));

qt.insert(new Line(0, 0, dom_canvas.width, Orientation.H, pidCounter++));
for(let i = 1; i < hDivisions; i++) {
    let nextX = 0;
    let nextY = i * heightDivision;
    let nextOri = Orientation.H;
    let lastLine: Line;
    while(nextX < dom_canvas.width) {
        let line: Line;
        let length: number;
        let intersects: Line[];
        do {
            length = (nextOri == Orientation.H ? randomInt(50, 100) :
                (randomInt(0, 2) ? randomInt(-15, 0) : randomInt(1, 15)));
            if(nextOri == Orientation.H && length + nextX > dom_canvas.width) length = dom_canvas.width - nextX;
            line = new Line(nextX, nextY, length, nextOri, pidCounter);
            intersects = qt.hitTest(line).filter((el) => { return el.pid != pidCounter; } );
            console.log(intersects);
            if(line.orientation == Orientation.H) {
                if(intersects.length > 1) {
                    if (lastLine) lastLine.length++;
                    line.y++;
                    nextY++;
                } else if(intersects.length == 1 &&
                          line.x + line.length == intersects[0].x &&
                          intersects[0].x != dom_canvas.width) {
                    length++;
                    line.length++;
                }
            }
        } while(line.orientation == Orientation.V && intersects.length > 0);
        qt.insert(line);
        lastLine = line;
        if(nextOri == Orientation.V) {
            nextOri = Orientation.H;
            nextY += length;
        } else {
            nextOri = Orientation.V;
            nextX += length;
            if(nextX > dom_canvas.width) nextX = dom_canvas.width;
        }
    }
    pidCounter++;
}
qt.insert(new Line(0, dom_canvas.height, dom_canvas.width, Orientation.H, pidCounter++));

qt.paint(ctx);

document.getElementById("startButton").onclick = (e) => {
    const topVerticalLines: Geometric[] = qt.hitTest(new Line(0, 0, dom_canvas.width, Orientation.H)).filter((l) => l.orientation == Orientation.V && l.x != 0);
    while(topVerticalLines.length != 0) {
        const el = topVerticalLines.pop();

        let v: Line;
        if (el instanceof Line) {
            v = el;
        } else if (el instanceof Point) {
            v = qt.hitTest(el).filter((el) => el.orientation == Orientation.V)[0];
        } else {
            break
        }
        resultCtx.moveTo(el.x, el.y);
        let highY = false, highX = false;
        let limitX = el.x, limitY = el.y;
        let switches = 0;
        let startLine = v;

        resultCtx.beginPath();
        resultCtx.strokeStyle = '#' + (Math.random() * 0xFFFFFF << 0).toString(16);

        do {
            let hIntersections = qt.hitTest(v).filter((el) => bestLineFilter(el, Orientation.H, limitY));
            let h = findBestLineIntersect(hIntersections, Orientation.H, highY, limitY);
            if (h.pid != v.pid) {
                switches++;
                if (switches % 2) {
                    highX = !highX;
                } else {
                    highY = !highY;
                }
                if (v.pid == startLine.pid && h.y != dom_canvas.height) topVerticalLines.push(new Point(v.x, h.y));
            }

            let vIntersections = qt.hitTest(h).filter((el) => bestLineFilter(el, Orientation.V, limitX));
            v = findBestLineIntersect(vIntersections, Orientation.V, highX, limitX);
            if (v.pid != h.pid) {
                switches++;
                if (switches % 2) {
                    highX = !highX;
                } else {
                    highY = !highY;
                }
            }

            limitX = v.x;
            limitY = h.y;
        } while (v != startLine);
        resultCtx.closePath();
        resultCtx.stroke();
    }
};

// TODO: document
function findBestLineIntersect(intersectingLines: Line[], ori: Orientation, high: boolean, limit: number): Line {
    if(intersectingLines.length == 1) {
        return intersectingLines[0].orientation == ori ? intersectingLines[0] : null;
    }

    let bestVal = high ? -1 : Number.MAX_SAFE_INTEGER;
    let bestLine: Line = null;
    intersectingLines.forEach((il) => {
        const compVal = ori == Orientation.H ? il.y : il.x;
        if((high && compVal > bestVal && compVal < limit) || (!high && compVal < bestVal && compVal > limit)) {
            bestVal = compVal;
            bestLine = il;
        }
    });

    return bestLine;
}

// filter lines of incorrect orientation and the past line of the same orientation
function bestLineFilter(el: Line, ori: Orientation, limit: number): boolean {
    return el.orientation == ori && (ori == Orientation.V ? el.x != limit : el.y != limit);
}

function randomInt(min: number, max: number): number {
    return min + Math.floor(Math.random() * (max - min));
}
