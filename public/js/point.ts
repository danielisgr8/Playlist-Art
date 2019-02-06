import {Comparable} from "./comparable";

export class Point implements Comparable {
    public readonly y: number;
    public readonly x: number;

    constructor(y, x) {
        this.y = y;
        this.x = x;
    }

    public compare(p): number {
        if(this.y > p.y) {
            return 1;
        } else if(this.y === p.y) {
            return 0;
        } else {
            return -1;
        }
    }

    public toString(): string {
        return `(${this.y}, ${this.x})`;
    }
}