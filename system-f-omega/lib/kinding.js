// @flow

import {
  INTERNAL_POS,
  createKindError
} from "./common.js";
import {
  type Kind,
  KnStar,
  KnArr
} from "./kind.js";
import {
  type Type,
  TyVar,
  TyArr,
  TyAll,
  TyAbs,
  TyApp
} from "./ixtype.js";
import {
  TyVarBind,
  type Context,
  getTyVarBinding
} from "./ixcontext.js";

export function kindOf(ctx: Context, type: Type): Kind {
  if (type instanceof TyVar) {
    const bind = getTyVarBinding(ctx, type.index);
    if (!(bind instanceof TyVarBind)) {
      throw new Error("type variable binding not found");
    }
    return bind.kind;
  }
  else if (type instanceof TyArr) {
    const domKind   = kindOf(ctx, type.dom);
    const codomKind = kindOf(ctx, type.codom);
    if (!(domKind instanceof KnStar)) {
      throw createKindError(type.dom.pos, "*", domKind.toString());
    }
    if (!(codomKind instanceof KnStar)) {
      throw createKindError(type.codom.pos, "*", domKind.toString());
    }
    return new KnStar(INTERNAL_POS);
  }
  else if (type instanceof TyAll) {
    const bind     = new TyVarBind(type.paramKind);
    const bodyKind = kindOf(ctx.unshift(bind), type.body);
    if (!(bodyKind instanceof KnStar)) {
      throw createKindError(type.body.pos, "*", bodyKind.toString());
    }
    return new KnStar(INTERNAL_POS);
  }
  else if (type instanceof TyAbs) {
    const bind     = new TyVarBind(type.paramKind);
    const bodyKind = kindOf(ctx.unshift(bind), type.body);
    return new KnArr(INTERNAL_POS, type.paramKind, bodyKind);
  }
  else if (type instanceof TyApp) {
    const funcKind = kindOf(ctx, type.func);
    const argKind  = kindOf(ctx, type.arg);
    if (!(funcKind instanceof KnArr)) {
      throw createKindError(type.func.pos, `${argKind.toString()} => ?`, funcKind.toString());
    }
    if (!argKind.equals(funcKind.dom)) {
      throw createKindError(type.arg.pos, funcKind.dom.toString(), argKind.toString());
    }
    return funcKind.codom;
  }
  else {
    throw new Error("unknown type");
  }
}
