// @flow

import type { Showable } from "./common.js";
import type { Kind } from "./kind.js";

export class Type {
  pos: Showable;

  constructor(pos: Showable) {
    this.pos = pos;
  }

  toString(): string {
    throw new Error("not implemented");
  }
}

export class TyVar extends Type {
  name: string;

  constructor(pos: Showable, name: string) {
    super(pos);
    this.name = name;
  }

  toString(): string {
    return this.name;
  }
}

export class TyArr extends Type {
  dom: Type;
  codom: Type;

  constructor(pos: Showable, dom: Type, codom: Type) {
    super(pos);
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
  paramName: string;
  paramKind: Kind;
  body: Type;

  constructor(pos: Showable, paramName: string, paramKind: Kind, body: Type) {
    super(pos);
    this.paramName = paramName;
    this.paramKind = paramKind;
    this.body      = body;
  }

  toString(): string {
    return "forall " + this.paramName
      + " :: " + this.paramKind.toString()
      + ". " + this.body.toString();
  }
}

export class TyAbs extends Type {
  paramName: string;
  paramKind: Kind;
  body: Type;

  constructor(pos: Showable, paramName: string, paramKind: Kind, body: Type) {
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

export class TyApp extends Type {
  func: Type;
  arg: Type;

  constructor(pos: Showable, func: Type, arg: Type) {
    super(pos);
    this.func = func;
    this.arg  = arg;
  }

  toString(): string {
    const funcStr
      = this.func instanceof TyVar || this.func instanceof TyApp
      ? this.func.toString()
      : "(" + this.func.toString() + ")";
    const argStr = this.arg instanceof TyVar
      ? this.arg.toString()
      : "(" + this.arg.toString() + ")";
    return funcStr + " " + argStr;
  }
}
