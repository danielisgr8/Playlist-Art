import {Comparable} from "../comparable";
import {Geometric} from "./geometric";
import {Rectangle} from "./retangle";
import {Line} from "./line";

export class Point implements Comparable, Geometric {
    public readonly y: number;
    public readonly x: number;

    constructor(y: number, x: number) {
        this.y = y;
        this.x = x;
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

    contains(g: Geometric): boolean {
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

    public toString(): string {
        return `(${this.y}, ${this.x})`;
    }
}