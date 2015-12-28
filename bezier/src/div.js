"use strict";

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    toString() {
        return "(" + this.x.toString() + ", "
            + this.y.toString() + ")";
    }
}

function next(ps, t) {
    var qs = [];
    for (var i = 0; i < ps.length - 1; i++) {
        var p1 = ps[i],
            p2 = ps[i + 1];
        qs.push(
            new Point(
                p1.x * (1 - t) + p2.x * t,
                p1.y * (1 - t) + p2.y * t
            )
        );
    }
    return qs;
}

function divideAt(ps, t) {
    var n  = ps.length - 1,
        ss = [ps],
        qs = ps;
    while (qs.length > 1) {
        qs = next(qs, t);
        ss.push(qs);
    }
    var us = [],
        vs = [];
    for (var i = 0; i <= n; i++) {
        us.push(ss[i][0]);
        vs.push(ss[n - i][i]);
    }
    return [us, vs];
}

function draw(ps, s) {
    for (var t = 0; t <= 1.0; t += s) {
        var qs = ps;
        while (qs.length > 1) {
            qs = next(qs, t);
        }
        console.log(qs[0].toString());
    }
}

function main() {
    var ps = [];
    for (var i = 0; i <= 3; i++) {
        ps.push(new Point(Math.random(), Math.random()));
    }
    draw(ps, 0.1);
    console.log("---");
    var uvs = divideAt(ps, 0.5);
    draw(uvs[0], 0.2);
    console.log("---");
    draw(uvs[1], 0.2);
}

main();
