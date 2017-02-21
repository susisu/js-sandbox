"use strict";

class Tween {
  constructor(startTime, endTime, initialize, animate, finalize, easing) {
      this.startTime  = startTime;
      this.endTime    = endTime;
      this.initialize = initialize;
      this.animate    = animate;
      this.finalize   = finalize;
      this.ease       = ease;
  }

  get duration() {
      return this.endTime - this.startTime;
  }
}
