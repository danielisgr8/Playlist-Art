import {Geometric} from "./geometric";
import {Point} from "./point";

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
        if(g instanceof Point) {
            return g.x >= this.x &&
                   g.x <= this.x + this.width &&
                   g.y >= this.y &&
                   g.y <= this.y + this.height;
        } else if(g instanceof Rectangle) {
            return this.x >= g.x &&
                   this.x + this.width <= g.x + g.width &&
                   this.y >= g.y &&
                   this.y + this.height <= g.y + g.height;
        }
    }
}