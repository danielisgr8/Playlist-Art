import {Rectangle} from "./retangle";
import {Geometric} from "./geometric";

const QUADTREE_SOFT_CAPACITY: number = 4;

export class Quadtree<T extends Geometric> {
    private readonly bounds: Rectangle;

    private elements: T[];

    private qtNW: Quadtree<T>;
    private qtNE: Quadtree<T>;
    private qtSE: Quadtree<T>;
    private qtSW: Quadtree<T>;
    
    private get qts(): Quadtree<T>[] {
        return [this.qtNW, this.qtNE, this.qtSE, this.qtSW];
    }

    constructor(x: number, y: number, width: number, height: number) {
        this.bounds = new Rectangle(x, y, width, height);
        this.elements = [];
    }

    /**
     * Attempts to insert `el` into the `Quadtree`.
     * If inserting `el` causes the `Quadtree`'s capacity to be exceeded, it will subdivide into four `Quadtree`s.
     * If `el` fits entirely in a subdivision, it will be inserted there.
     * Otherwise, it will be inserted into this `Quadtree`.
     * @param el The element to insert
     * @return `true` if the element was inserted, `false` otherwise
     */
    public insert(el: T): boolean {
        if(!this.bounds.contains(el)) return false;

        if(this.qtNW == null) {
            if(this.elements.length >= QUADTREE_SOFT_CAPACITY) {
                this.subdivide();
            } else {
                this.elements.push(el);
                return true;
            }
        }

        // attempt to fit `el` in smaller `Quadtree`
        let inserted = false;
        this.qts.forEach(qt => {
            if(inserted) return;
            if(qt.insert(el)) inserted = true;
        });
        if(inserted) return true;

        // if `el` can't be fully contained within a subdivision, insert it into this quadtree
        this.elements.push(el);
        return true;
    }

    private subdivide() {
        let width = this.bounds.width / 2;
        let height = this.bounds.height/ 2;
        let midX = (this.bounds.x + this.bounds.width) / 2;
        let midY = (this.bounds.y + this.bounds.height) / 2;

        this.qtNW = new Quadtree<T>(this.bounds.x, this.bounds.y, width, height);
        this.qtNE = new Quadtree<T>(midX, this.bounds.y, width, height);
        this.qtSE = new Quadtree<T>(midX, midY, width, height);
        this.qtSW = new Quadtree<T>(this.bounds.x, midY, width, height);

        // check if current nodes can now fit in a smaller quadtree
        this.elements = this.elements.filter(el => {
            let keep = true;
            this.qts.forEach(qt => {
                if(!keep) return;
                if(qt.insert(el)) keep = false;
            });
            return keep;
        });
    }

    /**
     * Checks if any element in this `Quadtree` contains `g`
     * @param g The element to check against this `Quadtree`
     * @return all elements in this `Quadtree` that contain `g`
     */
    public hitTest(g: Geometric): T[] {
        let results: T[] = [];

        if(this.qtNW != null) {
            this.qts.forEach(qt => {
                if(qt.bounds.contains(g)) results = results.concat(qt.hitTest(g));
            });
        }

        this.elements.forEach(el => {
            if(el.contains(g)) results.push(el);
        });

        return results;
    }

    public paint(ctx: CanvasRenderingContext2D): void {
        let minX = this.bounds.x;
        let minY = this.bounds.y;
        let maxX = this.bounds.x + this.bounds.width;
        let maxY = this.bounds.y + this.bounds.height;
        ctx.beginPath();
        ctx.moveTo(minX, minY);
        ctx.lineTo(maxX, minY);
        ctx.lineTo(maxX, maxY);
        ctx.lineTo(minX, maxY);
        ctx.closePath();
        ctx.strokeStyle = "black";
        ctx.stroke();

        if(this.qtNW != null) {
            this.qtNW.paint(ctx);
            this.qtNE.paint(ctx);
            this.qtSE.paint(ctx);
            this.qtSW.paint(ctx);
        }

        this.elements.forEach(el => {
            el.paint(ctx);
        });
    }

    public toString(): string {
        return this.toStringHelper(0);

    }

    private toStringHelper(indent: number): string {
        let str = "";
        for(let i = 0; i < indent; i++) {
            str += "\t";
        }

        str += "[ ";
        this.elements.forEach((el, i) => {
            if(i != 0) {
                str += ", ";
            }
            str += el.toString();
        });
        str += " ]\n";

        if(this.qtNW != null) {
            str += this.qtNW.toStringHelper(indent + 1);
            str += this.qtNE.toStringHelper(indent + 1);
            str += this.qtSE.toStringHelper(indent + 1);
            str += this.qtSW.toStringHelper(indent + 1);
        }

        return str;
    }
}