(function () {
    var WIDTH  = 640,
        HEIGHT = 640;

    var canvas, renderer, stage;

    function main() {
        for (var i = 0; i < 3; i++) {
            var r1 = Math.random(),
                r2 = Math.random(),
                z1 = Math.sqrt(-2.0 * Math.log(r1)) * Math.cos(2 * Math.PI * r2),
                z2 = Math.sqrt(-2.0 * Math.log(r1)) * Math.sin(2 * Math.PI * r2);
            var splash = new Splash(64);
            splash.x = WIDTH  * 0.5 + z1 * 50.0;
            splash.y = HEIGHT * 0.5 + z2 * 50.0;
            stage.addChild(splash);
        }
        render();
    }

    function render() {
        renderer.render(stage);
    }

    function Splash(size) {
        PIXI.Graphics.call(this);
        this.tint = Math.random() * 0x1000000 >> 0;

        function draw(splash, m, x, y, vx, vy, gen, maxGen) {
            splash.beginFill(0xFFFFFF)
                .drawCircle(x, y, Math.sqrt(m))
                .endFill();

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
                        draw(splash, cm, cx, cy, cvx, cvy, gen + 1, maxGen);
                    }
                }
            }
        }

         draw(this, size * size, 0.0, 0.0, 0.0, 0.0, 0, 4);

        // var bf      = new PIXI.filters.BlurFilter();
        // bf.blur     = 4;
        // var cmf1    = new PIXI.filters.ColorMatrixFilter();
        // cmf1.matrix = [
        //     1, 0, 0, 0, 0,
        //     0, 1, 0, 0, 0,
        //     0, 0, 1, 0, 0,
        //     0, 0, 0, 1, -0.4
        // ];
        // var cmf2    = new PIXI.filters.ColorMatrixFilter();
        // cmf2.matrix = [
        //     1, 0, 0,   0, Math.random(),
        //     0, 1, 0,   0, Math.random(),
        //     0, 0, 1,   0, Math.random(),
        //     0, 0, 0, 100, 0
        // ];
        // this.filters = [bf, cmf1, cmf2];
    }

    Splash.prototype = Object.create(PIXI.Graphics.prototype, {
        "constructor": {
            "writable"    : true,
            "configurable": true,
            "value": Splash
        }
    })

    window.addEventListener("load", function () {
        canvas = window.document.createElement("canvas");
        canvas.width  = WIDTH;
        canvas.height = HEIGHT;
        window.document.getElementById("canvas-wrapper").appendChild(canvas);

        renderer =
            PIXI.autoDetectRenderer(WIDTH, HEIGHT, {
                "view"       : canvas,
                "antialias"  : true,
                "autoResize" : true,
                "resolution" : window.devicePixelRatio,
                "transparent": false
            });

        stage = new PIXI.Container();

        main();
    });
})();

