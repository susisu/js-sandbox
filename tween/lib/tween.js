"use strict";

class Tween {
    constructor(initialize, animate, finalize, ease) {
        this.initialize = initialize;
        this.animate    = animate;
        this.finalize   = finalize;
        this.ease       = ease;
    }
}

class TweenPreset {
    constructor(startTime, tween) {
        this.startTime = startTime;
        this.tween     = tween;
    }

    static of(obj) {
        if (Array.isArray(obj)) {
            return new TweenPreset(obj[0], obj[1]);
        }
        return new TweenPreset(obj.startTime, obj.tween);
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
