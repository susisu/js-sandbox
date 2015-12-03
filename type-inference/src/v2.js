"use strict";

// Terms
class Term {
    toString() {
        return "?";
    }

    tp(typeInfer, env, subst, type) {
        throw new Error("unknown term");
    }
}

// Variable
class Var extends Term {
    constructor(name) {
        super();
        this.name = name;
    }

    toString() {
        return this.name;
    }

    tp(typeInfer, env, subst, type) {
        typeInfer.current = this;
        var res = env.lookup(this.name);
        if (res === undefined) {
            throw new Error("undefined: " + this.name);
        }
        else {
            return subst.mgu(res.newInstance(typeInfer), type);
        }
    }
}

// Lambda abstraction
class Lam extends Term {
    constructor(param, body) {
        super();
        this.param = param;
        this.body  = body;
    }

    toString() {
        return "\\" + this.param + " -> " + this.body.toString();
    }

    tp(typeInfer, env, subst, type) {
        typeInfer.current = this;
        var a = typeInfer.newTyvar();
        var b = typeInfer.newTyvar();
        var s = subst.mgu(type, new Arrow(a, b));
        var e = env.clone();
        e.set(this.param, new TypeScheme([], a));
        return this.body.tp(typeInfer, e, s, b);
    }
}

// Function application
class App extends Term {
    constructor(func, arg) {
        super();
        this.func = func;
        this.arg  = arg;
    }

    toString() {
        var funcStr = this.func instanceof Var || this.func instanceof App
            ? this.func.toString()
            : "(" + this.func.toString() + ")";
        var argStr = this.arg instanceof Var
            ? this.arg.toString()
            : "(" + this.arg.toString() + ")";
        return funcStr + " " + argStr;
    }

    tp(typeInfer, env, subst, type) {
        typeInfer.current = this;
        var a = typeInfer.newTyvar();
        var s = this.func.tp(typeInfer, env, subst, new Arrow(a, type));
        return this.arg.tp(typeInfer, env, s, a);
    }
}

// Let-in binding
class Let extends Term {
    constructor(name, term, body) {
        super();
        this.name = name;
        this.term = term;
        this.body = body;
    }

    toString() {
        return "let " + this.name + " = " + this.term.toString()
            + " in " + this.body.toString();
    }

    tp(typeInfer, env, subst, type) {
        typeInfer.current = this;
        var a = typeInfer.newTyvar();
        var s = this.term.tp(typeInfer, env, subst, a);
        var e = env.clone();
        e.set(this.name, s.apply(a).genTypeScheme(s.applyToEnv(env)));
        return this.body.tp(typeInfer, e, s, type);
    }
}

class Letrec extends Term {
    constructor(name, term, body) {
        super();
        this.name = name;
        this.term = term;
        this.body = body;
    }

    toString() {
        return "letrec " + this.name + " = " + this.term.toString()
            + " in " + this.body.toString();
    }

    tp(typeInfer, env, subst, type) {
        typeInfer.current = this;
        var a = typeInfer.newTyvar();
        var e = env.clone();
        e.set(this.name, new TypeScheme([], a));
        var s = this.term.tp(typeInfer, e, subst, a);
        return this.body.tp(typeInfer, e, s, type);
    }
}

// Types
class Type {
    toString() {
        return "?";
    }

    equals(type) {
        return false;
    }

    getTyvars() {
        return [];
    }

    genTypeScheme(env) {
        return new TypeScheme(diff(this.getTyvars(), env.getTyvars()), this);
    }
}

// Type variable
class Tyvar extends Type {
    constructor(name) {
        super();
        this.name = name;
    }

    toString() {
        return this.name;
    }

    equals(type) {
        return type instanceof Tyvar
            && this.name === type.name;
    }

    getTyvars() {
        return [this];
    }
}

// Arrow (->)
class Arrow extends Type {
    constructor(dom, codom) {
        super();
        this.dom   = dom;
        this.codom = codom;
    }

    toString() {
        var domStr = this.dom instanceof Arrow
            ? "(" + this.dom.toString() + ")"
            : this.dom.toString();
        return domStr + " -> " + this.codom.toString();
    }

    equals(type) {
        return type instanceof Arrow
            && this.dom.equals(type.dom)
            && this.codom.equals(type.codom);
    }

    getTyvars() {
        return union(this.dom.getTyvars(), this.codom.getTyvars());
    }
}

// Type constructor
class Tycon extends Type {
    constructor(name, args) {
        super();
        this.name = name;
        this.args = args;
    }

    toString() {
        var argsStr = this.args.length > 0
            ? " " + this.args.map(arg =>
                    arg instanceof Arrow || arg instanceof Tycon
                        ? "(" + arg.toString() + ")"
                        : arg.toString()
                ).join(" ")
            : "";
        return this.name + argsStr;
    }

    equals(type) {
        return type instanceof Tycon
            && this.name === type.name
            && this.args.length === type.args.length
            && this.args.every((arg, i) => arg.equals(type.args[i]));
    }

    getTyvars() {
        return this.args.reduce((tyvars, arg) => union(tyvars, arg.getTyvars()), []);
    }
}


