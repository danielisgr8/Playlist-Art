import {Comparable} from "../comparable";
import {Geometric} from "./geometric";
import {Rectangle} from "./retangle";
import {Line} from "./line";

export class Point implements Comparable, Geometric {
    public readonly x: number;
    public readonly y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public compare(p: Point): number {
        if(this.y > p.y) {
            return 1;
        } else if(this.y === p.y) {
            return 0;
        } else {
            return -1;
        }
    }

    public contains(g: Geometric): boolean {
        if(g instanceof Point || g instanceof Rectangle || g instanceof Line) {
            if(g.x != this.x || g.y != this.y) return false;

            if(g instanceof Point) {
                return true;
            } else if(g instanceof Rectangle) {
                return g.width == 0 && g.height == 0;
            } else {
                return g.length == 0;
            }
        }

        // should theoretically never be reached
        return false;
    }

    public paint(ctx: CanvasRenderingContext2D): void {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, 360);
        ctx.closePath();
        ctx.strokeStyle = "red";
        ctx.stroke();

    }

    public toString(): string {
        return `P(${this.y}, ${this.x})`;
    }
}