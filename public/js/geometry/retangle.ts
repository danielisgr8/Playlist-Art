import {Geometric} from "./geometric";
import {Point} from "./point";
import {Line, Orientation} from "./line";

export class Rectangle implements Geometric {
    public x: number;
    public y: number;
    public width: number;
    public height: number;

    constructor(x: number, y: number, width: number, height: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    contains(g: Geometric): boolean {
        let startGX: number,
            startGY: number,
            endGX: number,
            endGY: number;
        if(g instanceof Point || g instanceof Rectangle || g instanceof Line) {
            startGX = g.x;
            startGY = g.y;
            if(g instanceof Point) {
                endGX = g.x;
                endGY = g.y;
            } else if(g instanceof Rectangle) {
                endGX = g.x + g.width;
                endGY = g.y + g.height;
            } else {
                if(g.orientation == Orientation.V) {
                    endGX = g.x;
                    endGY = g.y + g.length;
                } else if(g.orientation == Orientation.H) {
                    endGX = g.x + g.length;
                    endGY = g.y;
                }
            }

            return this.x <= startGX &&
                   this.y <= startGY &&
                   this.x + this.width >= endGX &&
                   this.y + this.height >= endGY;
        }

        // should theoretically never be reached
        return false;
    }
}