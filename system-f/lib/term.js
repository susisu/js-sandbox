// @flow

import { Type } from "./type.js";

export class Term {
  constructor() {
  }

  toString(): string {
    throw new Error("not implemented");
  }

  renameTmVars(oldName: string, newName: string): Term {
    throw new Error("not implemented");
  }

  renameTyVars(oldName: string, newName: string): Term {
    throw new Error("not implemented");
  }
}

export class TmVar extends Term {
  name: string;

  constructor(name: string) {
    super();
    this.name = name;
  }

  toString(): string {
    return this.name;
  }

  renameTmVars(oldName: string, newName: string): Term {
    return this.name === oldName
      ? new TmVar(newName)
      : this;
  }

  renameTyVars(oldName: string, newName: string): Term {
    return this;
  }
}

export class TmAbs extends Term {
  paramName: string;
  paramType: Type;
  body: Term;

  constructor(paramName: string, paramType: Type, body: Term) {
    super();
    this.paramName = paramName;
    this.paramType = paramType;
    this.body      = body;
  }

  toString(): string {
    return "fun " + this.paramName
      + " : " + this.paramType.toString()
      + ". " + this.body.toString();
  }

  renameTmVars(oldName: string, newName: string): Term {
    if (this.paramName === oldName) {
      return this;
    }
    else if (this.paramName === newName) {
      throw new Error(`cannot rename variable "${oldName}" to "${newName}"`);
    }
    else {
      return new TmAbs(
        this.paramName,
        this.paramType,
        this.body.renameTmVars(oldName, newName)
      );
    }
  }

  renameTyVars(oldName: string, newName: string): Term {
    return new TmAbs(
      this.paramName,
      this.paramType.renameTyVars(oldName, newName),
      this.body.renameTyVars(oldName, newName)
    );
  }
}

export class TmApp extends Term {
  func: Term;
  arg: Term;

  constructor(func: Term, arg: Term) {
    super();
    this.func = func;
    this.arg  = arg;
  }

  toString(): string {
    const funcStr
      = this.func instanceof TmVar || this.func instanceof TmApp || this.func instanceof TmTyApp
      ? this.func.toString()
      : "(" + this.func.toString() + ")";
    const argStr = this.arg instanceof TmVar
      ? this.arg.toString()
      : "(" + this.arg.toString() + ")";
    return funcStr + " " + argStr;
  }

  renameTmVars(oldName: string, newName: string): Term {
    return new TmApp(
      this.func.renameTmVars(oldName, newName),
      this.arg.renameTmVars(oldName, newName)
    );
  }

  renameTyVars(oldName: string, newName: string): Term {
    return new TmApp(
      this.func.renameTyVars(oldName, newName),
      this.arg.renameTyVars(oldName, newName)
    );
  }
}

export class TmTyAbs extends Term {
  paramName: string;
  body: Term;

  constructor(paramName: string, body: Term) {
    super();
    this.paramName = paramName;
    this.body      = body;
  }

  toString(): string {
    return "Fun " + this.paramName + ". " + this.body.toString();
  }

  renameTmVars(oldName: string, newName: string): Term {
    return new TmTyAbs(
      this.paramName,
      this.body.renameTmVars(oldName, newName)
    );
  }

  renameTyVars(oldName: string, newName: string): Term {
    if (this.paramName === oldName) {
      return this;
    }
    else if (this.paramName === newName) {
      throw new Error(`cannot rename type variable "${oldName}" to "${newName}"`);
    }
    else {
      return new TmTyAbs(
        this.paramName,
        this.body.renameTyVars(oldName, newName)
      );
    }
  }
}

export class TmTyApp extends Term {
  func: Term;
  arg: Type;

  constructor(func: Term, arg: Type) {
    super();
    this.func = func;
    this.arg  = arg;
  }

  toString(): string {
    const funcStr
      = this.func instanceof TmVar || this.func instanceof TmApp || this.func instanceof TmTyApp
      ? this.func.toString()
      : "(" + this.func.toString() + ")";
    return funcStr + " [" + this.arg.toString() + "]";
  }

  renameTmVars(oldName: string, newName: string): Term {
    return new TmTyApp(
      this.func.renameTmVars(oldName, newName),
      this.arg
    );
  }

  renameTyVars(oldName: string, newName: string): Term {
    return new TmTyApp(
      this.func.renameTyVars(oldName, newName),
      this.arg.renameTyVars(oldName, newName)
    );
  }
}
