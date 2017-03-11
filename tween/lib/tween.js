"use strict";

class Tween {
    constructor(initialize, animate, finalize) {
        this.initialize = initialize;
        this.animate    = animate;
        this.finalize   = finalize;
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

    static fromPreset(preset) {
        return new TweenInstance(preset.startTime, preset.tween);
    }

    initialize() {
        this.tween.initialize.call(this.context, this.context);
    }

    animate(time) {
        this.tween.animate.call(this.context, time - this.startTime, this.context);
    }

    finalize() {
        this.tween.finalize.call(this.context, this.context);
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
