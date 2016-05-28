"use strict";

window.addEventListener("load", () => {
    let canvas = window.document.getElementById("canvas");
    main(canvas);
});

function main(canvas) {
    let ctx = canvas.getContext("2d");
    let ps = [];
    // for (var i = 0; i < 360; i += 0.25) {
    //     let r = Math.random() * 2;
    //     let a = Math.random() * 2 * Math.PI;
    //     ps.push(p(
    //         160 * Math.cos(i * Math.PI / 180) + 40 * Math.cos(16 * i * Math.PI / 180) + r * Math.cos(a) + 320,
    //         160 * Math.sin(i * Math.PI / 180) + 40 * Math.sin(16 * i * Math.PI / 180) + r * Math.sin(a) + 320
    //     ));
    // }
    for (var i = -320; i < 320; i++) {
        let r = Math.random() * 2;
        let a = Math.random() * 2 * Math.PI;
        ps.push(p(
            i + r * Math.cos(a) + 320,
            Math.pow(Math.abs(i) - 120, 2) / 64 + r * Math.sin(a) + 320
        ));
    }
    draw(ctx, "#808080", ps);
    let sps = spline(ps.map(q => q.add(p(-100, 0))), 10, Math.PI / 16);
    draw(ctx, "#ff0000", sps);
    let sps2 = spline(simplify(ps.map(q => q.add(p(100, 0))), 8), 10, Math.PI / 16);
    draw(ctx, "#0000ff", sps2);
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

    innerProd(p) {
        return this.x * p.x + this.y * p.y;
    }

    distanceTo(p) {
        return Math.sqrt((this.x - p.x) * (this.x - p.x) + (this.y - p.y) * (this.y - p.y));
    }

    angle() {
        return Math.atan2(this.y, this.x);
    }

    angleBetween(p) {
        return Math.acos(this.innerProd(p) / (this.norm() * p.norm()));
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
    let g1 = v0.sub(v1).angleBetween(v2.sub(v1));
    let g2 = v1.sub(v2).angleBetween(v3.sub(v2));
    if (0 < g1 && g1 < Math.PI && g1 < acuteCorrThreshold) {
        let t = v2.sub(v1).normalize();
        let v = v0.sub(v1);
        let n = v.scale(t.innerProd(t)).sub(t.scale(t.innerProd(v))).normalize();
        v0 = v1.add(t.scale(v.innerProd(t)).add(n.scale(-v.innerProd(n))));
    }
    if (0 < g2 && g2 < Math.PI && g2 < acuteCorrThreshold) {
        let t = v1.sub(v2).normalize();
        let v = v3.sub(v2);
        let n = v.scale(t.innerProd(t)).sub(t.scale(t.innerProd(v))).normalize();
        v3 = v2.add(t.scale(v.innerProd(t)).add(n.scale(-v.innerProd(n))));
    }
    let t0 = 0;
    let t1 = Math.sqrt(v0.distanceTo(v1)) + t0;
    let t2 = Math.sqrt(v1.distanceTo(v2)) + t1;
    let t3 = Math.sqrt(v2.distanceTo(v3)) + t2;
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

function simplify(points, strength) {
    let len = points.length;
    if (len <= 2) {
        return points;
    }
    else {
        let vs = [];
        for (let i = 0; i <= len - 2; i++) {
            vs.push(points[i + 1].sub(points[i]));
        }
        let ps = [points[0]];
        let k = 0;
        for (let i = 1; i <= len - 2; i++) {
            let d = points[k].distanceTo(points[i]);
            if (d > strength) {
                ps.push(points[i]);
                k = i;
            }
            else {
                let a = vs[i].sub(vs[k]).norm();
                if (a > strength) {
                    ps.push(points[i]);
                    k = i;
                }
            }
        }
        ps.push(points[len - 1]);
        return ps;
    }
}
