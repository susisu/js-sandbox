// @flow

import { Stack } from "immutable";

import type { Kind } from "./kind.js";
import type { Type } from "./ixtype.js";
import type { Term } from "./ixterm.js";

export class Binding {
  constructor() {
  }
}

export class TyVarBind extends Binding {
  kind: Kind;
  type: ?Type;

  constructor(kind: Kind, type: ?Type) {
    super();
    this.kind = kind;
    this.type = type;
  }
}

export class TmVarBind extends Binding {
  type: Type;
  term: ?Term;

  constructor(type: Type, term: ?Term) {
    super();
    this.type = type;
    this.term = term;
  }
}

export type Context = Stack<Binding>;

export function emptyContext(): Context {
  return new Stack();
}

export function getTyVarBinding(ctx: Context, index: number): ?TyVarBind {
  const bind = ctx.get(index);
  return bind instanceof TyVarBind ? bind : undefined;
}

export function getTmVarBinding(ctx: Context, index: number): ?TmVarBind {
  const bind = ctx.get(index);
  return bind instanceof TmVarBind ? bind : undefined;
}
