"use strict";

class Tween {
    constructor(initialize, animate, finalize, ease) {
        this.initialize = initialize;
        this.animate    = animate;
        this.finalize   = finalize;
        this.ease       = ease;
    }
}

class TweenInstance {
    constructor(startTime, tween) {
        this.startTime = startTime;
        this.tween     = tween;
        this.context   = {};
    }
}

class Timeline {
    constructor() {
        this._currentTime = 0;
        this._pendingInstances = new Map();
        this._activeInstances  = new Map();
    }

    get currentTime() {
        return this._currentTime;
    }
}
