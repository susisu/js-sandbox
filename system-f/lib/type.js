// @flow

export class Type {
  constructor() {
  }

  toString(): string {
    throw new Error("not implemented");
  }
}

export class TyVar extends Type {
  name: string;

  constructor(name: string) {
    super();
    this.name = name;
  }

  toString(): string {
    return this.name;
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
    return domStr + " → " + this.codom.toString();
  }
}

export class TyAll extends Type {
  param: string;
  body: Type;

  constructor(param: string, body: Type) {
    super();
    this.param = param;
    this.body  = body;
  }

  toString(): string {
    return "∀" + this.param + ". " + this.body.toString();
  }
}
