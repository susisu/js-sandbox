// @flow

import { Stack } from "immutable";

import type { Kind } from "./kind.js";
import type { Type } from "./ixtype.js";
import type { Term } from "./ixterm.js";

export class Binding {
  name: string;

  constructor(name: string) {
    this.name = name;
  }
}

export class TyVarBind extends Binding {
  kind: Kind;

  constructor(name: string, kind: Kind) {
    super(name);
    this.kind = kind;
  }
}

export class TmVarBind extends Binding {
  type: Type;

  constructor(name: string, type: Type) {
    super(name);
    this.type = type;
  }
}

export class TyAbbrBind extends TyVarBind {
  type: Type;

  constructor(name: string, kind: Kind, type: Type) {
    super(name, kind);
    this.type = type;
  }
}

export class TmAbbrBind extends TmVarBind {
  term: Term;

  constructor(name: string, type: Type, term: Term) {
    super(name, type);
    this.term = term;
  }
}

export type Context = Stack<Binding>;
