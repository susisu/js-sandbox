// @flow

import {
  createReferenceError
} from "./common.js";
import {
  generateTyVarName,
  generateTmVarName
} from "./common.js";
import {
  Type,
  TyVar,
  TyArr,
  TyAll,
  TyAbs,
  TyApp
} from "./type.js";
import {
  Term,
  TmVar,
  TmAbs,
  TmApp,
  TmTyAbs,
  TmTyApp
} from "./term.js";
import {
  type Binding,
  TyVarBind,
  TmVarBind,
  type Context,
  findTyVarIndex,
  findTmVarIndex,
  getTyVarBinding,
  getTmVarBinding
} from "./context.js";
import {
  type Type as IxType,
  TyVar as IxTyVar,
  TyArr as IxTyArr,
  TyAll as IxTyAll,
  TyAbs as IxTyAbs,
  TyApp as IxTyApp
} from "./ixtype.js";
import {
  type Term as IxTerm,
  TmVar   as IxTmVar,
  TmAbs   as IxTmAbs,
  TmApp   as IxTmApp,
  TmTyAbs as IxTmTyAbs,
  TmTyApp as IxTmTyApp
} from "./ixterm.js";
import {
  type Binding as IxBinding,
  TyVarBind as IxTyVarBind,
  TmVarBind as IxTmVarBind,
  type Context as IxContext,
  emptyContext as emptyIxContext
} from "./ixcontext.js";

export function toIndexedType(ctx: Context, type: Type): IxType {
  if (type instanceof TyVar) {
    const index = findTyVarIndex(ctx, type.name);
    if (index < 0) {
      throw createReferenceError(type.pos, `unbound type variable: ${type.name}`);
    }
    return new IxTyVar(type.pos, index);
  }
  else if (type instanceof TyArr) {
    const dom   = toIndexedType(ctx, type.dom);
    const codom = toIndexedType(ctx, type.codom);
    return new IxTyArr(type.pos, dom, codom);
  }
  else if (type instanceof TyAll) {
    const bind = new TyVarBind(type.paramName, type.paramKind);
    const body = toIndexedType(ctx.unshift(bind), type.body);
    return new IxTyAll(type.pos, type.paramKind, body);
  }
  else if (type instanceof TyAbs) {
    const bind = new TyVarBind(type.paramName, type.paramKind);
    const body = toIndexedType(ctx.unshift(bind), type.body);
    return new IxTyAbs(type.pos, type.paramKind, body);
  }
  else if (type instanceof TyApp) {
    const func = toIndexedType(ctx, type.func);
    const arg  = toIndexedType(ctx, type.arg);
    return new IxTyApp(type.pos, func, arg);
  }
  else {
    throw new Error("unknown type");
  }
}

export function toIndexedTerm(ctx: Context, term: Term): IxTerm {
  if (term instanceof TmVar) {
    const index = findTmVarIndex(ctx, term.name);
    if (index < 0) {
      throw createReferenceError(term.pos, `unbound  variable: ${term.name}`);
    }
    return new IxTmVar(term.pos, index);
  }
  else if (term instanceof TmAbs) {
    const paramType = toIndexedType(ctx, term.paramType);
    const bind      = new TmVarBind(term.paramName, term.paramType);
    const body      = toIndexedTerm(ctx.unshift(bind), term.body);
    return new IxTmAbs(term.pos, paramType, body);
  }
  else if (term instanceof TmApp) {
    const func = toIndexedTerm(ctx, term.func);
    const arg  = toIndexedTerm(ctx, term.arg);
    return new IxTmApp(term.pos, func, arg);
  }
  else if (term instanceof TmTyAbs) {
    const bind = new TyVarBind(term.paramName, term.paramKind);
    const body = toIndexedTerm(ctx.unshift(bind), term.body);
    return new IxTmTyAbs(term.pos, term.paramKind, body);
  }
  else if (term instanceof TmTyApp) {
    const func = toIndexedTerm(ctx, term.func);
    const arg  = toIndexedType(ctx, term.arg);
    return new IxTmTyApp(term.pos, func, arg);
  }
  else {
    throw new Error("unknown term");
  }
}

export function toIndexedBinding(ctx: Context, bind: Binding): IxBinding {
  if (bind instanceof TyVarBind) {
    const ixtype = bind.type instanceof Type
      ? toIndexedType(ctx, bind.type)
      : undefined;
    return new IxTyVarBind(bind.kind, ixtype);
  }
  else if (bind instanceof TmVarBind) {
    const ixtype = toIndexedType(ctx, bind.type);
    const ixterm = bind.term instanceof Term
      ? toIndexedTerm(ctx, bind.term)
      : undefined;
    return new IxTmVarBind(ixtype, ixterm);
  }
  else {
    throw new Error("unknown binding");
  }
}

