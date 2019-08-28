import {Comparable} from "./comparable";

export class Node<T extends Comparable> {
    public prev: Node<T>;
    public next: Node<T>;
    public data: T;

    constructor(prev: Node<T>, next: Node<T>, data: T) {
        this.prev = prev;
        this.next = next;
        this.data = data;
    }

    public toString(): string {
        return this.data.toString();
    }
}