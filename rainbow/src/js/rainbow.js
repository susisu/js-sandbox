(function () {
    var SHORT_PEAK     = 420;
    var SHORT_WIDTH    = 30;

    var MEDIUM_PEAK     = 530;
    var MEDIUM_WIDTH    = 40;

    var LONG_PEAK     = 560;
    var LONG_WIDTH    = 40;

    function shortResponse(waveLength) {
        return Math.exp(-Math.pow((waveLength - SHORT_PEAK) / SHORT_WIDTH, 2) * 0.5);
    }

    function mediumResponse(waveLength) {
        return Math.exp(-Math.pow((waveLength - MEDIUM_PEAK) / MEDIUM_WIDTH, 2) * 0.5);
    }

    function longResponse(waveLength) {
        return Math.exp(-Math.pow((waveLength - LONG_PEAK) / LONG_WIDTH, 2) * 0.5);
    }

    function rgbResponse(waveLength, strength) {
        var b = Math.floor(255 * strength * shortResponse(waveLength));
        var g = Math.floor(255 * strength * mediumResponse(waveLength));
        var r = Math.floor(255 * strength * longResponse(waveLength));
        return [r, g, b];
    }

    window.onload = function () {
        var canvas = window.document.createElement("canvas");
        canvas.height = 240;
        canvas.width = 800 - 300;
        canvas.style.backgroundColor = "#000000";
        window.document.getElementById("canvas-wrapper").appendChild(canvas);

        var context = canvas.getContext("2d");
        for (var l = 300; l < 800; l++) {
            var color = rgbResponse(l, 1.0);
            context.fillStyle = "rgb(" + color.toString() + ")";
            context.fillRect(l - 300, 0, 1, 240);
        }
    };
})();