export function toIndexedContext(ctx: Context): IxContext {
  let ixctx = emptyIxContext();
  let rest  = ctx;
  while (rest.size > 0) {
    const bind = rest.first();
    rest       = rest.shift();
    ixctx      = ixctx.unshift(toIndexedBinding(rest, bind));
  }
  return ixctx.reverse();
}

function _fromIndexedType(ctx: Context, id: number, ixtype: IxType): [number, Type] {
  if (ixtype instanceof IxTyVar) {
    const bind = getTyVarBinding(ctx, ixtype.index);
    if (!(bind instanceof TyVarBind)) {
      throw new Error("type variable binding not found");
    }
    return [id, new TyVar(ixtype.pos, bind.name)];
  }
  else if (ixtype instanceof IxTyArr) {
    const [id1, dom]   = _fromIndexedType(ctx, id, ixtype.dom);
    const [id2, codom] = _fromIndexedType(ctx, id1, ixtype.codom);
    return [id2, new TyArr(ixtype.pos, dom, codom)];
  }
  else if (ixtype instanceof IxTyAll) {
    const [id1, paramName] = [id + 1, generateTyVarName(id)];
    const bind             = new TyVarBind(paramName, ixtype.paramKind);
    const [id2, body]      = _fromIndexedType(ctx.unshift(bind), id1, ixtype.body);
    return [id2, new TyAll(ixtype.pos, paramName, ixtype.paramKind, body)];
  }
  else if (ixtype instanceof IxTyAbs) {
    const [id1, paramName] = [id + 1, generateTyVarName(id)];
    const bind             = new TyVarBind(paramName, ixtype.paramKind);
    const [id2, body]      = _fromIndexedType(ctx.unshift(bind), id1, ixtype.body);
    return [id2, new TyAbs(ixtype.pos, paramName, ixtype.paramKind, body)];
  }
  else if (ixtype instanceof IxTyApp) {
    const [id1, func] = _fromIndexedType(ctx, id, ixtype.func);
    const [id2, arg]  = _fromIndexedType(ctx, id1, ixtype.arg);
    return [id2, new TyApp(ixtype.pos, func, arg)];
  }
  else {
    throw new Error("unknown type");
  }
}

function _fromIndexedTerm(
  ctx: Context, [tyid, tmid]: [number, number], ixterm: IxTerm
): [[number, number], Term] {
  if (ixterm instanceof IxTmVar) {
    const bind = getTmVarBinding(ctx, ixterm.index);
    if (!(bind instanceof TmVarBind)) {
      throw new Error("variable binding not found");
    }
    return [[tyid, tmid], new TmVar(ixterm.pos, bind.name)];
  }
  else if (ixterm instanceof IxTmAbs) {
    const [tyid1, paramType] = _fromIndexedType(ctx, tyid, ixterm.paramType);
    const [tmid1, paramName] = [tmid + 1, generateTmVarName(tmid)];
    const bind               = new TmVarBind(paramName, paramType);
    const [ids2, body]       = _fromIndexedTerm(ctx.unshift(bind), [tyid1, tmid1], ixterm.body);
    return [ids2, new TmAbs(ixterm.pos, paramName, paramType, body)];
  }
  else if (ixterm instanceof IxTmApp) {
    const [ids1, func] = _fromIndexedTerm(ctx, [tyid, tmid], ixterm.func);
    const [ids2, arg]  = _fromIndexedTerm(ctx, ids1, ixterm.arg);
    return [ids2, new TmApp(ixterm.pos, func, arg)];
  }
  else if (ixterm instanceof IxTmTyAbs) {
    const [tyid1, paramName] = [tyid + 1, generateTyVarName(tyid)];
    const bind               = new TyVarBind(paramName, ixterm.paramKind);
    const [ids2, body]       = _fromIndexedTerm(ctx.unshift(bind), [tyid1, tmid], ixterm.body);
    return [ids2, new TmTyAbs(ixterm.pos, paramName, ixterm.paramKind, body)];
  }
  else if (ixterm instanceof IxTmTyApp) {
    const [[tyid1, tmid1], func] = _fromIndexedTerm(ctx, [tyid, tmid], ixterm.func);
    const [tyid2, arg]           = _fromIndexedType(ctx, tyid1, ixterm.arg);
    return [[tyid2, tmid1], new TmTyApp(ixterm.pos, func, arg)];
  }
  else {
    throw new Error("unknwon tern");
  }
}

export function fromIndexedType(ctx: Context, ixtype: IxType): Type {
  return _fromIndexedType(ctx, 0, ixtype)[1];
}

export function fromIndexedTerm(ctx: Context, ixterm: IxTerm): Term {
  return _fromIndexedTerm(ctx, [0, 0], ixterm)[1];
}
