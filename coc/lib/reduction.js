// @flow

import {
  Term,
  TmVar,
  TmAbs,
  TmApp,
  TmProd,
  TmProp
} from "./ixterm.js";
import {
  Binding,
  type Context,
  getBinding
} from "./ixcontext.js";

export function weakReduce(ctx: Context, term: Term): Term {
  if (term instanceof TmVar) {
    const bind = getBinding(ctx, term.index);
    if (!(bind instanceof Binding)) {
      throw new Error("binding not found");
    }
    if (bind.term instanceof Term) {
      const newTerm = bind.term.shift(0, term.index + 1);
      return weakReduce(ctx, newTerm);
    }
    else {
      return term;
    }
  }
  else if (term instanceof TmAbs) {
    return term;
  }
  else if (term instanceof TmApp) {
    const func = weakReduce(ctx, term.func);
    const arg  = weakReduce(ctx, term.arg);
    if (func instanceof TmAbs) {
      const newTerm = func.body.subst(0, arg.shift(0, 1)).shift(1, -1);
      return weakReduce(ctx, newTerm);
    }
    else {
      return new TmApp(term.pos, func, arg);
    }
  }
  else if (term instanceof TmProd) {
    return term;
  }
  else if (term instanceof TmProp) {
    return term;
  }
  else {
    throw new Error(`unknown term: ${term.toString()}`);
  }
}

export function reduce(ctx: Context, term: Term): Term {
  if (term instanceof TmVar) {
    const bind = getBinding(ctx, term.index);
    if (!(bind instanceof Binding)) {
      throw new Error("binding not found");
    }
    if (bind.term instanceof Term) {
      const newTerm = bind.term.shift(0, term.index + 1);
      return reduce(ctx, newTerm);
    }
    else {
      return term;
    }
  }
  else if (term instanceof TmAbs) {
    const paramType = reduce(ctx, term.paramType);
    const bind      = new Binding(term.paramType);
    const body      = reduce(ctx.unshift(bind), term.body);
    return new TmAbs(term.pos, paramType, body);
  }
  else if (term instanceof TmApp) {
    const func = reduce(ctx, term.func);
    const arg  = reduce(ctx, term.arg);
    if (func instanceof TmAbs) {
      const newTerm = func.body.subst(0, arg.shift(0, 1)).shift(1, -1);
      return reduce(ctx, newTerm);
    }
    else {
      return new TmApp(term.pos, func, arg);
    }
  }
  else if (term instanceof TmProd) {
    const paramType = reduce(ctx, term.paramType);
    const bind      = new Binding(term.paramType);
    const body      = reduce(ctx.unshift(bind), term.body);
    return new TmProd(term.pos, paramType, body);
  }
  else if (term instanceof TmProp) {
    return term;
  }
  else {
    throw new Error(`unknown term: ${term.toString()}`);
  }
}
