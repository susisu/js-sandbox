/*
    Hindley/Milner type inference
    ref: http://www29.atwiki.jp/tmiya/pages/78.html
*/

"use strict";

class Term {
    toString() {
        return "?";
    }
}

class Var extends Term {
    constructor(name) {
        super();
        this.name = name;
    }

    toString() {
        return this.name;
    }
}

class Lam extends Term {
    constructor(argName, body) {
        super();
        this.argName = argName;
        this.body    = body;
    }

    toString() {
        return "(\\" + this.argName + " -> " + this.body.toString() + ")";
    }
}

class App extends Term {
    constructor(func, arg) {
        super();
        this.func = func;
        this.arg  = arg;
    }

    toString() {
        return "(" + this.func.toString() + " " + this.arg.toString() + ")";
    }
}

class Let extends Term {
    constructor(name, bound, body) {
        super();
        this.name  = name;
        this.bound = bound;
        this.body  = body;
    }

    toString() {
        return "let " + this.name + " = " + this.bound.toString()
            + " in " + this.body.toString();
    }
}


class Type {
    toString() {
        return "?";
    }
}

class Tyvar extends Type {
    constructor(name) {
        super();
        this.name = name;
    }

    toString() {
        return this.name;
    }
}

class Arrow extends Type {
    constructor(dom, codom) {
        super();
        this.dom   = dom;
        this.codom = codom;
    }

    toString() {
        return "(" + this.dom.toString() + " -> " + this.codom.toString() + ")";
    }
}

class Tycon extends Type {
    constructor(name, args) {
        super();
        this.name = name;
        this.args = args;
    }

    toString() {
        return this.name
            + (this.args.length > 0
                ? " " + this.args.map(type => type.toString()).join(" ")
                : ""
            );
    }
}

var n = 0;

function newTyvar() {
    n += 1;
    return new Tyvar("a"+ n.toString());
}

class Subst {
    constructor(lookup) {
        this.lookup = lookup;
    }

    apply(type) {
        if (type instanceof Tyvar) {
            var t = this.lookup(type);
            return t === type
                ? type
                : this.apply(t);
        }
        else if (type instanceof Arrow) {
            return new Arrow(this.apply(type.dom), this.apply(type.codom));
        }
        else if (type instanceof Tycon) {
            return new Tycon(type.name, type.args.map(arg => this.apply(arg)));
        }
    }

    extend(tyvar, type) {
        return new Subst(
            t => tyvar === t
                ? type
                : this.lookup(t)
        );
    }
}

var emptySubst = new Subst(t => t);


class TypeScheme {
    constructor(tyvars, type) {
        this.tyvars = tyvars;
        this.type   = type;
    }

    newInstance() {
        return this.tyvars.reduce(
                (subst, tyvar) => subst.extend(tyvar, newTyvar()),
                emptySubst
            ).apply(this.type);
    }
}

// env: String -> TypeScheme

function lookup(env, name) {
    return env[name];
}

function union(arr1, arr2) {
    var res = [],
        i, j, t,
        len1 = arr1.length,
        len2 = arr2.length;
    loop: for (i = 0; i < len1; i++) {
        t = arr1[i];
        for (j = 0; j < res.length; j++) {
            if (t === res[j]) {
                continue loop;
            }
        }
        res.push(t);
    }
    loop: for (i = 0; i < len2; i++) {
        t = arr2[i];
        for (j = 0; j < res.length; j++) {
            if (t === res[j]) {
                continue loop;
            }
        }
        res.push(t);
    }
    return res;
}

function diff(arr1, arr2) {
    var res = [],
        i, j, t,
        len1 = arr1.length,
        len2 = arr2.length;
    loop: for (i = 0; i < len1; i++) {
        t = arr1[i];
        for (j = 0; j < len2; j++) {
            if (t === arr2[j]) {
                continue loop;
            }
        }
        res.push(t);
    }
    return res;
}

