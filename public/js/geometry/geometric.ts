export interface Geometric  {
    // TODO: this could probably be handled better with visitor pattern to avoid huge conditional in all implementations
    contains(g: Geometric): boolean;
    paint(ctx: CanvasRenderingContext2D): void;
    toString(): string;
}