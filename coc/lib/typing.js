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
  TmProp
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
    const bind     = new Binding(term.paramType);
    const bodyType = typeOf(ctx.unshift(bind), term.body);
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
    return funcType.body.subst(0, argType.shift(0, 1)).shift(1, -1);
  }
  else if (term instanceof TmProd) {
    const bind     = new Binding(term.paramType);
    const ctx1     = ctx.unshift(bind);
    const bodyType = weakReduce(ctx1, typeOf(ctx1, term.body));
    if (!(bodyType instanceof TmProp)) {
      throw createTypeError(term.body.pos, "*", bodyType.toString());
    }
    return new TmProp(INTERNAL_POS);
  }
  else if (term instanceof TmProp) {
    throw new Error(
        `Type Error at ${term.pos.toString()}:\n`
      + "  cannot type *"
    );
  }
  else {
    throw new Error(`unknown term: ${term.toString()}`);
  }
}
