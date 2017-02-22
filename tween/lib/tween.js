"use strict";

class Tween {
    constructor(duration, initialize, animate, finalize, ease) {
        this.duration   = duration;
        this.initialize = initialize;
        this.animate    = animate;
        this.finalize   = finalize;
        this.ease       = ease;
    }
}
