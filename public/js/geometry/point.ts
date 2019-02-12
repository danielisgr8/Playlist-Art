import {Comparable} from "../comparable";
import {Geometric} from "./geometric";
import {Rectangle} from "./retangle";

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
        if(g instanceof Point) {
            return g.x == this.x && g.y == this.y;
        } else if(g instanceof Rectangle) {
            return g.x == this.x &&
                   g.width == 0 &&
                   g.y == this.y &&
                   g.height == 0;
        }
    }

    public toString(): string {
        return `(${this.y}, ${this.x})`;
    }
}