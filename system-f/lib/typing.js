// @flow

import {
  Type
} from "./type.js";
import {
  Term
} from "./term.js";
import type {
  Context
} from "./term.js";
import {
  Type  as IxType,
  TyArr as IxTyArr,
  TyAll as IxTyAll
} from "./ixtype.js";
import {
  Term      as IxTerm,
  TmVar     as IxTmVar,
  TmAbs     as IxTmAbs,
  TmApp     as IxTmApp,
  TmTyAbs   as IxTmTyAbs,
  TmTyApp   as IxTmTyApp,
  TyBinding as IxTyBinding,
  TmBinding as IxTmBinding
} from "./ixterm.js";
import type {
  Context as IxContext
} from "./ixterm.js";
import {
  toIndexedTerm,
  toIndexedContext,
  fromIndexedType
} from "./transform.js";

function findIxTmVarType(context: IxContext, index: number): IxType {
  const b = context.get(index);
  if (b === undefined) {
    throw new RangeError("index is out of range: " + index.toString());
  }
  else if (b instanceof IxTyBinding) {
    throw new Error("not a variable at " + index.toString());
  }
  else if (b instanceof IxTmBinding) {
    return b.type.shift(0, index + 1);
  }
  else {
    throw new Error("unknown binding");
  }
}

export function deduceIxType(context: IxContext, term: IxTerm): IxType {
  if (term instanceof IxTmVar) {
    return findIxTmVarType(context, term.index);
  }
  else if (term instanceof IxTmAbs) {
    const bodyType = deduceIxType(
      context.unshift(new IxTmBinding(term.paramType)),
      term.body
    );
    return new IxTyArr(term.paramType, bodyType.shift(1, -1));
  }
  else if (term instanceof IxTmApp) {
    const funcType = deduceIxType(context, term.func);
    const argType  = deduceIxType(context, term.arg);
    if (!(funcType instanceof IxTyArr)) {
      throw new Error("arrow type is required");
    }
    if (!funcType.dom.equals(argType)) {
      throw new Error("domain and argument types do not match");
    }
    return funcType.codom;
  }
  else if (term instanceof IxTmTyAbs) {
    const bodyType = deduceIxType(
      context.unshift(new IxTyBinding()),
      term.body
    );
    return new IxTyAll(bodyType);
  }
  else if (term instanceof IxTmTyApp) {
    const funcType = deduceIxType(context, term.func);
    if (!(funcType instanceof IxTyAll)) {
      throw new Error("universal type is required");
    }
    return funcType.body.subst(0, term.arg.shift(0, 1)).shift(1, -1);
  }
  else {
    throw new Error("unknown term");
  }
}

export function deduceType(context: Context, term: Term): Type {
  const ixterm    = toIndexedTerm(context, term);
  const ixcontext = toIndexedContext(context);
  const ixtype    = deduceIxType(ixcontext, ixterm);
  return fromIndexedType(context, ixtype);
}
