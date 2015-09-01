(function () {
    "use strict";

    var WIDTH = 640, HEIGHT = 640;
    var SIZE = 160;
    var KEY_LEFT = 37, KEY_RIGHT = 39, KEY_UP = 38, KEY_DOWN = 40;

    var canvas;

    function Point(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    Point.prototype = Object.create(Object.prototype, {
        "constructor": {
            "writable"    : true,
            "configurable": true,
            "value": Point
        },
        "norm": {
            "writable"    : true,
            "configurable": true,
            "value": function () {
                return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
            }
        },
        "normalize": {
            "writable"    : true,
            "configurable": true,
            "value": function () {
                var norm = this.norm();
                return new Point(
                    this.x / norm,
                    this.y / norm,
                    this.z / norm
                );
            }
        },
        "negate": {
            "writable"    : true,
            "configurable": true,
            "value": function () {
                return new Point(
                    -this.x,
                    -this.y,
                    -this.z
                );
            }
        },
        "scale": {
            "writable"    : true,
            "configurable": true,
            "value": function (scale) {
                return new Point(
                    this.x * scale,
                    this.y * scale,
                    this.z * scale
                );
            }
        },
        "add": {
            "writable"    : true,
            "configurable": true,
            "value": function (point) {
                return new Point(
                    this.x + point.x,
                    this.y + point.y,
                    this.z + point.z
                );
            }
        },
        "subtract": {
            "writable"    : true,
            "configurable": true,
            "value": function (point) {
                return new Point(
                    this.x - point.x,
                    this.y - point.y,
                    this.z - point.z
                );
            }
        },
        "dot": {
            "writable"    : true,
            "configurable": true,
            "value": function (point) {
                return this.x * point.x + this.y * point.y + this.z * point.z;
            }
        },
        "cross": {
            "writable"    : true,
            "configurable": true,
            "value": function (point) {
                return new Point(
                    this.y * point.z - this.z * point.y,
                    this.z * point.x - this.x * point.z,
                    this.x * point.y - this.y * point.x
                );
            }
        },
        "transform": {
            "writable"    : true,
            "configurable": true,
            "value": function (matrix) {
                return new Point(
                    matrix[0] * this.x + matrix[1] * this.y + matrix[2] * this.z,
                    matrix[3] * this.x + matrix[4] * this.y + matrix[5] * this.z,
                    matrix[6] * this.x + matrix[7] * this.y + matrix[8] * this.z
                );
            }
        }
    });

    function Camera(position, view, angle, width, height, angleOfView) {
        this.__position__    = position;
        this.__view__        = view;
        this.__angle__       = angle;
        this.__zNormal__     = view.subtract(position).normalize();
        this.__xNormal__     = angle.normalize();
        this.__yNormal__     = this.__zNormal__.cross(this.__xNormal__);
        this.__width__       = width;
        this.__height__      = height;
        this.__angleOfView__ = angleOfView;
        this.__f__           = 0.5 * width / Math.tan(0.5 * angleOfView);
    }

    Camera.prototype = Object.create(Object.prototype, {
        "constructor": {
            "writable"    : true,
            "configurable": true,
            "value": Camera
        },
        "position": {
            "configurable": true,
            "get": function () {
                return this.__position__;
            },
            "set": function (value) {
                this.__position__ = value;
                this.__zNormal__  = this.__view__.subtract(value).normalize();
                this.__yNormal__  = this.__zNormal__.cross(this.__xNormal__);
            }
        },
        "view": {
            "configurable": true,
            "get": function () {
                return this.__view__;
            },
            "set": function (value) {
                this.__view__    = value;
                this.__zNormal__ = value.subtract(this.__position__).normalize();
                this.__yNormal__ = this.__zNormal__.cross(this.__xNormal__);
            }
        },
        "angle": {
            "configurable": true,
            "get": function () {
                return this.__angle__;
            },
            "set": function (value) {
                this.__angle__   = value;
                this.__xNormal__ = value.normalize();
                this.__yNormal__ = this.__zNormal__.cross(this.__xNormal__);
            }
        },
        "width": {
            "configurable": true,
            "get": function () {
                return this.__width__;
            },
            "set": function (value) {
                this.__width__ = value;
                this.__f__     = 0.5 * value / Math.tan(0.5 * this.__angleOfView__);
            }
        },
        "height": {
            "configurable": true,
            "get": function () {
                return this.__height__;
            },
            "set": function (value) {
                this.__height__ = value;
            }
        },
        "angleOfView": {
            "configurable": true,
            "get": function () {
                return this.__angleOfView__;
            },
            "set": function (value) {
                this.__angleOfView__ = value;
                this.__f__           = 0.5 * this.__width__ / Math.tan(0.5 * value);
            }
        },
        "project": {
            "writable"    : true,
            "configurable": true,
            "value": function (point) {
                point = point.subtract(this.__position__);
                var depth = point.dot(this.__zNormal__);
                if (depth <= 0) {
                    return null;
                }
                var x = point.dot(this.__xNormal__) * this.__f__ / depth + this.__width__ * 0.5,
                    y = point.dot(this.__yNormal__) * this.__f__ / depth + this.__height__ * 0.5;
                if (x < 0 || x >= this.__width__ || y < 0 || y >= this.__height__) {
                    return null;
                }
                return new Point(x, y, depth);
            }
        }
    });

    function main() {
        var context = canvas.getContext("2d");
        var camera = new Camera(
            new Point(0, 0, -320),
            new Point(0, 0, 0),
            new Point(1, 0, 0),
            WIDTH,
            HEIGHT,
            Math.PI / 4
        );

        var vertices = [
            new Point(-SIZE * 0.5, -SIZE * 0.5, -SIZE * 0.5),
            new Point( SIZE * 0.5, -SIZE * 0.5,  SIZE * 0.5),
            new Point(-SIZE * 0.5,  SIZE * 0.5,  SIZE * 0.5),
            new Point( SIZE * 0.5,  SIZE * 0.5, -SIZE * 0.5)
        ];
        var point = new Point(0, 0, 0);

        function animate() {
            for (var i = 0; i < 5000; i++) {
                point = point.add(vertices[Math.random() * 4 >> 0]).scale(0.5);
                render(context, camera, point, 50000);
            }
            window.requestAnimationFrame(animate);
        }

        animate();
    }

    function render(context, camera, point, intensity) {
        var projected = camera.project(point);
        if (projected) {
            var brightness = Math.min(1.0, intensity / Math.pow(projected.z, 2)),
                pixel      = context.getImageData(Math.floor(projected.x), Math.floor(projected.y), 1, 1);
            if (pixel.data[3] != 255 || brightness > pixel.data[0] / 255) {
                var bStr = Math.floor(brightness * 255).toString();
                context.fillStyle = "rgb(" + bStr + "," + bStr + "," + bStr + ")";
                context.fillRect(Math.floor(projected.x), Math.floor(projected.y), 1, 1);
            }
        }
    }

    window.onload = function () {
        canvas = window.document.createElement("canvas");
        canvas.width  = WIDTH;
        canvas.height = HEIGHT;
        canvas.style.backgroundColor = "#000000";
        window.document.getElementById("canvas-wrapper").appendChild(canvas);
        
        main();
    }
})();