function typeTyvars(type) {
    if (type instanceof Tyvar) {
        return [type];
    }
    else if (type instanceof Arrow) {
        return union(typeTyvars(type.dom), typeTyvars(type.codom))
    }
    else if (type instanceof Tycon) {
        return type.args.reduce((tyvars, t) => union(tyvars, typeTyvars(t)), []);
    }
}

function typeSchemeTyvars(typeScheme) {
    return diff(typeTyvars(typeScheme.type), typeScheme.tyvars);
}

function envTyvars(env) {
    var tyvars = [];
    for (var name in env) {
        tyvars = union(tyvars, typeSchemeTyvars(env[name]));
    }
    return tyvars;
}

function gen(env, type) {
    return new TypeScheme(diff(typeTyvars(type), envTyvars(env)), type);
}


function mgu(type1, type2, subst) {
    var t = subst.apply(type1),
        u = subst.apply(type2);
    if (t instanceof Tyvar
        && u instanceof Tyvar
        && t.name === u.name) {
        return subst.extend(t, type2);
    }
    else if (t instanceof Tyvar
        && !typeTyvars(type2).some(tyvar => tyvar.name === t.name)) {
        return subst.extend(t, type2);
    }
    else if (u instanceof Tyvar) {
        return mgu(type2, type1, subst);
    }
    else if (t instanceof Arrow
        && u instanceof Arrow) {
        return mgu(t.dom, u.dom, mgu(t.codom, u.codom, subst));
    }
    else if (t instanceof Tycon
        && u instanceof Tycon
        && t.name === u.name
        && t.args.length === u.args.length) {
        return t.args.reduce((s, targ, i) => mgu(targ, u.args[i], s), subst);
    }
    else {
        throw new TypeError("cannot unify " + t.toString() + " with " + u.toString());
    }
}

var current = null;

function tp(env, term, type, subst) {
    current = term;
    var a, b, s, t, e;
    if (term instanceof Var) {
        t = lookup(env, term.name);
        if (t === undefined) {
            throw new TypeError("undefined: " + term.name);
        }
        else {
            return mgu(t.newInstance(), type, subst);
        }
    }
    else if (term instanceof Lam) {
        a = newTyvar();
        b = newTyvar();
        s = mgu(type, new Arrow(a, b), subst);
        e = Object.create(env);
        e[term.argName] = new TypeScheme([], a);
        return tp(e, term.body, b, s);
    }
    else if (term instanceof App) {
        a = newTyvar();
        s = tp(env, term.func, new Arrow(a, type), subst);
        return tp(env, term.arg, a, s);
    }
    else if (term instanceof Let) {
        a = newTyvar();
        s = tp(env, term.bound, a, subst);
        e = Object.create(env);
        e[term.name] = gen(env, s.apply(a));
        return tp(e, term.body, type, s);
    }
}

function typeOf(env, term) {
    var a = newTyvar();
    return tp(env, term, a, emptySubst).apply(a);
}


var booleanType = new Tycon("Boolean", []);
var intType = new Tycon("Int", []);
function listType(type) {
    return new Tycon("List", [type]);
}

function pgen(type) {
    return gen([], type);
}

var a = newTyvar();
var env = Object.create(null);
env["true"] = pgen(booleanType);
env["false"] = pgen(booleanType);
env["if"] = pgen(new Arrow(booleanType, new Arrow(a, new Arrow(a, a))));
env["zero"] = pgen(intType);
env["succ"] = pgen(new Arrow(intType, intType));
env["nil"] = pgen(listType(a));
env["cons"] = pgen(new Arrow(a, new Arrow(listType(a), listType(a))));
env["isEmpty"] = pgen(new Arrow(listType(a), booleanType));

function showType(env, term) {
    return typeOf(env, term).toString();
}

console.log(
    showType(env,
        new Lam("x",
            new App(
                new App(new Var("cons"), new Var("x")),
                new Var("nil")
            )
        )
    )
);
