import {Geometric} from "./geometric";
import {Rectangle} from "./retangle";
import {Line, Orientation} from "./line";
import {Point} from "./point";

export class GeomUtil {
    public static overlaps(g1: Geometric, g2: Geometric): boolean {
        if(g1 instanceof Rectangle) {
            return this.rectangleOverlaps(g1, g2);
        } else if(g1 instanceof Line) {
            return this.lineOverlaps(g1, g2);
        } else if(g1 instanceof Point) {
            return this.pointOverlaps(g1, g2);
        }

        return false;
    }
    
    private static rectangleOverlaps(r: Rectangle, g: Geometric): boolean {
        if(g instanceof Point) {
            return r.contains(g);
        } else if(g instanceof Line) {
            let gConst: number, constStart: number, constEnd: number, gChangeStart: number, changeStart: number,
                changeEnd: number;
            if(g.orientation == Orientation.V) {
                gConst = g.x;
                constStart = r.x;
                constEnd = r.x + r.width;
                gChangeStart = g.y;
                changeStart = r.y;
                changeEnd = r.y + r.height;
            } else if(g.orientation == Orientation.H) {
                gConst = g.y;
                constStart = r.y;
                constEnd = r.y + r.height;
                gChangeStart = g.x;
                changeStart = r.x;
                changeEnd = r.x + r.width;
            }
            return gConst >= constStart &&
                gConst <= constEnd &&
                gChangeStart <= changeEnd &&
                gChangeStart + g.length >= changeStart;
        } else if(g instanceof Rectangle) {
            return g.x + g.width >= r.x &&
                g.y + g.height >= r.y &&
                g.x <= r.x + r.width &&
                g.y <= r.y + r.height;
        }

        return false;
    }
    
    private static lineOverlaps(l: Line, g: Geometric): boolean {
        if(g instanceof Line) {
            if(l.orientation != g.orientation) {
                let rangeG: number, range: number, startG: number, start: number;
                if(l.orientation == Orientation.V) {
                    rangeG = g.y;
                    range = l.y;
                    startG = g.x;
                    start = l.x;
                } else {
                    rangeG = g.x;
                    range = l.x;
                    startG = g.y;
                    start = l.y;
                }

                return rangeG >= range &&
                    rangeG <= range + l.length &&
                    startG <= start &&
                    startG + g.length >= start;
            } else {
                let sameG, same, startG, start;
                if(l.orientation == Orientation.V) {
                    sameG = g.x;
                    same = l.x;
                    startG = g.y;
                    start = l.y;
                } else {
                    sameG = g.y;
                    same = l.y;
                    startG = g.x;
                    start = l.x;
                }
                return sameG == same &&
                    startG <= start + l.length &&
                    startG + g.length >= start;
            }
        } else if(g instanceof Point) {
            return l.contains(g);
        } else if(g instanceof Rectangle) {
            return this.rectangleOverlaps(g, l);
        }

        return false;
    }
    
    private static pointOverlaps(g1: Point, g2: Geometric): boolean {
        if(g2 instanceof Rectangle) {
            return this.rectangleOverlaps(g2, g1);
        } else if(g2 instanceof Line) {
            return this.lineOverlaps(g2, g1);
        }

        return g1.contains(g2);
    }
}