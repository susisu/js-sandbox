"use strict";

/*
TODO: arguments
interface Event {
  initialize();
  finalize();
  update();
}
*/

class Tween {
  constructor(initialize, finalize, duration, animate, ease) {
    this._initialize = initialize;
    this._finalize   = finalize;
    this._duration   = duration;
    this._animate    = animate;
    this._ease       = ease;
  }

  initialize() {
    return this._initialize.call(undefined);
  }

  finalize() {
    return this._finalize.call(undefined);
  }

  update(time, context) {
    if (time >= this._duration) {
      return true;
    }
    const degree = this.ease.call(undefined, time / this._duration);
    return this._animate.call(undefined, degree, context);
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
    this.event.initialize.call(undefined, this.context);
  }

  update(time) {
    this.event.update.call(undefined, time - this.startTime, this.context);
  }

  finalize() {
    this.event.finalize.call(undefined, this.context);
  }
}

class Timeline {
  constructor() {
    this._currentTime = 0;
    this._presets     = [];
    this._instances   = new Set();
  }

  get currentTime() {
    return this._currentTime;
  }

  add(eventOrPreset, startTime) {
    const preset = eventOrPreset instanceof Event
      ? new EventPreset(
        startTime !== undefined ? startTime : this._currentTime,
        eventOrPreset
      )
      : EventPreset.of(eventOrPreset);
    // TODO: binary search?
    for (let i = 0; i < this._presets.length; i++) {
      if (this._presets[i].startTime > preset.startTime) {
        this._presets.splice(i, 0, preset);
        break;
      }
      if (i === this._presets.length - 1) {
        this._presets.push(preset);
      }
    }
  }
}
