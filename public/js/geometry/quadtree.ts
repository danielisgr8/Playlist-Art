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
        this.elements = new Array(QUADTREE_SOFT_CAPACITY * 2);
    }

    /**
     * Attempts to insert `el` into the `Quadtree`.
     * If inserting `el` causes the `Quadtree`'s capacity to be reached, it will subdivide into four `Quadtree`s.
     * If `el` fits entirely in a subdivision, it will be inserted there.
     * Otherwise, it will be inserted into this `Quadtree`.
     * @param el The element to insert
     * @return `true` if the element was inserted, `false` otherwise
     */
    public insert(el: T): boolean {
        if(!this.bounds.contains(el)) return false;

        if(this.elements.length < QUADTREE_SOFT_CAPACITY && this.qtNW == null) {
            this.elements.push(el);
            return true;
        }

        if(this.qtNW == null) this.subdivide();

        this.qts.forEach(qt => {
            if(qt.insert(el)) return true;
        });

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
            this.qts.forEach(qt => {
                if(qt.insert(el)) return false;
            });
            return true;
        });
    }

    /**
     * Checks if any element in this `Quadtree` contains `t`
     * @param t The element to check against this quadtree
     * @return `true` if any element contains `t`, `false` otherwise
     */
    public hitTest(t: T): boolean {
        if(this.qtNW != null) {
            this.qts.forEach(qt => {
                if(qt.bounds.contains(t)) return qt.hitTest(t);
            });
        }

        this.elements.forEach(el => {
            if(el.contains(t)) return true;
        });
        return false;
    }
}