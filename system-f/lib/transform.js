// @flow

import {
  Type,
  TyVar,
  TyArr,
  TyAll
} from "./type.js";
import {
  Term,
  TmVar,
  TmAbs,
  TmApp,
  TmTyAbs,
  TmTyApp,
  TyBinding,
  TmBinding
} from "./term.js";
import type {
  Context
} from "./term.js";
import {
  Type  as IxType,
  TyVar as IxTyVar,
  TyArr as IxTyArr,
  TyAll as IxTyAll
} from "./ixtype.js";
import {
  Term    as IxTerm,
  TmVar   as IxTmVar,
  TmAbs   as IxTmAbs,
  TmApp   as IxTmApp,
  TmTyAbs as IxTmTyAbs,
  TmTyApp as IxTmTyApp
} from "./ixterm.js";

// conversion from term to indexed term
function findTyVarIndex(context: Context, name: string): number {
  return context.findIndex(b => b instanceof TyBinding && b.name === name);
}

function findTmVarIndex(context: Context, name: string): number {
  return context.findIndex(b => b instanceof TmBinding && b.name === name);
}

export function toIndexedType(context: Context, type: Type): IxType {
  if (type instanceof TyVar) {
    const index = findTyVarIndex(context, type.name);
    if (index < 0) {
      throw new Error("unbound type variable: " + type.name);
    }
    return new IxTyVar(index);
  }
  else if (type instanceof TyArr) {
    return new IxTyArr(
      toIndexedType(context, type.dom),
      toIndexedType(context, type.codom)
    );
  }
  else if (type instanceof TyAll) {
    return new IxTyAll(
      toIndexedType(
        context.unshift(new TyBinding(type.paramName)),
        type.body
      )
    );
  }
  else {
    throw new Error("unknown type");
  }
}

export function toIndexedTerm(context: Context, term: Term): IxTerm {
  if (term instanceof TmVar) {
    const index = findTmVarIndex(context, term.name);
    if (index < 0) {
      throw new Error("unbound variable: " + term.name);
    }
    return new IxTmVar(index);
  }
  else if (term instanceof TmAbs) {
    return new IxTmAbs(
      toIndexedType(context, term.paramType),
      toIndexedTerm(
        context.unshift(new TmBinding(term.paramName, term.paramType)),
        term.body
      )
    );
  }
  else if (term instanceof TmApp) {
    return new IxTmApp(
      toIndexedTerm(context, term.func),
      toIndexedTerm(context, term.arg)
    );
  }
  else if (term instanceof TmTyAbs) {
    return new IxTmTyAbs(
      toIndexedTerm(
        context.unshift(new TyBinding(term.paramName)),
        term.body
      )
    );
  }
  else if (term instanceof TmTyApp) {
    return new IxTmTyApp(
      toIndexedTerm(context, term.func),
      toIndexedType(context, term.arg)
    );
  }
  else {
    throw new Error("unknown term");
  }
}

// conversion from indexed term to ordinary term
function findTyVarName(context: Context, index: number): string {
  const b = context.get(index);
  if (b === undefined) {
    throw new RangeError("index is out of range: " + index.toString());
  }
  else if (b instanceof TmBinding) {
    throw new Error("not a type variable at " + index.toString());
  }
  else if (b instanceof TyBinding) {
    return b.name;
  }
  else {
    throw new Error("unknown binding");
  }
}

function findTmVarName(context: Context, index: number): string {
  const b = context.get(index);
  if (b === undefined) {
    throw new RangeError("index is out of range: " + index.toString());
  }
  else if (b instanceof TyBinding) {
    throw new Error("not a variable at " + index.toString());
  }
  else if (b instanceof TmBinding) {
    return b.name;
  }
  else {
    throw new Error("unknown binding");
  }
}

function generateTyVarName(id: number): string {
  let name = "";
  let n    = id;
  while (n >= 0) {
    name = String.fromCharCode((n % 26) + "A".charCodeAt(0)) + name;
    n    = (n / 26 >> 0) - 1;
  }
  return name;
}

function generateTmVarName(id: number): string {
  let name = "";
  let n    = id;
  while (n >= 0) {
    name = String.fromCharCode((n % 26) + "a".charCodeAt(0)) + name;
    n    = (n / 26 >> 0) - 1;
  }
  return name;
}

function _fromIndexedType(context: Context, id: number, type: IxType): [number, Type] {
  if (type instanceof IxTyVar) {
    return [id, new TyVar(findTyVarName(context, type.index))];
  }
  else if (type instanceof IxTyArr) {
    const [id1, dom]   = _fromIndexedType(context, id, type.dom);
    const [id2, codom] = _fromIndexedType(context, id1, type.codom);
    return [id2, new TyArr(dom, codom)];
  }
  else if (type instanceof IxTyAll) {
    const [id1, paramName] = [id + 1, generateTyVarName(id)];
    const [id2, body]      = _fromIndexedType(
      context.unshift(new TyBinding(paramName)),
      id1,
      type.body
    );
    return [id2, new TyAll(paramName, body)];
  }
  else {
    throw new Error("unknown type");
  }
}

function _fromIndexedTerm(
  context: Context, tyid: number, tmid: number, term: IxTerm
): [number, number, Term] {
  if (term instanceof IxTmVar) {
    return [tyid, tmid, new TmVar(findTmVarName(context, term.index))];
  }
  else if (term instanceof IxTmAbs) {
    const [tyid1, paramType]   = _fromIndexedType(context, tyid, term.paramType);
    const [tmid1, paramName]   = [tmid + 1, generateTmVarName(tmid)];
    const [tyid2, tmid2, body] = _fromIndexedTerm(
      context.unshift(new TmBinding(paramName, paramType)),
      tyid1,
      tmid1,
      term.body
    );
    return [tyid2, tmid2, new TmAbs(paramName, paramType, body)];
  }
  else if (term instanceof IxTmApp) {
    const [tyid1, tmid1, func] = _fromIndexedTerm(context, tyid, tmid, term.func);
    const [tyid2, tmid2, arg]  = _fromIndexedTerm(context, tyid1, tmid1, term.arg);
    return [tyid2, tmid2, new TmApp(func, arg)];
  }
  else if (term instanceof IxTmTyAbs) {
    const [tyid1, tmid1, paramName] = [tyid + 1, tmid, generateTyVarName(tyid)];
    const [tyid2, tmid2, body]      = _fromIndexedTerm(
      context.unshift(new TyBinding(paramName)),
      tyid1,
      tmid1,
      term.body
    );
    return [tyid2, tmid2, new TmTyAbs(paramName, body)];
  }
  else if (term instanceof IxTmTyApp) {
    const [tyid1, tmid1, func] = _fromIndexedTerm(context, tyid, tmid, term.func);
    const [tyid2, arg]         = _fromIndexedType(context, tyid1, term.arg);
    return [tyid2, tmid1, new TmTyApp(func, arg)];
  }
  else {
    throw new Error("unknown term");
  }
}

export function fromIndexedType(context: Context, type: IxType): Type {
  return _fromIndexedType(context, 0, type)[1];
}

export function fromIndexedTerm(context: Context, term: IxTerm): Term {
  return _fromIndexedTerm(context, 0, 0, term)[2];
}
