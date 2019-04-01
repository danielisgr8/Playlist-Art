import {Geometric} from "./geometric";
import {Point} from "./point";
import {Rectangle} from "./retangle";

export enum Orientation {
    V,
    H,
    Error
}

export class Line implements Geometric {
    public x: number;
    public y: number;
    public length: number;
    public orientation: Orientation;
    public pid: number;

    constructor(x: number, y: number, length: number, orientation: Orientation, pid = 0) {
        if(length < 0) {
            if(orientation == Orientation.V) {
                y += length;
            } else {
                x += length;
            }
            length = -length;
        }
        this.x = x;
        this.y = y;
        this.length = length;
        this.orientation = orientation;
        this.pid = pid;
    }

    public contains(g: Geometric): boolean {
        if(g instanceof Point || g instanceof Rectangle || g instanceof Line) {
            let constant: number, // must not differ from `constantG`
                constantG: number,
                start: number, // must be at or before `startG`
                startG: number,
                endG: number, // must end at or before `this.start + this.length`
                oriG: Orientation; // must equal `this.orientation`

            if(this.orientation == Orientation.V) {
                constant = this.x;
                constantG = g.x;
                start = this.y;
                startG = g.y;
                if(g instanceof Point) {
                    endG = g.y;
                    oriG = this.orientation;
                } else if(g instanceof Rectangle) {
                    endG = g.y + g.height;
                    oriG = g.width == 0 ? this.orientation : Orientation.Error;
                } else {
                    endG = g.y + g.length;
                    oriG = g.orientation;
                }
            } else if(this.orientation == Orientation.H) {
                constant = this.y;
                constantG = g.y;
                start = this.x;
                startG = g.x;
                if(g instanceof Point) {
                    endG = g.x;
                    oriG = this.orientation;
                } else if(g instanceof Rectangle) {
                    endG = g.x + g.width;
                    oriG = g.height == 0 ? this.orientation : Orientation.Error;
                } else {
                    endG = g.x + g.length;
                    oriG = g.orientation;
                }
            }

            return constantG == constant &&
                   startG >= start &&
                   endG <= start + this.length &&
                   oriG == this.orientation;
        }

        // should theoretically never be reached
        return false;
    }

    public paint(ctx: CanvasRenderingContext2D): void {
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        if(this.orientation == Orientation.V) {
            ctx.lineTo(this.x, this.y + this.length);
        } else {
            ctx.lineTo(this.x + this.length, this.y);
        }
        ctx.closePath();
        ctx.strokeStyle = "red";
        ctx.stroke();
    }

    public toString(): string {
        return `L(${this.x}, ${this.y}, ${this.length}, ${this.orientation})`;
    }
}