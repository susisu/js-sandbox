// @flow

import type { Showable } from "./common.js";

export class Term {
  pos: Showable;

  constructor(pos: Showable) {
    this.pos = pos;
  }

  toString(): string {
    throw new Error("not implemented");
  }

  contains(name: string): boolean {
    throw new Error("not implemented");
  }
}

export class TmVar extends Term {
  name: string;

  constructor(pos: Showable, name: string) {
    super(pos);
    this.name = name;
  }

  toString(): string {
    return this.name;
  }

  contains(name: string): boolean {
    return this.name === name;
  }
}

export class TmAbs extends Term {
  paramName: string;
  paramType: Term;
  body: Term;

  constructor(pos: Showable, paramName: string, paramType: Term, body: Term) {
    super(pos);
    this.paramName = paramName;
    this.paramType = paramType;
    this.body      = body;
  }

  toString(): string {
    return "fun " + this.paramName
      + " : " + this.paramType.toString()
      + ". " + this.body.toString();
  }

  contains(name: string): boolean {
    return this.paramType.contains(name)
      || (this.paramName !== name && this.body.contains(name));
  }
}

export class TmApp extends Term {
  func: Term;
  arg: Term;

  constructor(pos: Showable, func: Term, arg: Term) {
    super(pos);
    this.func = func;
    this.arg  = arg;
  }

  toString(): string {
    const funcStr = this.func instanceof TmVar || this.func instanceof TmApp
      || this.func instanceof TmProp || this.func instanceof TmType
      ? this.func.toString()
      : "(" + this.func.toString() + ")";
    const argStr = this.arg instanceof TmVar
      || this.func instanceof TmProp || this.func instanceof TmType
      ? this.arg.toString()
      : "(" + this.arg.toString() + ")";
    return funcStr + " " + argStr;
  }

  contains(name: string): boolean {
    return this.func.contains(name) || this.arg.contains(name);
  }
}

export class TmProd extends Term {
  paramName: string;
  paramType: Term;
  body: Term;

  constructor(pos: Showable, paramName: string, paramType: Term, body: Term) {
    super(pos);
    this.paramName = paramName;
    this.paramType = paramType;
    this.body      = body;
  }

  toString(): string {
    if (this.body.contains(this.paramName)) {
      return "forall " + this.paramName
        + " : " + this.paramType.toString()
        + ". " + this.body.toString();
    }
    else {
      const domStr = this.paramType instanceof TmVar
        || this.paramType instanceof TmProp || this.paramType instanceof TmType
        ? this.paramType.toString()
        : "(" + this.paramType.toString() + ")";
      return domStr + " -> " + this.body.toString();
    }
  }

  contains(name: string): boolean {
    return this.paramType.contains(name)
      || (this.paramName !== name && this.body.contains(name));
  }
}

export class TmProp extends Term {
  constructor(pos: Showable) {
    super(pos);
  }

  toString(): string {
    return "*";
  }

  contains(name: string): boolean {
    return false;
  }
}

export class TmType extends Term {
  constructor(pos: Showable) {
    super(pos);
  }

  toString(): string {
    return "#";
  }

  contains(name: string): boolean {
    return false;
  }
}
