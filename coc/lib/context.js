// @flow

import { Stack } from "immutable";
import type { Term } from "./term.js";

export class Binding {
  name: string;
  type: Term;
  term: ?Term;

  constructor(name: string, type: Term, term: ?Term) {
    this.name = name;
    this.type = type;
    this.term = term;
  }
}

export type Context = Stack<Binding>;

export function emptyContext(): Context {
  return new Stack();
}

export function findIndex(ctx: Context, name: string): number {
  return ctx.findIndex(bind => bind.name === name);
}

export function findBinding(ctx: Context, name: string): ?Binding {
  return ctx.find(bind => bind.name === name) || undefined;
}

export function getBinding(ctx: Context, index: number): Binding {
  return ctx.get(index) || undefined;
}
