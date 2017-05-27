// @flow

import type {
  Showable
} from "./common.js";
import {
  Type
} from "./type.js";
import {
  Term,
  TyBinding,
  TmBinding
} from "./term.js";
import type {
  Context
} from "./term.js";
import {
  toIndexedType,
  toIndexedTerm,
  toIndexedContext,
  fromIndexedType
} from "./transform.js";
import {
  deduceIxType
} from "./typing.js";

// statement
export class Statement {
  pos: Showable;

  constructor(pos: Showable) {
    this.pos = pos;
  }

  exec(context: Context): Context {
    throw new Error("not implemented");
  }
}

export class Variable extends Statement {
  name: string;

  constructor(pos: Showable, name: string) {
    super(pos);
    this.name = name;
  }

  exec(context: Context): Context {
    process.stdout.write(`${this.name} is assumed.\n`);
    return context.unshift(new TyBinding(this.name));
  }
}

export class Axiom extends Statement {
  name: string;
  type: Type;

  constructor(pos: Showable, name: string, type: Type) {
    super(pos);
    this.name = name;
    this.type = type;
  }

  exec(context: Context): Context {
    process.stdout.write(`${this.name}: ${this.type.toString()} is assumed.\n`);
    return context.unshift(new TmBinding(this.name, this.type));
  }
}

export class Theorem extends Statement {
  name: string;
  type: Type;
  term: Term;

  constructor(pos: Showable, name: string, type: Type, term: Term) {
    super(pos);
    this.name = name;
    this.type = type;
    this.term = term;
  }

  exec(context: Context): Context {
    try {
      const expected  = toIndexedType(context, this.type);
      const ixterm    = toIndexedTerm(context, this.term);
      const ixcontext = toIndexedContext(context);
      const actual    = deduceIxType(ixcontext, ixterm);
      if (actual.equals(expected)) {
        process.stdout.write(`${this.name}: ${this.type.toString()} is defined.\n`);
        return context.unshift(new TmBinding(this.name, this.type));
      }
      else {
        const type = fromIndexedType(context, actual);
        process.stdout.write(
            `TypeError at ${this.type.pos.toString()}:\n`
          + `  expected: ${this.type.toString()}\n`
          + `  actual  : ${type.toString()}\n`
        );
        return context;
      }
    }
    catch (err) {
      if (err instanceof Error) {
        process.stdout.write(err.message + "\n");
      }
      else {
        process.stdout.write(String(err) + "\n");
      }
      return context;
    }
  }
}
