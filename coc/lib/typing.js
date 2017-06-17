// @flow

import {
  INTERNAL_POS,
  createTypeError
} from "./common.js";
import {
  type Term,
  TmVar,
  TmAbs,
  TmApp,
  TmProd,
  TmProp,
  TmType
} from "./ixterm.js";
import {
  Binding,
  type Context,
  getBinding
} from "./ixcontext.js";
import {
  weakReduce,
  reduce
} from "./reduction.js";

export function typeOf(ctx: Context, term: Term): Term {
  if (term instanceof TmVar) {
    const bind = getBinding(ctx, term.index);
    if (!(bind instanceof Binding)) {
      throw new Error("binding not found");
    }
    return bind.type.shift(0, term.index + 1);
  }
  else if (term instanceof TmAbs) {
    const paramTypeType = weakReduce(ctx, typeOf(ctx, term.paramType));
    if (!(paramTypeType instanceof TmProp) && !(paramTypeType instanceof TmType)) {
      throw createTypeError(term.paramType.pos, "* or #", paramTypeType.toString());
    }
    const bind         = new Binding(term.paramType);
    const ctx1         = ctx.unshift(bind);
    const bodyType     = typeOf(ctx1, term.body);
    const bodyTypeType = weakReduce(ctx1, typeOf(ctx1, bodyType));
    if (paramTypeType instanceof TmProp && !(bodyTypeType instanceof TmProp)) {
      throw createTypeError(term.body.pos, "*", bodyTypeType.toString());
    }
    if (paramTypeType instanceof TmType
      && !(bodyTypeType instanceof TmProp) && !(bodyTypeType instanceof TmType)) {
      throw createTypeError(term.body.pos, "* or #", bodyTypeType.toString());
    }
    return new TmProd(INTERNAL_POS, term.paramType, bodyType);
  }
  else if (term instanceof TmApp) {
    const funcType = weakReduce(ctx, typeOf(ctx, term.func));
    const argType  = reduce(ctx, typeOf(ctx, term.arg));
    if (!(funcType instanceof TmProd)) {
      throw createTypeError(term.func.pos, `(:${argType.toString()}) -> ?`, funcType.toString());
    }
    const domType = reduce(ctx, funcType.paramType);
    if (!argType.equals(domType)) {
      throw createTypeError(term.arg.pos, domType.toString(), argType.toString());
    }
    return funcType.body.subst(0, term.arg.shift(0, 1)).shift(1, -1);
  }
  else if (term instanceof TmProd) {
    const paramTypeType = weakReduce(ctx, typeOf(ctx, term.paramType));
    if (!(paramTypeType instanceof TmProp) && !(paramTypeType instanceof TmType)) {
      throw createTypeError(term.paramType.pos, "* or #", paramTypeType.toString());
    }
    const bind     = new Binding(term.paramType);
    const ctx1     = ctx.unshift(bind);
    const bodyType = weakReduce(ctx1, typeOf(ctx1, term.body));
    if (paramTypeType instanceof TmProp && !(bodyType instanceof TmProp)) {
      throw createTypeError(term.body.pos, "*", bodyType.toString());
    }
    if (paramTypeType instanceof TmType
      && !(bodyType instanceof TmProp) && !(bodyType instanceof TmType)) {
      throw createTypeError(term.body.pos, "* or #", bodyType.toString());
    }
    return bodyType instanceof TmProp
      ? new TmProp(INTERNAL_POS)
      : new TmType(INTERNAL_POS);
  }
  else if (term instanceof TmProp) {
    return new TmType(INTERNAL_POS);
  }
  else if (term instanceof TmType) {
    throw new Error(
        `Type Error at ${term.pos.toString()}:\n`
      + "  cannot type #"
    );
  }
  else {
    throw new Error(`unknown term: ${term.toString()}`);
  }
}
