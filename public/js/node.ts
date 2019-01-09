import {Comparable} from "./comparable";

export class Node {
    public prev: Node;
    public next: Node;
    public data: Comparable;

    constructor(prev, next, data) {
        this.prev = prev;
        this.next = next;
        this.data = data;
    }

    public toString(): string {
        return this.data.toString();
    }
}