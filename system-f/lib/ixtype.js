// @flow

import type { Showable } from "./common.js";
import { Type as OrigType } from "./type.js";

export class Type {
  pos: Showable;
  orig: ?OrigType;

  constructor(pos: Showable, orig: ?OrigType) {
    this.pos  = pos;
    this.orig = orig;
  }

  toString(): string {
    throw new Error("not implemented");
  }

  shift(c: number, d: number): Type {
    throw new Error("not implemented");
  }

  subst(index: number, type: Type): Type {
    throw new Error("not implemented");
  }

  equals(type: Type): boolean {
    throw new Error("not implemented");
  }
}

export class TyVar extends Type {
  index: number;

  constructor(pos: Showable, orig: ?OrigType, index: number) {
    super(pos, orig);
    this.index = index;
  }

  toString(): string {
    return this.index.toString();
  }

  shift(c: number, d: number): Type {
    return this.index >= c
      ? new TyVar(this.pos, this.orig, this.index + d)
      : this;
  }

  subst(index: number, type: Type): Type {
    return this.index === index
      ? type
      : this;
  }

  equals(type: Type): boolean {
    return type instanceof TyVar
      && this.index === type.index;
  }
}

export class TyArr extends Type {
  dom: Type;
  codom: Type;

  constructor(pos: Showable, orig: ?OrigType, dom: Type, codom: Type) {
    super(pos, orig);
    this.dom   = dom;
    this.codom = codom;
  }

  toString(): string {
    const domStr = this.dom instanceof TyVar
      ? this.dom.toString()
      : "(" + this.dom.toString() + ")";
    return domStr + " -> " + this.codom.toString();
  }

  shift(c: number, d: number): Type {
    return new TyArr(
      this.pos,
      this.orig,
      this.dom.shift(c, d),
      this.codom.shift(c, d)
    );
  }

  subst(index: number, type: Type): Type {
    return new TyArr(
      this.pos,
      this.orig,
      this.dom.subst(index, type),
      this.codom.subst(index, type)
    );
  }

  equals(type: Type): boolean {
    return type instanceof TyArr
      && this.dom.equals(type.dom) && this.codom.equals(type.codom);
  }
}

export class TyAll extends Type {
  body: Type;

  constructor(pos: Showable, orig: ?OrigType, body: Type) {
    super(pos, orig);
    this.body = body;
  }

  toString(): string {
    return "forall. " + this.body.toString();
  }

  shift(c: number, d: number): Type {
    return new TyAll(
      this.pos,
      this.orig,
      this.body.shift(c + 1, d)
    );
  }

  subst(index: number, type: Type): Type {
    return new TyAll(
      this.pos,
      this.orig,
      this.body.subst(index + 1, type.shift(0, 1))
    );
  }

  equals(type: Type): boolean {
    return type instanceof TyAll
      && this.body.equals(type.body);
  }
}
