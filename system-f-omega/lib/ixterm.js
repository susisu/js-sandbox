// @flow

import type { Showable } from "./common.js";
import type { Kind } from "./kind.js";
import type { Type } from "./ixtype.js";

export class Term {
  pos: Showable;

  constructor(pos: Showable) {
    this.pos = pos;
  }

  toString(): string {
    throw new Error("not implemented");
  }

  shift(cutoff: number, distance: number): Term {
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

  constructor(pos: Showable, index: number) {
    super(pos);
    this.index = index;
  }

  toString(): string {
    return this.index.toString();
  }

  shift(cutoff: number, distance: number): Term {
    return this.index >= cutoff
      ? new TmVar(this.pos, this.index + distance)
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

  constructor(pos: Showable, paramType: Type, body: Term) {
    super(pos);
    this.paramType = paramType;
    this.body      = body;
  }

  toString(): string {
    return "fun : " + this.paramType.toString()
      + ". " + this.body.toString();
  }

  shift(cutoff: number, distance: number): Term {
    return new TmAbs(
      this.pos,
      this.paramType.shift(cutoff, distance),
      this.body.shift(cutoff + 1, distance)
    );
  }

  subst(index: number, term: Term): Term {
    return new TmAbs(
      this.pos,
      this.paramType,
      this.body.subst(index + 1, term.shift(0, 1))
    );
  }

  substType(index: number, type: Type): Term {
    return new TmAbs(
      this.pos,
      this.paramType.subst(index, type),
      this.body.substType(index + 1, type.shift(0, 1))
    );
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

  shift(cutoff: number, distance: number): Term {
    return new TmApp(
      this.pos,
      this.func.shift(cutoff, distance),
      this.arg.shift(cutoff, distance)
    );
  }

  subst(index: number, term: Term): Term {
    return new TmApp(
      this.pos,
      this.func.subst(index, term),
      this.arg.subst(index, term)
    );
  }

  substType(index: number, type: Type): Term {
    return new TmApp(
      this.pos,
      this.func.substType(index, type),
      this.arg.substType(index, type)
    );
  }
}

export class TmTyAbs extends Term {
  paramKind: Kind;
  body: Term;

  constructor(pos: Showable, paramKind: Kind, body: Term) {
    super(pos);
    this.paramKind = paramKind;
    this.body      = body;
  }

  toString(): string {
    return "fun :: " + this.paramKind.toString()
      + ". " + this.body.toString();
  }

  shift(cutoff: number, distance: number): Term {
    return new TmTyAbs(
      this.pos,
      this.paramKind,
      this.body.shift(cutoff + 1, distance)
    );
  }

  subst(index: number, term: Term): Term {
    return new TmTyAbs(
      this.pos,
      this.paramKind,
      this.body.subst(index + 1, term.shift(0, 1))
    );
  }

  substType(index: number, type: Type): Term {
    return new TmTyAbs(
      this.pos,
      this.paramKind,
      this.body.substType(index + 1, type.shift(0, 1))
    );
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

  shift(cutoff: number, distance: number): Term {
    return new TmTyApp(
      this.pos,
      this.func.shift(cutoff, distance),
      this.arg.shift(cutoff, distance)
    );
  }

  subst(index: number, term: Term): Term {
    return new TmTyApp(
      this.pos,
      this.func.subst(index, term),
      this.arg
    );
  }

  substType(index: number, type: Type): Term {
    return new TmTyApp(
      this.pos,
      this.func.substType(index, type),
      this.arg.subst(index, type)
    );
  }
}