// Utilities for list of types
function union(types1, types2) {
    var list = [];
    var i;
    for (i = 0; i < types1.length; i++) {
        if (list.find(type => type.equals(types1[i])) === undefined) {
            list.push(types1[i]);
        }
    }
    for (i = 0; i < types2.length; i++) {
        if (list.find(type => type.equals(types2[i])) === undefined) {
            list.push(types2[i]);
        }
    }
    return list;
}

function diff(types1, types2) {
    var list = [];
    for (var i = 0; i < types1.length; i++) {
        if (list.find(type => type.equals(types1[i])) === undefined
            && types2.find(type => type.equals(types1[i])) === undefined) {
            list.push(types1[i]);
        }
    }
    return list;
}


// Substitution
class Subst {
    constructor(dict) {
        this.dict = dict;
    }

    apply(type) {
        if (type instanceof Tyvar) {
            var res = this.dict[type.name];
            return res === undefined || res.equals(type)
                ? type
                : this.apply(res);
        }
        else if (type instanceof Arrow) {
            return new Arrow(this.apply(type.dom), this.apply(type.codom));
        }
        else if (type instanceof Tycon) {
            return new Tycon(type.name, type.args.map(arg => this.apply(arg)));
        }
        else {
            throw new Error("unknown type");
        }
    }

    applyToEnv(env) {
        var newEnvDict = Object.create(null);
        for (var name in env.dict) {
            var typeScheme = env.lookup(name);
            // assumes tyvars don't occur in this substitution
            newEnvDict[name] = new TypeScheme(typeScheme.tyvars, this.apply(typeScheme.type));
        }
        return new Env(newEnvDict);
    }

    extend(tyvar, type) {
        var newDict = Object.create(this.dict);
        newDict[tyvar.name] = type;
        return new Subst(newDict);
    }

    // Most general unifier
    mgu(type1, type2) {
        var t = this.apply(type1),
            u = this.apply(type2);
        if (t instanceof Tyvar && u instanceof Tyvar
            && t.equals(u)) {
            return this;
        }
        else if (t instanceof Tyvar
            && u.getTyvars().every(tyvar => !tyvar.equals(t))) {
            return this.extend(t, u);
        }
        else if (u instanceof Tyvar
            && t.getTyvars().every(tyvar => !tyvar.equals(u))) {
            return this.extend(u, t);
        }
        else if (t instanceof Arrow && u instanceof Arrow) {
            return this.mgu(t.dom, u.dom).mgu(t.codom, u.codom);
        }
        else if (t instanceof Tycon && u instanceof Tycon
            && t.name === u.name && t.args.length === u.args.length) {
            return t.args.reduce(
                (s, targ, i) => s.mgu(targ, u.args[i]),
                this
            );
        }
        else {
            throw new Error(
                "cannot unify " + type1.toString() + " with " + type2.toString()
            );
        }
    }
}

var emptySubst = new Subst(Object.create(null));


// Type scheme (forall <tyvars>. <type>)
class TypeScheme {
    constructor(tyvars, type) {
        this.tyvars = tyvars;
        this.type   = type;
    }

    newInstance(typeInfer) {
        var subst = this.tyvars.reduce(
            (s, tyvar) => s.extend(tyvar, typeInfer.newTyvar()),
            emptySubst
        );
        return subst.apply(this.type);
    }

    getTyvars() {
        return diff(this.type.getTyvars(), this.tyvars);
    }

    toString() {
        var tyvarsStr = this.tyvars.length > 0
            ? "forall " + this.tyvars.map(tyvar => tyvar.toString()).join(" ") + ". "
            : "";
        return tyvarsStr + this.type.toString();
    }
}


// Environment
class Env {
    constructor(dict) {
        this.dict = dict;
    }

    getTyvars() {
        var tyvars = [];
        for (var name in this.dict) {
            tyvars = union(tyvars, this.dict[name].getTyvars());
        }
        return tyvars;
    }

    lookup(name) {
        return this.dict[name];
    }

    clone() {
        return new Env(Object.create(this.dict));
    }

    set(name, typeScheme) {
        this.dict[name] = typeScheme;
    }
}

var emptyEnv = new Env(Object.create(null));


// Type inference
class TypeInfer {
    constructor() {
        this.n       = 0;
        this.current = undefined;
    }

    newTyvar() {
        this.n += 1;
        return new Tyvar("a" + this.n.toString());
    }

    typeOf(env, term) {
        try {
            var a = this.newTyvar();
            return term.tp(this, env, emptySubst, a).apply(a);
        }
        catch (error) {
            throw new Error("cannot type " + term.toString() + ": " + error.message);
        }
    }

    showType(env, term) {
        return this.typeOf(env, term).toString();
    }
}


// Examples
var typeInfer = new TypeInfer();
var env = emptyEnv;

console.log(
    typeInfer.showType(env,
        new Lam("x",
            new Var("x")
        )
    )
);

console.log(
    typeInfer.showType(env,
        new Lam("x",
            new Lam("y",
                new Var("x")
            )
        )
    )
);

console.log(
    typeInfer.showType(env,
        new Lam("x",
            new Lam("y",
                new Lam("z",
                    new App(
                        new App(new Var("x"), new Var("z")),
                        new App(new Var("y"), new Var("z"))
                    )
                )
            )
        )
    )
);
