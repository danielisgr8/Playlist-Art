import {Quadtree} from "../js/geometry/quadtree";
import {Rectangle} from "../js/geometry/retangle";
import {Point} from "../js/geometry/point";
import {Line, Orientation} from "../js/geometry/line";

const vDivisions = 5;
const hDivisions = 6;

const dom_canvas = <HTMLCanvasElement> document.getElementById("canvas");
const ctx = dom_canvas.getContext("2d");

const qt = new Quadtree(0, 0, dom_canvas.width, dom_canvas.height);

let widthDivision = dom_canvas.width / vDivisions;
let heightDivision = dom_canvas.height / hDivisions;
for(let i = 1; i < hDivisions; i++) {
    qt.insert(new Line(0, i * heightDivision, dom_canvas.width, Orientation.H));
}
for(let i = 1; i < vDivisions; i++) {
    qt.insert(new Line(i * widthDivision, 0, dom_canvas.height, Orientation.V));
}
qt.paint(ctx);
console.log(qt.toString());

dom_canvas.onclick = ev => {
    console.log(`${ev.offsetX}, ${ev.offsetY}`);
    console.log(qt.hitTest(new Point(ev.offsetX, ev.offsetY)));
};
