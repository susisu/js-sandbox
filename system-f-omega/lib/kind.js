// @flow

import type { Showable } from "./common.js";

export class Kind {
  pos: Showable;

  constructor(pos: Showable) {
    this.pos = pos;
  }

  toString(): string {
    throw new Error("not implemented");
  }
}

export class KnStar extends Kind {
  constructor(pos: Showable) {
    super(pos);
  }

  toString(): string {
    return "*";
  }
}

export class KnArr extends Kind {
  dom: Kind;
  codom: Kind;

  constructor(pos: Showable, dom: Kind, codom: Kind) {
    super(pos);
    this.dom   = dom;
    this.codom = codom;
  }

  toString(): string {
    const domStr = this.dom instanceof KnStar
      ? this.dom.toString()
      : "(" + this.dom.toString() + ")";
    return domStr + " => " + this.codom.toString();
  }
}
