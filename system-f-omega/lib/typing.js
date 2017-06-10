// @flow

import {
  INTERNAL_POS,
  createKindError,
  createTypeError
} from "./common.js";
import {
  KnStar
} from "./kind.js";
import {
  type Type,
  TyArr,
  TyAll
} from "./ixtype.js";
import {
  type Term,
  TmVar,
  TmAbs,
  TmApp,
  TmTyAbs,
  TmTyApp
} from "./ixterm.js";
import {
  TmVarBind,
  TyVarBind,
  type Context,
  getTmVarBinding
} from "./ixcontext.js";
import {
  kindOf
} from "./kinding.js";
import {
  weakReduceType,
  reduceType
} from "./reduction.js";

export function typeOf(ctx: Context, term: Term): Type {
  if (term instanceof TmVar) {
    const bind = getTmVarBinding(ctx, term.index);
    if (!(bind instanceof TmVarBind)) {
      throw new Error("variable binding not found");
    }
    return bind.type.shift(0, term.index + 1);
  }
  else if (term instanceof TmAbs) {
    const paramKind = kindOf(ctx, term.paramType);
    if (!(paramKind instanceof KnStar)) {
      throw createKindError(term.pos, "*", paramKind.toString());
    }
    const bind     = new TmVarBind(term.paramType);
    const bodyType = typeOf(ctx.unshift(bind), term.body).shift(1, -1);
    return new TyArr(INTERNAL_POS, term.paramType, bodyType);
  }
  else if (term instanceof TmApp) {
    const funcType = weakReduceType(ctx, typeOf(ctx, term.func));
    const argType  = reduceType(ctx, typeOf(ctx, term.arg));
    if (!(funcType instanceof TyArr)) {
      throw createTypeError(term.func.pos, `${argType.toString()} -> ?`, funcType.toString());
    }
    const domType = reduceType(ctx, funcType.dom);
    if (!argType.equals(domType)) {
      throw createTypeError(term.arg.pos, funcType.toString(), argType.toString());
    }
    return funcType.codom;
  }
  else if (term instanceof TmTyAbs) {
    const bind     = new TyVarBind(term.paramKind);
    const bodyType = typeOf(ctx.unshift(bind), term.body);
    return new TyAll(INTERNAL_POS, term.paramKind, bodyType);
  }
  else if (term instanceof TmTyApp) {
    const funcType = weakReduceType(ctx, typeOf(ctx, term.func));
    const argKind  = kindOf(ctx, term.arg);
    if (!(funcType instanceof TyAll)) {
      throw createTypeError(term.func.pos, `forall:: ${argKind.toString()}. ?`, funcType.toString());
    }
    if (!argKind.equals(funcType.paramKind)) {
      throw createKindError(term.arg.pos, funcType.paramKind.toString(), argKind.toString());
    }
    return funcType.body.subst(0, term.arg.shift(0, 1)).shift(1, -1);
  }
  else {
    throw new Error("unknown term");
  }
}
