import {Node} from "./node";
import {Comparable} from "./comparable";

export class PriorityQueue {
	private head: Node;
	private size: number;

	constructor() {
		this.head = null;
		this.size = 0;
	}

	public add(p: Comparable): void {
		if(!this.head) {
			this.head = new Node(null, null, p);
			this.size++;
		} else {
            let compNode = this.head;
            while(p.compare(compNode.data) >= 0) {
                if(!compNode.next) {
                    compNode.next = new Node(compNode, null, p);
                    this.size++;
                    return;
                } else {
                    compNode = compNode.next;
                }
            }
            // p.x is less than compNode.data.x
            // it should therefore come before compNode
            const newNode = new Node(compNode.prev, compNode, p);
            if (compNode == this.head) {
                this.head = newNode;
            } else {
                compNode.prev.next = newNode;
            }
            compNode.prev = newNode;
            this.size++;
        }
	}

	public popMin(): Comparable {
		if(!this.head) { // nothing to pop
			return null;
		}
		const res = this.head;
		this.head = this.head.next; // head is set to either the next element or null
		if(this.head) {
			this.head.prev = null;
		}
		this.size--;
		return res.data;
	}

	public get(i): Comparable {
		let res = this.head;
		while(res && i > 0) {
			res = res.next;
			i--;
		}
		return res.data;
	}

	public empty(): boolean {
		return !this.head;
	}

	public toString(): string {
		let str = "";
		if(!this.head) {
			return str;
		}
		str += this.head.toString();
		let node = this.head.next;
		while(node) {
			str += " -> " + node.toString();
			node = node.next;
		}
		return str;
	}
}
