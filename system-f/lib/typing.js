// @flow

import {
  Type,
  TyArr,
  TyAll
} from "./ixtype.js";
import {
  Term,
  TmVar,
  TmAbs,
  TmApp,
  TmTyAbs,
  TmTyApp,
  TyBinding,
  TmBinding
} from "./ixterm.js";
import type {
  Context
} from "./ixterm.js";

function findTmVarType(context: Context, index: number): Type {
  const b = context.get(index);
  if (b === undefined) {
    throw new RangeError("index is out of range: " + index.toString());
  }
  else if (b instanceof TyBinding) {
    throw new Error("not a variable at " + index.toString());
  }
  else if (b instanceof TmBinding) {
    return b.type.shift(0, index + 1);
  }
  else {
    throw new Error("unknown binding");
  }
}

export function deduceType(context: Context, term: Term): Type {
  if (term instanceof TmVar) {
    return findTmVarType(context, term.index);
  }
  else if (term instanceof TmAbs) {
    const bodyType = deduceType(
      context.unshift(new TmBinding(term.paramType)),
      term.body
    );
    return new TyArr(term.paramType, bodyType.shift(1, -1));
  }
  else if (term instanceof TmApp) {
    const funcType = deduceType(context, term.func);
    const argType  = deduceType(context, term.arg);
    if (!(funcType instanceof TyArr)) {
      throw new Error("arrow type is required");
    }
    if (!funcType.dom.equals(argType)) {
      throw new Error("domain and argument types do not match");
    }
    return funcType.codom;
  }
  else if (term instanceof TmTyAbs) {
    const bodyType = deduceType(
      context.unshift(new TyBinding()),
      term.body
    );
    return new TyAll(bodyType);
  }
  else if (term instanceof TmTyApp) {
    const funcType = deduceType(context, term.func);
    if (!(funcType instanceof TyAll)) {
      throw new Error("universal type is required");
    }
    return funcType.body.subst(0, term.arg.shift(0, 1)).shift(1, -1);
  }
  else {
    throw new Error("unknown term");
  }
}
