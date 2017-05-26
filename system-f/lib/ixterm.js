// @flow

import { Stack } from "immutable";

import type { Showable } from "./common.js";
import { Term as OrigTerm } from "./term.js";
import { Type } from "./ixtype.js";

export class Term {
  pos: Showable;
  orig: ?OrigTerm;

  constructor(pos: Showable, orig: ?OrigTerm) {
    this.pos  = pos;
    this.orig = orig;
  }

  toString(): string {
    throw new Error("not implemented");
  }

  shift(c: number, d: number): Term {
    throw new Error("not implemented");
  }

  subst(index: number, term: Term): Term {
    throw new Error("not implemented");
  }

  substType(index: number, type: Type): Term {
    throw new Error("not implemented");
  }
}

export class TmVar extends Term {
  index: number;

  constructor(pos: Showable, orig: ?OrigTerm, index: number) {
    super(pos, orig);
    this.index = index;
  }

  toString(): string {
    return this.index.toString();
  }

  shift(c: number, d: number): Term {
    return this.index >= c
      ? new TmVar(this.pos, this.orig, this.index + d)
      : this;
  }

  subst(index: number, term: Term): Term {
    return this.index === index
      ? term
      : this;
  }

  substType(index: number, type: Type): Term {
    return this;
  }
}

export class TmAbs extends Term {
  paramType: Type;
  body: Term;

  constructor(pos: Showable, orig: ?OrigTerm, paramType: Type, body: Term) {
    super(pos, orig);
    this.paramType = paramType;
    this.body      = body;
  }

  toString(): string {
    return "fun: " + this.paramType.toString()
      + ". " + this.body.toString();
  }

  shift(c: number, d: number): Term {
    return new TmAbs(
      this.pos,
      this.orig,
      this.paramType.shift(c, d),
      this.body.shift(c + 1, d)
    );
  }

  subst(index: number, term: Term): Term {
    return new TmAbs(
      this.pos,
      this.orig,
      this.paramType,
      this.body.subst(index + 1, term.shift(0, 1))
    );
  }

  substType(index: number, type: Type): Term {
    return new TmAbs(
      this.pos,
      this.orig,
      this.paramType.subst(index, type),
      this.body.substType(index + 1, type.shift(0, 1))
    );
  }
}

export class TmApp extends Term {
  func: Term;
  arg: Term;

  constructor(pos: Showable, orig: ?OrigTerm, func: Term, arg: Term) {
    super(pos, orig);
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

  shift(c: number, d: number): Term {
    return new TmApp(
      this.pos,
      this.orig,
      this.func.shift(c, d),
      this.arg.shift(c, d)
    );
  }

  subst(index: number, term: Term): Term {
    return new TmApp(
      this.pos,
      this.orig,
      this.func.subst(index, term),
      this.arg.subst(index, term)
    );
  }

  substType(index: number, type: Type): Term {
    return new TmApp(
      this.pos,
      this.orig,
      this.func.substType(index, type),
      this.arg.substType(index, type)
    );
  }
}

export class TmTyAbs extends Term {
  body: Term;

  constructor(pos: Showable, orig: ?OrigTerm, body: Term) {
    super(pos, orig);
    this.body = body;
  }

  toString(): string {
    return "Fun. " + this.body.toString();
  }

  shift(c: number, d: number): Term {
    return new TmTyAbs(
      this.pos,
      this.orig,
      this.body.shift(c + 1, d)
    );
  }

  subst(index: number, term: Term): Term {
    return new TmTyAbs(
      this.pos,
      this.orig,
      this.body.subst(index + 1, term.shift(0, 1))
    );
  }

  substType(index: number, type: Type): Term {
    return new TmTyAbs(
      this.pos,
      this.orig,
      this.body.substType(index + 1, type.shift(0, 1))
    );
  }
}

export class TmTyApp extends Term {
  func: Term;
  arg: Type;

  constructor(pos: Showable, orig: ?OrigTerm, func: Term, arg: Type) {
    super(pos, orig);
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

  shift(c: number, d: number): Term {
    return new TmTyApp(
      this.pos,
      this.orig,
      this.func.shift(c, d),
      this.arg.shift(c, d)
    );
  }

  subst(index: number, term: Term): Term {
    return new TmTyApp(
      this.pos,
      this.orig,
      this.func.subst(index, term),
      this.arg
    );
  }

  substType(index: number, type: Type): Term {
    return new TmTyApp(
      this.pos,
      this.orig,
      this.func.substType(index, type),
      this.arg.subst(index, type)
    );
  }
}

// bindings and context
export class Binding {
  constructor() {
  }
}

export class TyBinding extends Binding {
  constructor() {
    super();
  }
}

export class TmBinding extends Binding {
  type: Type;

  constructor(type: Type) {
    super();
    this.type = type;
  }
}

export type Context = Stack<Binding>;

export function emptyContext(): Context {
  return new Stack();
}
