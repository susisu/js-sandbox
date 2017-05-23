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
  paramName: string;
  body: Type;

  constructor(paramName: string, body: Type) {
    super();
    this.paramName = paramName;
    this.body      = body;
  }

  toString(): string {
    return "∀" + this.paramName + ". " + this.body.toString();
  }
}
