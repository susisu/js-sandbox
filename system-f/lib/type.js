// @flow

export class Type {
  constructor() {
  }

  toString(): string {
    throw new Error("not implemented");
  }

  renameTyVars(oldName: string, newName: string): Type {
    throw new Error("not implemented");
  }
}

export class TyVar extends Type {
  name: string;

  constructor(name: string) {
    super();
    this.name = name;
  }

  toString(): string {
    return this.name;
  }

  renameTyVars(oldName: string, newName: string): Type {
    return this.name === oldName
      ? new TyVar(newName)
      : this;
  }
}

export class TyArr extends Type {
  dom: Type;
  codom: Type;

  constructor(dom: Type, codom: Type) {
    super();
    this.dom   = dom;
    this.codom = codom;
  }

  toString(): string {
    const domStr = this.dom instanceof TyVar
      ? this.dom.toString()
      : "(" + this.dom.toString() + ")";
    return domStr + " -> " + this.codom.toString();
  }

  renameTyVars(oldName: string, newName: string): Type {
    return new TyArr(
      this.dom.renameTyVars(oldName, newName),
      this.codom.renameTyVars(oldName, newName)
    );
  }
}

export class TyAll extends Type {
  paramName: string;
  body: Type;

  constructor(paramName: string, body: Type) {
    super();
    this.paramName = paramName;
    this.body      = body;
  }

  toString(): string {
    return "forall " + this.paramName + ". " + this.body.toString();
  }

  renameTyVars(oldName: string, newName: string): Type {
    if (this.paramName === oldName) {
      return this;
    }
    else if (this.paramName === newName) {
      throw new Error(`cannot rename type variable "${oldName}" to "${newName}"`);
    }
    else {
      return new TyAll(
       this.paramName,
       this.body.renameTyVars(oldName, newName)
     );
    }
  }
}
