(function () {
    "use strict";

    const WIDTH = 512;
    const HEIGHT = 512;

    function main() {
        var canvas    = window.document.createElement("canvas");
        canvas.width  = WIDTH;
        canvas.height = HEIGHT;
        window.document.body.appendChild(canvas);

        var ctx = canvas.getContext("2d");
        ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
        ctx.strokeStyle = "rgba(255, 0, 0, 0.5)";
        ctx.lineWidth = 1;

        var cubic = [
            rand(),
            rand(),
            rand(),
            rand()
        ];
        bezier(ctx, cubic);
        cubic.forEach(function (point) {
            drawCircle(ctx, point, 10);
        });

        ctx.strokeStyle = "rgba(0, 0, 255, 0.5)";
        var quadratic = cubic2Quadratic.apply(undefined, cubic);
        quadratic.forEach(function (curve) {
            bezier(ctx, curve);
        });
    }

    function drawCircle(ctx, point, radius) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    function Point(x, y) {
        if (!(this instanceof Point)) {
            return new Point(x, y);
        }
        this.x = x;
        this.y = y;
    }

    function rand() {
        return new Point(Math.random() * WIDTH, Math.random() * HEIGHT);
    }

    function bezier(ctx, pts) {
        ctx.beginPath();

        var xs;
        for (var t = 0; t < 1; t += 0.01) {
            xs = pts;
            while (xs.length > 1) {
                xs = next(xs, t);
            }
            ctx.lineTo(xs[0].x, xs[0].y);
        }
        xs = pts;
        while (xs.length > 1) {
            xs = next(xs, 1);
        }
        ctx.lineTo(xs[0].x, xs[0].y);

        ctx.stroke();

        function next(pts, t) {
            var xs = [];
            for (var i = 0; i <= pts.length - 2; i++) {
                var p = pts[i],
                    q = pts[i + 1];
                xs.push(Point(
                    p.x * (1 - t) + q.x * t,
                    p.y * (1 - t) + q.y * t
                ));
            }
            return xs;
        }
    }

    function mid(p1, p2) {
        return Point(
            p1.x * 0.5 + p2.x * 0.5,
            p1.y * 0.5 + p2.y * 0.5
        );
    }

    function cubic2Quadratic(p1, p2, p3, p4) {
        var a1 = mid(p1, p2),
            a2 = mid(p2, p3),
            a3 = mid(p3, p4),
            b1 = mid(a1, a2),
            b2 = mid(a2, a3),
            c  = mid(b1, b2),
            d1 = mid(p1, a1),
            d2 = mid(p4, a3),
            e1 = mid(p1, d1),
            e2 = mid(p4, d2),
            f1 = mid(b1, c),
            f2 = mid(b2, c),
            g1 = mid(f1, b1),
            g2 = mid(f2, b2),
            h1 = mid(e1, g1),
            h2 = mid(e2, g2);
        return [
            [p1, e1, h1],
            [h1, g1, c],
            [c, g2, h2],
            [h2, e2, p4]
        ]

    }

    window.addEventListener("load", main);
})();
