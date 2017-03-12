"use strict";

class Event {
    constructor(initialize, finalize, update) {
        this.initialize = initialize;
        this.finalize   = finalize;
        this.update     = update;
    }
}

class EventPreset {
    constructor(startTime, event) {
        this.startTime = startTime;
        this.event     = event;
    }

    static of(object) {
        if (object instanceof EventPreset) {
            return object;
        }
        else if (Array.isArray(object)) {
            return new EventPreset(object[0], object[1]);
        }
        else {
            return new EventPreset(object.startTime, object.event);
        }
    }
}

class EventInstance {
    constructor(startTime, event) {
        this.startTime = startTime;
        this.event     = event;
        this.context   = {};
    }

    static fromPreset(preset) {
        return new EventInstance(preset.startTime, preset.event);
    }

    initialize() {
        this.event.initialize.call(this.context, this.context);
    }

    update(time) {
        this.event.update.call(this.context, time - this.startTime, this.context);
    }

    finalize() {
        this.event.finalize.call(this.context, this.context);
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
