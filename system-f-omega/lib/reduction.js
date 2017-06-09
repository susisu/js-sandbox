// @flow

import {
  Type,
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

export function weakReduceType(ctx: Context, type: Type): Type {
  if (type instanceof TyVar) {
    const bind = getTyVarBinding(ctx, type.index);
    if (!(bind instanceof TyVarBind)) {
      throw new Error("type variable binding not found");
    }
    if (bind.type instanceof Type) {
      const newType = bind.type.shift(0, type.index + 1);
      return weakReduceType(ctx, newType);
    }
    else {
      return type;
    }
  }
  else if (type instanceof TyArr) {
    return type;
  }
  else if (type instanceof TyAll) {
    return type;
  }
  else if (type instanceof TyAbs) {
    return type;
  }
  else if (type instanceof TyApp) {
    if (type.func instanceof TyAbs) {
      const newType = type.func.body.subst(0, type.arg.shift(0, 1)).shift(1, -1);
      return weakReduceType(ctx, newType);
    }
    else {
      return type;
    }
  }
  else {
    throw new Error("unknown type");
  }
}

export function reduceType(ctx: Context, type: Type): Type {
  if (type instanceof TyVar) {
    const bind = getTyVarBinding(ctx, type.index);
    if (!(bind instanceof TyVarBind)) {
      throw new Error("type variable binding not found");
    }
    if (bind.type instanceof Type) {
      const newType = bind.type.shift(0, type.index + 1);
      return reduceType(ctx, newType);
    }
    else {
      return type;
    }
  }
  else if (type instanceof TyArr) {
    const dom   = reduceType(ctx, type.dom);
    const codom = reduceType(ctx, type.codom);
    return new TyArr(type.pos, dom, codom);
  }
  else if (type instanceof TyAll) {
    const bind = new TyVarBind(type.paramKind);
    const body = reduceType(ctx.unshift(bind), type.body);
    return new TyAll(type.pos, type.paramKind, body);
  }
  else if (type instanceof TyAbs) {
    const bind = new TyVarBind(type.paramKind);
    const body = reduceType(ctx.unshift(bind), type.body);
    return new TyAbs(type.pos, type.paramKind, body);
  }
  else if (type instanceof TyApp) {
    if (type.func instanceof TyAbs) {
      const newType = type.func.body.subst(0, type.arg.shift(0, 1)).shift(1, -1);
      return reduceType(ctx, newType);
    }
    else {
      return type;
    }
  }
  else {
    throw new Error("unknown type");
  }
}
