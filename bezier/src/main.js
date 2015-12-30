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
        ctx.strokeStyle = "rgba(0, 0, 0, 1.0)";
        ctx.lineWidth = 1;

        var curve = [
            Point(128, 128),
            Point(384, 128),
            Point(128, 384),
            Point(384, 384)
        ];
        bezier(ctx, curve);
        curve.forEach(function (point) {
            drawCircle(ctx, point, 10);
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

    window.addEventListener("load", main);
})();
