// @flow

import { Type } from "./type.js";

export class Term {
  constructor() {
  }

  toString(): string {
    throw new Error("not implemented");
  }
}

export class TmVar extends Term {
  name: string;

  constructor(name: string) {
    super();
    this.name = name;
  }

  toString(): string {
    return this.name;
  }
}

export class TmAbs extends Term {
  param: string;
  paramType: Type;
  body: Term;

  constructor(param: string, paramType: Type, body: Term) {
    super();
    this.param     = param;
    this.paramType = paramType;
    this.body      = body;
  }

  toString(): string {
    return "λ" + this.param + " : " + this.paramType.toString() + ". " + this.body.toString();
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
  param: string;
  body: Term;

  constructor(param: string, body: Term) {
    super();
    this.param = param;
    this.body  = body;
  }

  toString(): string {
    return "Λ" + this.param + ". " + this.body.toString();
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
