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
    
    private static rectangleOverlaps(g1: Rectangle, g2: Geometric): boolean {
        if(g2 instanceof Point) {
            return g1.contains(g2);
        } else if(g2 instanceof Line) {
            let gConst: number,
                constStart: number,
                constEnd: number,
                gChangeStart: number,
                changeStart: number,
                changeEnd: number;
            if(g2.orientation == Orientation.V) {
                gConst = g2.x;
                constStart = g1.x;
                constEnd = g1.x + g1.width;
                gChangeStart = g2.y;
                changeStart = g1.y;
                changeEnd = g1.y + g1.height;
            } else if(g2.orientation == Orientation.H) {
                gConst = g2.y;
                constStart = g1.y;
                constEnd = g1.y + g1.height;
                gChangeStart = g2.x;
                changeStart = g1.x;
                changeEnd = g1.x + g1.width;
            }
            return gConst >= constStart &&
                gConst <= constEnd &&
                gChangeStart <= changeEnd &&
                gChangeStart + g2.length >= changeStart;
        } else if(g2 instanceof Rectangle) {
            return g2.x + g2.width >= g1.x &&
                g2.y + g2.height >= g1.y &&
                g2.x <= g1.x + g1.width &&
                g2.y <= g1.y + g1.height;
        }

        return false;
    }
    
    private static lineOverlaps(g1: Line, g2: Geometric): boolean {
        if(g2 instanceof Line) {
            if(g1.orientation != g2.orientation) {
                let rangeG,
                    range,
                    startG,
                    start;
                if(g1.orientation == Orientation.V) {
                    rangeG = g2.y;
                    range = g1.y;
                    startG = g2.x;
                    start = g1.x;
                } else {
                    rangeG = g2.x;
                    range = g1.x;
                    startG = g2.y;
                    start = g1.y;
                }
                return rangeG >= range &&
                    rangeG <= range + g1.length &&
                    startG <= start &&
                    startG + g2.length >= start;
            } else {
                let sameG,
                    same,
                    startG,
                    start;
                if(g1.orientation == Orientation.V) {
                    sameG = g2.x;
                    same = g1.x;
                    startG = g2.y;
                    start = g1.y;
                } else {
                    sameG = g2.y;
                    same = g1.y;
                    startG = g2.x;
                    start = g1.x;
                }
                return sameG == same &&
                    startG <= start + g1.length &&
                    startG + g2.length >= start;
            }
        } else if(g2 instanceof Point) {
            return g1.contains(g2);
        } else if(g2 instanceof Rectangle) {
            return this.rectangleOverlaps(g2, g1);
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