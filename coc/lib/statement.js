// @flow

import {
  type Showable,
  createTypeError
} from "./common.js";
import { Term } from "./term.js";
import { Binding } from "./context.js";
import {
  toIndexedTerm,
  fromIndexedTerm
} from "./transform.js";
import { reduce } from "./reduction.js";
import { typeOf } from "./typing.js";
import type { State } from "./state.js";

export class Statement {
  pos: Showable;

  constructor(pos: Showable) {
    this.pos = pos;
  }

  exec(state: State): State {
    throw new Error("not implemented");
  }
}

export class StAssume extends Statement {
  name: string;
  type: Term;

  constructor(pos: Showable, name: string, type: Term) {
    super(pos);
    this.name = name;
    this.type = type;
  }

  exec(state: State): State {
    const ixtype = toIndexedTerm(state.ctx, this.type);
    void typeOf(state.ixctx, ixtype); // assert the type is well-formed
    process.stdout.write(`${this.name} : ${this.type.toString()}\n`);
    const bind = new Binding(this.name, this.type);
    return state.addBinding(bind);
  }
}

export class StDefine extends Statement {
  name: string;
  term: Term;
  type: ?Term;

  constructor(pos: Showable, name: string, term: Term, type: ?Term) {
    super(pos);
    this.name = name;
    this.term = term;
    this.type = type;
  }

  exec(state: State): State {
    const ixterm = toIndexedTerm(state.ctx, this.term);
    const ixtype = reduce(state.ixctx, typeOf(state.ixctx, ixterm));
    if (this.type instanceof Term) {
      const thisType   = this.type;
      const thisIxType = toIndexedTerm(state.ctx, thisType);
      void typeOf(state.ixctx, thisIxType); // assert the type is well-formed
      if (!ixtype.equals(reduce(state.ixctx, thisIxType))) {
        const type = fromIndexedTerm(state.ctx, ixtype);
        throw createTypeError(this.pos, thisType.toString(), type.toString());
      }
      process.stdout.write(
          `${this.name} : ${thisType.toString()}\n`
        + `= ${this.term.toString()}\n`
      );
      const bind = new Binding(this.name, thisType, this.term);
      return state.addBinding(bind);
    }
    else {
      const type = fromIndexedTerm(state.ctx, ixtype);
      process.stdout.write(
          `${this.name} : ${type.toString()}\n`
        + `= ${this.term.toString()}\n`
      );
      const bind = new Binding(this.name, type, this.term);
      return state.addBinding(bind);
    }
  }
}
