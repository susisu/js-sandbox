// @flow

import {
  generateVarName,
  createReferenceError
} from "./common.js";
import {
  Term,
  TmVar,
  TmAbs,
  TmApp,
  TmProd,
  TmProp
} from "./term.js";
import {
  Binding,
  type Context,
  emptyContext,
  findIndex,
  getBinding
} from "./context.js";
import {
  type Term as IxTerm,
  TmVar as IxTmVar,
  TmAbs as IxTmAbs,
  TmApp as IxTmApp,
  TmProd as IxTmProd,
  TmProp as IxTmProp
} from "./ixterm.js";
import {
  Binding as IxBinding,
  type Context as IxContext,
  emptyContext as emptyIxContext
} from "./ixcontext.js";

export function toIndexedTerm(ctx: Context, term: Term): IxTerm {
  if (term instanceof TmVar) {
    const index = findIndex(ctx, term.name);
    if (index < 0) {
      throw createReferenceError(term.pos, `unbound variable: ${term.name}`);
    }
    return new IxTmVar(term.pos, index);
  }
  else if (term instanceof TmAbs) {
    const paramType = toIndexedTerm(ctx, term.paramType);
    const bind      = new Binding(term.paramName, term.paramType);
    const body      = toIndexedTerm(ctx.unshift(bind), term.body);
    return new IxTmAbs(term.pos, paramType, body);
  }
  else if (term instanceof TmApp) {
    const func = toIndexedTerm(ctx, term.func);
    const arg  = toIndexedTerm(ctx, term.arg);
    return new IxTmApp(term.pos, func, arg);
  }
  else if (term instanceof TmProd) {
    const paramType = toIndexedTerm(ctx, term.paramType);
    const bind      = new Binding(term.paramName, term.paramType);
    const body      = toIndexedTerm(ctx.unshift(bind), term.body);
    return new IxTmProd(term.pos, paramType, body);
  }
  else if (term instanceof TmProp) {
    return new IxTmProp(term.pos);
  }
  else {
    throw new Error(`unknown term: ${term.toString()}`);
  }
}

export function toIndexedBinding(ctx: Context, bind: Binding): IxBinding {
  const type = toIndexedTerm(ctx, bind.type);
  const term = bind.term instanceof Term
    ? toIndexedTerm(ctx, bind.term)
    : undefined;
  return new IxBinding(type, term);
}

export function toIndexedContext(ctx: Context): IxContext {
  return ctx.reduceRight(
    ([ctx, ixctx], bind) => [
      ctx.unshift(bind),
      ixctx.unshift(toIndexedBinding(ctx, bind))
    ],
    [emptyContext(), emptyIxContext()]
  )[1];
}

function _fromIndexedTerm(ctx: Context, id: number, ixterm: IxTerm): [number, Term] {
  if (ixterm instanceof IxTmVar) {
    const bind = getBinding(ctx, ixterm.index);
    if (!(bind instanceof Binding)) {
      throw new Error("binding not found");
    }
    return [id, new TmVar(ixterm.pos, bind.name)];
  }
  else if (ixterm instanceof IxTmAbs) {
    const [id1, paramType] = _fromIndexedTerm(ctx, id, ixterm.paramType);
    const [id2, paramName] = [id1 + 1, generateVarName(id1)];
    const bind             = new Binding(paramName, paramType);
    const [id3, body]      = _fromIndexedTerm(ctx.unshift(bind), id2, ixterm.body);
    return [id3, new TmAbs(ixterm.pos, paramName, paramType, body)];
  }
  else if (ixterm instanceof IxTmApp) {
    const [id1, func] = _fromIndexedTerm(ctx, id, ixterm.func);
    const [id2, arg]  = _fromIndexedTerm(ctx, id1, ixterm.arg);
    return [id2, new TmApp(ixterm.pos, func, arg)];
  }
  else if (ixterm instanceof IxTmProd) {
    const [id1, paramType] = _fromIndexedTerm(ctx, id, ixterm.paramType);
    const [id2, paramName] = [id1 + 1, generateVarName(id1)];
    const bind             = new Binding(paramName, paramType);
    const [id3, body]      = _fromIndexedTerm(ctx.unshift(bind), id2, ixterm.body);
    return [id3, new TmProd(ixterm.pos, paramName, paramType, body)];
  }
  else if (ixterm instanceof IxTmProp) {
    return [id, new TmProp(ixterm.pos)];
  }
  else {
    throw new Error(`unknown term: ${ixterm.toString()}`);
  }
}

export function fromIndexedTerm(ctx: Context, ixterm: IxTerm): Term {
  return _fromIndexedTerm(ctx, 0, ixterm)[1];
}
