// @flow

import { Stack } from "immutable";

import type { Kind } from "./kind.js";
import type { Type } from "./type.js";
import type { Term } from "./term.js";

export class Binding {
  name: string;

  constructor(name: string) {
    this.name = name;
  }
}

export class TyVarBind extends Binding {
  kind: Kind;
  type: ?Type;

  constructor(name: string, kind: Kind, type: ?Type) {
    super(name);
    this.kind = kind;
    this.type = type;
  }
}

export class TmVarBind extends Binding {
  type: Type;
  term: ?Term;

  constructor(name: string, type: Type, term: ?Term) {
    super(name);
    this.type = type;
    this.term = term;
  }
}

export type Context = Stack<Binding>;

export function emptyContext(): Context {
  return new Stack();
}

export function findTyVarIndex(ctx: Context, name: string): number {
  return ctx.findIndex(bind => bind instanceof TyVarBind && bind.name === name);
}

export function findTmVarIndex(ctx: Context, name: string): number {
  return ctx.findIndex(bind => bind instanceof TmVarBind && bind.name === name);
}

export function findTyVarBinding(ctx: Context, name: string): ?TyVarBind {
  const bind = ctx.find(bind => bind instanceof TyVarBind && bind.name === name);
  return bind instanceof TyVarBind ? bind : undefined;
}

export function findTmVarBinding(ctx: Context, name: string): ?TmVarBind {
  const bind = ctx.find(bind => bind instanceof TmVarBind && bind.name === name);
  return bind instanceof TmVarBind ? bind : undefined;
}

export function getTyVarBinding(ctx: Context, index: number): ?TyVarBind {
  const bind = ctx.get(index);
  return bind instanceof TyVarBind ? bind : undefined;
}

export function getTmVarBinding(ctx: Context, index: number): ?TmVarBind {
  const bind = ctx.get(index);
  return bind instanceof TmVarBind ? bind : undefined;
}
