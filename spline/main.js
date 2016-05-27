"use strict";

window.addEventListener("load", () => {
    let canvas = window.document.getElementById("canvas");
    main(canvas);
});

function main(canvas) {
    let ctx = canvas.getContext("2d");
    let ps = new Array(10).fill(null).map(_ => p(Math.random() * 640, Math.random() * 480));
    draw(ctx, "#0000ff", ps);
    let sps = spline(ps, 20);
    draw(ctx, "#ff0000", sps);
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

    static distance(p1, p2) {
        return Math.sqrt((p1.x - p2.x) * (p1.x - p2.x)  + (p1.y - p2.y) * (p1.y - p2.y));
    }
}

function p(x, y) {
    return new Point(x, y);
}

// ref: en.wikipedia.org/wiki/Centripetal_Catmull–Rom_spline
function spline(points, resolution) {
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
        let s = segment(vs[i], vs[i + 1], vs[i + 2], vs[i + 3], resolution);
        ps = ps.concat(s);
    }
    ps.push(points[len - 1]);
    return ps;
}

function segment(v0, v1, v2, v3, resolution) {
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
