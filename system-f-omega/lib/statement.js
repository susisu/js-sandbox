// @flow

import {
  type Showable,
  createKindError,
  createTypeError
} from "./common.js";
import { Kind } from "./kind.js";
import { Type } from "./type.js";
import type { Term } from "./term.js";
import {
  TyVarBind,
  TmVarBind
} from "./context.js";
import {
  toIndexedType,
  toIndexedTerm,
  fromIndexedType
} from "./transform.js";
import { reduceType } from "./reduction.js";
import { kindOf } from "./kinding.js";
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

export class StTyAssume extends Statement {
  name: string;
  kind: Kind;

  constructor(pos: Showable, name: string, kind: Kind) {
    super(pos);
    this.name = name;
    this.kind = kind;
  }

  exec(state: State): State {
    process.stdout.write(`${this.name} :: ${this.kind.toString()}\n`);
    const bind = new TyVarBind(this.name, this.kind);
    return state.addBinding(bind);
  }
}

export class StTmAssume extends Statement {
  name: string;
  type: Type;

  constructor(pos: Showable, name: string, type: Type) {
    super(pos);
    this.name = name;
    this.type = type;
  }

  exec(state: State): State {
    process.stdout.write(`${this.name} : ${this.type.toString()}\n`);
    const bind = new TmVarBind(this.name, this.type);
    return state.addBinding(bind);
  }
}

export class StTyDefine extends Statement {
  name: string;
  kind: ?Kind;
  type: Type;

  constructor(pos: Showable, name: string, kind: ?Kind, type: Type) {
    super(pos);
    this.name = name;
    this.kind = kind;
    this.type = type;
  }

  exec(state: State): State {
    try {
      const ixtype = toIndexedType(state.ctx, this.type);
      const kind   = kindOf(state.ixctx, ixtype);
      if (this.kind instanceof Kind) {
        const thisKind = this.kind;
        if (!kind.equals(thisKind)) {
          throw createKindError(this.pos, thisKind.toString(), kind.toString());
        }
        process.stdout.write(
            `${this.name} :: ${thisKind.toString()}\n`
          + `= ${this.type.toString()}\n`
        );
        const bind = new TyVarBind(this.name, thisKind, this.type);
        return state.addBinding(bind);
      }
      else {
        process.stdout.write(
            `${this.name} :: ${kind.toString()}\n`
          + `= ${this.type.toString()}\n`
        );
        const bind = new TyVarBind(this.name, kind, this.type);
        return state.addBinding(bind);
      }
    }
    catch (err) {
      process.stdout.write(err.message + "\n");
      return state;
    }
  }
}

export class StTmDefine extends Statement {
  name: string;
  type: ?Type;
  term: Term;

  constructor(pos: Showable, name: string, type: ?Type, term: Term) {
    super(pos);
    this.name = name;
    this.type = type;
    this.term = term;
  }

  exec(state: State): State {
    try {
      const ixterm = toIndexedTerm(state.ctx, this.term);
      const ixtype = reduceType(state.ixctx, typeOf(state.ixctx, ixterm));
      if (this.type instanceof Type) {
        const thisType   = this.type;
        const thisIxType = reduceType(state.ixctx, toIndexedType(state.ctx, thisType));
        if (!ixtype.equals(thisIxType)) {
          const type = fromIndexedType(state.ctx, ixtype);
          throw createTypeError(this.pos, thisType.toString(), type.toString());
        }
        else {
          process.stdout.write(
              `${this.name} : ${thisType.toString()}\n`
            + `= ${this.term.toString()}\n`
          );
          const bind = new TmVarBind(this.name, thisType, this.term);
          return state.addBinding(bind);
        }
      }
      else {
        const type = fromIndexedType(state.ctx, ixtype);
        process.stdout.write(
            `${this.name} : ${type.toString()}\n`
          + `= ${this.term.toString()}\n`
        );
        const bind = new TmVarBind(this.name, type, this.term);
        return state.addBinding(bind);
      }
    }
    catch (err) {
      process.stdout.write(err.message + "\n");
      return state;
    }
  }
}
