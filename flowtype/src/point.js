// @flow

export class Point {
  x : number;
  y : number;
  constructor(x : number, y : number) {
    this.x = x;
    this.y = y;
  }
}

export function genPointClass() {
  return class P {
    x : number;
    y : number;
    constructor(x : number, y : number) {
      this.x = x;
      this.y = y;
    }
  }
}
