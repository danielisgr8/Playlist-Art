class Node {
	constructor(prev, next, data) {
		this.prev = prev;
		this.next = next;
		this.data = data;
	}

	toString() {
		return this.data.toString();
	}
}

class PriorityQueue {
	constructor() {
		this.head = null;
		this.size = 0;
	}

	add(p) {
		if(!this.head) {
			this.head = new Node(null, null, p);
			this.size++;
			return;
		}
		let compNode = this.head;
		while(p.compare(compNode.data) >= 0) {
			if(!compNode.next) {
				const newNode = new Node(compNode, null, p);
				compNode.next = newNode;
				this.size++;
				return;
			} else {
				compNode = compNode.next;
			}
		}
		// p.x is less than compNode.data.x
		// it should therefore come before compNode
		const newNode = new Node(compNode.prev, compNode, p);
		if(compNode == this.head) {
			this.head = newNode;
		} else {
			compNode.prev.next = newNode;
		}
		compNode.prev = newNode
		this.size++;
	}

	popMin() {
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

	get(i) {
		let res = this.head;
		while(res && i > 0) {
			res = res.next;
			i--;
		}
		return res.data;
	}

	empty() {
		return !this.head;
	}

	toString() {
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
