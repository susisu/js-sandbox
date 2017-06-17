// @flow

import { Stack } from "immutable";
import type { Term } from "./ixterm.js";

export class Binding {
  type: Term;
  term: ?Term;

  constructor(type: Term, term: ?Term) {
    this.type = type;
    this.term = term;
  }
}

export type Context = Stack<Binding>;

export function emptyContext(): Context {
  return new Stack();
}

export function getBinding(ctx: Context, index: number): Binding {
  return ctx.get(index) || undefined;
}
