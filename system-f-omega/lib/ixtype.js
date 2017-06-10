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

  equals(type: Type): boolean {
    throw new Error("not implemented");
  }

  shift(cutoff: number, distance: number): Type {
    throw new Error("not implemented");
  }

  subst(index: number, type: Type): Type {
    throw new Error("not implemented");
  }
}

export class TyVar extends Type {
  index: number;

  constructor(pos: Showable, index: number) {
    super(pos);
    this.index = index;
  }

  toString(): string {
    return this.index.toString();
  }

  equals(type: Type): boolean {
    return type instanceof TyVar
      && this.index === type.index;
  }

  shift(cutoff: number, distance: number): Type {
    return this.index >= cutoff
      ? new TyVar(this.pos, this.index + distance)
      : this;
  }

  subst(index: number, type: Type): Type {
    return this.index === index
      ? type
      : this;
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

  equals(type: Type): boolean {
    return type instanceof TyArr
      && this.dom.equals(type.dom)
      && this.codom.equals(type.codom);
  }

  shift(cutoff: number, distance: number): Type {
    return new TyArr(
      this.pos,
      this.dom.shift(cutoff, distance),
      this.codom.shift(cutoff, distance)
    );
  }

  subst(index: number, type: Type): Type {
    return new TyArr(
      this.pos,
      this.dom.subst(index, type),
      this.codom.subst(index, type)
    );
  }
}

export class TyAll extends Type {
  paramKind: Kind;
  body: Type;

  constructor(pos: Showable, paramKind: Kind, body: Type) {
    super(pos);
    this.paramKind = paramKind;
    this.body      = body;
  }

  toString(): string {
    return "forall:: " + this.paramKind.toString()
      + ". " + this.body.toString();
  }

  equals(type: Type): boolean {
    return type instanceof TyAll
      && this.paramKind.equals(type.paramKind)
      && this.body.equals(type.body);
  }

  shift(cutoff: number, distance: number): Type {
    return new TyAll(
      this.pos,
      this.paramKind,
      this.body.shift(cutoff + 1, distance)
    );
  }

  subst(index: number, type: Type): Type {
    return new TyAll(
      this.pos,
      this.paramKind,
      this.body.subst(index + 1, type.shift(0, 1))
    );
  }
}

export class TyAbs extends Type {
  paramKind: Kind;
  body: Type;

  constructor(pos: Showable, paramKind: Kind, body: Type) {
    super(pos);
    this.paramKind = paramKind;
    this.body      = body;
  }

  toString(): string {
    return "fun:: " + this.paramKind.toString()
      + ". " + this.body.toString();
  }

  equals(type: Type): boolean {
    return type instanceof TyAbs
      && this.paramKind.equals(type.paramKind)
      && this.body.equals(type.body);
  }

  shift(cutoff: number, distance: number): Type {
    return new TyAbs(
      this.pos,
      this.paramKind,
      this.body.shift(cutoff + 1, distance)
    );
  }

  subst(index: number, type: Type): Type {
    return new TyAbs(
      this.pos,
      this.paramKind,
      this.body.subst(index + 1, type.shift(0, 1))
    );
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

  equals(type: Type): boolean {
    return type instanceof TyApp
      && this.func.equals(type.func)
      && this.arg.equals(type.arg);
  }

  shift(cutoff: number, distance: number): Type {
    return new TyApp(
      this.pos,
      this.func.shift(cutoff, distance),
      this.arg.shift(cutoff, distance)
    );
  }

  subst(index: number, type: Type): Type {
    return new TyApp(
      this.pos,
      this.func.subst(index, type),
      this.arg.subst(index, type)
    );
  }
}
