import {Quadtree} from "../js/geometry/quadtree";
import {Rectangle} from "../js/geometry/retangle";
import {Point} from "../js/geometry/point";
import {Line, Orientation} from "../js/geometry/line";

const dom_canvas = <HTMLCanvasElement> document.getElementById("canvas");
const ctx = dom_canvas.getContext("2d");

const qt = new Quadtree(0, 0, dom_canvas.width, dom_canvas.height);
qt.insert(new Rectangle(100, 100, 50, 50));
qt.insert(new Point(500, 500));
qt.insert(new Line(200, 200, 300, Orientation.V));
qt.insert(new Point(300, 300));
qt.insert(new Point(400, 400));
qt.paint(ctx);
console.log(qt.toString());
