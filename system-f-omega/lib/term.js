// @flow

import type { Showable } from "./common.js";
import type { Kind } from "./kind.js";
import type { Type } from "./type.js";

export class Term {
  pos: Showable;

  constructor(pos: Showable) {
    this.pos = pos;
  }

  toString(): string {
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
}

export class TmAbs extends Term {
  paramName: string;
  paramType: Type;
  body: Term;

  constructor(pos: Showable, paramName: string, paramType: Type, body: Term) {
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
  paramName: string;
  paramKind: Kind;
  body: Term;

  constructor(pos: Showable, paramName: string, paramKind: Kind, body: Term) {
    super(pos);
    this.paramName = paramName;
    this.paramKind = paramKind;
    this.body      = body;
  }

  toString(): string {
    return "fun " + this.paramName
      + " :: " + this.paramKind.toString()
      + ". " + this.body.toString();
  }
}

export class TmTyApp extends Term {
  func: Term;
  arg: Type;

  constructor(pos: Showable, func: Term, arg: Type) {
    super(pos);
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
