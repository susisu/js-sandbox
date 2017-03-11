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

    static of(object) {
        if (object instanceof TweenPreset) {
            return object;
        }
        else if (Array.isArray(object)) {
            return new TweenPreset(object[0], object[1]);
        }
        else {
            return new TweenPreset(object.startTime, object.tween);
        }
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
