// @flow

import { Type } from "./ixtype.js";

export class Term {
  constructor() {
  }

  toString(): string {
    throw new Error("not implemented");
  }
}

export class TmVar extends Term {
  index: number;

  constructor(index: number) {
    super();
    this.index = index;
  }

  toString(): string {
    return this.index.toString();
  }
}

export class TmAbs extends Term {
  paramType: Type;
  body: Term;

  constructor(paramType: Type, body: Term) {
    super();
    this.paramType = paramType;
    this.body      = body;
  }

  toString(): string {
    return "fun: " + this.paramType.toString()
      + ". " + this.body.toString();
  }
}

export class TmApp extends Term {
  func: Term;
  arg: Term;

  constructor(func: Term, arg: Term) {
    super();
    this.func = func;
    this.arg  = arg;
  }

  toString(): string {
    const funcStr
      = this.func instanceof TmVar || this.func instanceof TmApp || this.func instanceof TmTyApp
      ? this.func.toString()
      : "(" + this.func.toString() + ")";
    const argStr = this.arg instanceof TmVar
      ? this.arg.toString()
      : "(" + this.arg.toString() + ")";
    return funcStr + " " + argStr;
  }
}

export class TmTyAbs extends Term {
  body: Term;

  constructor(body: Term) {
    super();
    this.body = body;
  }

  toString(): string {
    return "Fun. " + this.body.toString();
  }
}

export class TmTyApp extends Term {
  func: Term;
  arg: Type;

  constructor(func: Term, arg: Type) {
    super();
    this.func = func;
    this.arg  = arg;
  }

  toString(): string {
    const funcStr
      = this.func instanceof TmVar || this.func instanceof TmApp || this.func instanceof TmTyApp
      ? this.func.toString()
      : "(" + this.func.toString() + ")";
    return funcStr + " [" + this.arg.toString() + "]";
  }
}
