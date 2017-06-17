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

  shift(cut: number, dist: number): Term {
    throw new Error("not implemented");
  }

  subst(index: number, term: Term): Term {
    throw new Error("not implemented");
  }

  equals(term: Term): boolean {
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

  shift(cut: number, dist: number): Term {
    return this.index >= cut
      ? new TmVar(this.pos, this.index + dist)
      : this;
  }

  subst(index: number, term: Term): Term {
    return this.index === index
      ? term
      : this;
  }

  equals(term: Term): boolean {
    return term instanceof TmVar
      && this.index === term.index;
  }
}

export class TmAbs extends Term {
  paramType: Term;
  body: Term;

  constructor(pos: Showable, paramType: Term, body: Term) {
    super(pos);
    this.paramType = paramType;
    this.body      = body;
  }

  toString(): string {
    return "fun : " + this.paramType.toString()
      + ". " + this.body.toString();
  }

  shift(cut: number, dist: number): Term {
    return new TmAbs(
      this.pos,
      this.paramType.shift(cut, dist),
      this.body.shift(cut + 1, dist)
    );
  }

  subst(index: number, term: Term): Term {
    return new TmAbs(
      this.pos,
      this.paramType.subst(index, term),
      this.body.subst(index + 1, term.shift(0, 1))
    );
  }

  equals(term: Term): boolean {
    return term instanceof TmAbs
      && this.paramType.equals(term.paramType)
      && this.body.equals(term.body);
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
      ? this.func.toString()
      : "(" + this.func.toString() + ")";
    const argStr = this.arg instanceof TmVar
      ? this.arg.toString()
      : "(" + this.arg.toString() + ")";
    return funcStr + " " + argStr;
  }

  shift(cut: number, dist: number): Term {
    return new TmApp(
      this.pos,
      this.func.shift(cut, dist),
      this.arg.shift(cut, dist)
    );
  }

  subst(index: number, term: Term): Term {
    return new TmApp(
      this.pos,
      this.func.subst(index, term),
      this.arg.subst(index, term)
    );
  }

  equals(term: Term): boolean {
    return term instanceof TmApp
      && this.func.equals(term.func)
      && this.arg.equals(term.arg);
  }
}

export class TmProd extends Term {
  paramType: Term;
  body: Term;

  constructor(pos: Showable, paramType: Term, body: Term) {
    super(pos);
    this.paramType = paramType;
    this.body      = body;
  }

  toString(): string {
    return "(: " + this.paramType.toString()
      + ") -> " + this.body.toString();
  }

  shift(cut: number, dist: number): Term {
    return new TmProd(
      this.pos,
      this.paramType.shift(cut, dist),
      this.body.shift(cut + 1, dist)
    );
  }

  subst(index: number, term: Term): Term {
    return new TmProd(
      this.pos,
      this.paramType.subst(index, term),
      this.body.subst(index + 1, term.shift(0, 1))
    );
  }

  equals(term: Term): boolean {
    return term instanceof TmProd
      && this.paramType.equals(term.paramType)
      && this.body.equals(term.body);
  }
}

export class TmProp extends Term {
  constructor(pos: Showable) {
    super(pos);
  }

  toString(): string {
    return "*";
  }

  shift(cut: number, dist: number): Term {
    return this;
  }

  subst(index: number, term: Term): Term {
    return this;
  }

  equals(term: Term): boolean {
    return term instanceof TmProp;
  }
}

export class TmType extends Term {
  constructor(pos: Showable) {
    super(pos);
  }

  toString(): string {
    return "#";
  }

  shift(cut: number, dist: number): Term {
    return this;
  }

  subst(index: number, term: Term): Term {
    return this;
  }

  equals(term: Term): boolean {
    return term instanceof TmType;
  }
}
