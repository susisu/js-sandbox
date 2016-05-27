"use strict";

window.addEventListener("load", () => {
    let canvas = window.document.getElementById("canvas");
    main(canvas);
});

function main(canvas) {
    let ctx = canvas.getContext("2d");
    let ps = [
        p(  0, 420),
        p(100, 320),
        p(113, 240),
        p(125, 100),
        p(137, 240),
        p(150, 320),
        p(250, 420)
    ];
    draw(ctx, "#808080", ps);
    let sps = spline(ps.map(q => p(q.x + 120, q.y)), 20, 0);
    draw(ctx, "#ff0000", sps);
    let sps2 = spline(ps.map(q => p(q.x + 240, q.y)), 20, Math.PI / 16);
    draw(ctx, "#ff0000", sps2);
}

function draw(ctx, style, points) {
    ctx.strokeStyle = style;
    ctx.beginPath();
    let len = points.length;
    if (len > 0) {
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < len; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
    }
    ctx.stroke();
}

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    toString() {
        return `(${this.x.toString()}, ${this.y.toString()})`;
    }

    scale(s) {
        return new Point(s * this.x, s * this.y);
    }

    add(p) {
        return new Point(this.x + p.x, this.y + p.y);
    }

    sub(p) {
        return new Point(this.x - p.x, this.y - p.y);
    }

    norm() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalize() {
        let n = this.norm();
        return new Point(this.x / n, this.y / n);
    }

    // inner product
    prod(p) {
        return this.x * p.x + this.y * p.y;
    }

    static distance(p1, p2) {
        return p1.sub(p2).norm();
    }

    static angle(p1, p2) {
        return Math.acos(p1.prod(p2) / (p1.norm() * p2.norm()));
    }
}

function p(x, y) {
    return new Point(x, y);
}

// ref: en.wikipedia.org/wiki/Centripetal_Catmull–Rom_spline
function spline(points, resolution, acuteCorrThreshold) {
    let len = points.length;
    if (len <= 2) {
        return points;
    }
    let vs = points.slice();
    vs.unshift(points[0].add(points[0].sub(points[1])));
    vs.push(points[len - 1].add(points[len - 1].sub(points[len - 2])));
    let ps = [];
    let numVs = vs.length;
    for (let i = 0; i <= numVs - 4; i++) {
        let s = segment(vs[i], vs[i + 1], vs[i + 2], vs[i + 3], resolution, acuteCorrThreshold);
        ps = ps.concat(s);
    }
    ps.push(points[len - 1]);
    return ps;
}

function segment(v0, v1, v2, v3, resolution, acuteCorrThreshold) {
    let g1 = Point.angle(v0.sub(v1), v2.sub(v1));
    let g2 = Point.angle(v1.sub(v2), v3.sub(v2));
    if (0 < g1 && g1 < acuteCorrThreshold) {
        let t = v2.sub(v1).normalize();
        let v = v0.sub(v1);
        let n = v.scale(t.prod(t)).sub(t.scale(t.prod(v))).normalize();
        v0 = v1.add(t.scale(v.prod(t)).add(n.scale(-v.prod(n))));
    }
    if (0 < g2 && g2 < acuteCorrThreshold) {
        let t = v1.sub(v2).normalize();
        let v = v3.sub(v2);
        let n = v.scale(t.prod(t)).sub(t.scale(t.prod(v))).normalize();
        v3 = v2.add(t.scale(v.prod(t)).add(n.scale(-v.prod(n))));
    }
    let t0 = 0;
    let t1 = Math.sqrt(Point.distance(v0, v1)) + t0;
    let t2 = Math.sqrt(Point.distance(v1, v2)) + t1;
    let t3 = Math.sqrt(Point.distance(v2, v3)) + t2;
    let ps = [];
    let dt = (t2 - t1) / resolution;
    for (let i = 0, t = t1; i < resolution; i++, t += dt) {
        let a0 = v0.scale((t1 - t) / (t1 - t0)).add(v1.scale((t - t0) / (t1 - t0)));
        let a1 = v1.scale((t2 - t) / (t2 - t1)).add(v2.scale((t - t1) / (t2 - t1)));
        let a2 = v2.scale((t3 - t) / (t3 - t2)).add(v3.scale((t - t2) / (t3 - t2)));
        let b0 = a0.scale((t2 - t) / (t2 - t0)).add(a1.scale((t - t0) / (t2 - t0)));
        let b1 = a1.scale((t3 - t) / (t3 - t1)).add(a2.scale((t - t1) / (t3 - t1)));
        let c  = b0.scale((t2 - t) / (t2 - t1)).add(b1.scale((t - t1) / (t2 - t1)));
        ps.push(c);
    }
    return ps;
}
