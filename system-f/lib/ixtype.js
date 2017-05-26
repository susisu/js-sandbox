// @flow

export class Type {
  constructor() {
  }

  toString(): string {
    throw new Error("not implemented");
  }
}

export class TyVar extends Type {
  index: number;

  constructor(index: number) {
    super();
    this.index = index;
  }

  toString(): string {
    return this.index.toString();
  }
}

export class TyArr extends Type {
  dom: Type;
  codom: Type;

  constructor(dom: Type, codom: Type) {
    super();
    this.dom   = dom;
    this.codom = codom;
  }

  toString(): string {
    const domStr = this.dom instanceof TyVar
      ? this.dom.toString()
      : "(" + this.dom.toString() + ")";
    return domStr + " -> " + this.codom.toString();
  }
}

export class TyAll extends Type {
  body: Type;

  constructor(body: Type) {
    super();
    this.body = body;
  }

  toString(): string {
    return "forall. " + this.body.toString();
  }
}
