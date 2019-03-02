import {Quadtree} from "../js/geometry/quadtree";
import {Line, Orientation} from "../js/geometry/line";

const vDivisions = 5;
const hDivisions = 6;

const dom_canvas = <HTMLCanvasElement> document.getElementById("canvas");
const ctx = dom_canvas.getContext("2d");

const qt = new Quadtree<Line>(0, 0, dom_canvas.width, dom_canvas.height);

let widthDivision = dom_canvas.width / vDivisions;
let heightDivision = dom_canvas.height / hDivisions;
for(let i = 0; i <= hDivisions; i++) {
    qt.insert(new Line(0, i * heightDivision, dom_canvas.width, Orientation.H));
}
for(let i = 0; i <= vDivisions; i++) {
    qt.insert(new Line(i * widthDivision, 0, dom_canvas.height, Orientation.V));
}
qt.paint(ctx);
console.log(qt.toString());

const topVerticalLines = (<Line[]> qt.hitTest(new Line(0, 0, dom_canvas.width, Orientation.H))).filter((l) => l.orientation == Orientation.V && l.x != 0);
topVerticalLines.forEach((el) => {
    console.log(el);
    ctx.beginPath();
    ctx.strokeStyle = "blue";
    ctx.moveTo(el.x, el.y);

    let v = el;
    let highY = false, highX = true;
    let limitY = 0, limitX = el.x;
    do {
        let hIntersections = qt.hitTest(v);
        let h = findBestLineIntersect(hIntersections, Orientation.H, highY, limitY);
        ctx.lineTo(v.x, h.y);

        let vIntersections = qt.hitTest(h);
        v = findBestLineIntersect(vIntersections, Orientation.V, highX, limitX);
        ctx.lineTo(v.x, h.y);

        if(hIntersections.length != 1) {
            highY = !highY;
            limitY = h.y;
        }

        if(vIntersections.length != 1) {
            highX = !highX;
            limitX = v.x;
        }

        console.log(h, v);
    } while(v != el);
    ctx.closePath();
    ctx.stroke();
});

// TODO: document
function findBestLineIntersect(intersectingLines: Line[], ori: Orientation, high: boolean, limit: number): Line {
    if(intersectingLines.length == 1) {
        return intersectingLines[0].orientation == ori ? intersectingLines[0] : null;
    }

    let bestVal = high ? -1 : Number.MAX_SAFE_INTEGER;
    let bestLine: Line = null;
    intersectingLines.forEach((il) => {
        if(il.orientation == ori) {
            const compVal = ori == Orientation.H ? il.y : il.x;
            if((high && compVal > bestVal && compVal < limit) || (!high && compVal < bestVal && compVal > limit)) {
                bestVal = compVal;
                bestLine = il;
            }
        }
    });

    return bestLine;
}
