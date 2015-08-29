(function () {
    var WIDTH  = 640,
        HEIGHT = 640;

    var canvas, stage;

    function main() {
        for (var i = 0; i < 5; i++) {
            var r1 = Math.random(),
                r2 = Math.random(),
                z1 = Math.sqrt(-2.0 * Math.log(r1)) * Math.cos(2 * Math.PI * r2),
                z2 = Math.sqrt(-2.0 * Math.log(r1)) * Math.sin(2 * Math.PI * r2);
            var splash = new Splash(64);
            splash.x = WIDTH  * 0.5 + z1 * 100.0;
            splash.y = HEIGHT * 0.5 + z2 * 100.0;
            stage.addChild(splash);
        }
        render();
    }

    function render() {
        stage.update();
    }

    function Splash(size) {
        this.Container_constructor();
        var shape = new createjs.Shape();
        this.addChild(shape);
        var graphics = shape.graphics;

        // bounds
        var minX = 0, minY = 0, maxX = 0, maxY = 0;

        function draw(m, x, y, vx, vy, gen, maxGen) {
            graphics.beginFill("#000000")
                .drawCircle(x, y, Math.sqrt(m))
                .endFill();
            if (x - Math.sqrt(m) < minX) {
                minX = x - Math.sqrt(m);
            }
            if (y - Math.sqrt(m) < minY) {
                minY = y - Math.sqrt(m);
            }
            if (x + Math.sqrt(m) > maxX) {
                maxX = x + Math.sqrt(m);
            }
            if (y + Math.sqrt(m) > maxY) {
                maxY = y + Math.sqrt(m);
            }

            if (gen < maxGen) {
                for (var i = 0; i < Math.log(m) / Math.log(2); i++) {
                    var r1 = Math.random(),
                        r2 = Math.random(),
                        z1 = Math.sqrt(-2.0 * Math.log(r1)) * Math.cos(2 * Math.PI * r2),
                        z2 = Math.sqrt(-2.0 * Math.log(r1)) * Math.sin(2 * Math.PI * r2);
                    var cm  = Math.random() * m * 0.26,
                        cvx = vx + z1 * Math.sqrt(cm),
                        cvy = vy + z2 * Math.sqrt(cm),
                        cx  = x + cvx * 0.5,
                        cy  = y + cvy * 0.5;
                    if (cm > 1.0) {
                        draw(cm, cx, cy, cvx, cvy, gen + 1, maxGen);
                    }
                }
            }
        }

        draw(size * size, 0.0, 0.0, 0.0, 0.0, 0, 4);

        var bf  = new createjs.BlurFilter(4, 4, 1);
        var cm1 = new createjs.ColorMatrix();
        cm1.copy([
            1, 0, 0, 0, 0,
            0, 1, 0, 0, 0,
            0, 0, 1, 0, 0,
            0, 0, 0, 1, -0x66
        ]);
        var cmf1 = new createjs.ColorMatrixFilter(cm1);
        var cm2 = new createjs.ColorMatrix();
        cm2.copy([
            1, 0, 0,   0, Math.random() * 0xFF >> 0,
            0, 1, 0,   0, Math.random() * 0xFF >> 0,
            0, 0, 1,   0, Math.random() * 0xFF >> 0,
            0, 0, 0, 100, 0
        ]);
        var cmf2 = new createjs.ColorMatrixFilter(cm2);
        shape.filters = [bf, cmf1, cmf2];

        var bfBounds = bf.getBounds();
        shape.cache(
            minX + bfBounds.x,
            minY + bfBounds.y,
            maxX - minX + bfBounds.width,
            maxY - minY + bfBounds.height
        );
    }

    createjs.extend(Splash, createjs.Container);
    createjs.promote(Splash, "Container");

    window.addEventListener("load", function () {
        canvas = window.document.createElement("canvas");
        canvas.width  = WIDTH;
        canvas.height = HEIGHT;
        window.document.getElementById("canvas-wrapper").appendChild(canvas);

        stage = new createjs.Stage(canvas);

        main();
    });
})();

