class Term {
    constructor() {

    }

    eval(log) {
        let term = this;
        if (log) {
            console.log(term.toString());
        }
        while (!(term instanceof Val)) {
            term = term.eval1();
            if (log) {
                console.log(`\t-> ${term.toString()}`);
            }
        }
        return term;
    }
}

class Val extends Term {
    constructor() {
        super();
    }

    eval1() {
        return this;
    }
}

class Var extends Val {
    constructor(name) {
        super();
        this.name = name;
    }

    toString() {
        return this.name;
    }

    subst(name, term) {
        if (this.name === name) {
            return term;
        }
        else {
            return this;
        }
    }
}

class Abs extends Val {
    constructor(arg, body) {
        super();
        this.arg  = arg;
        this.body = body;
    }

    toString() {
        return `\u001b[1;32mλ\u001b[22;39m${this.arg}. ${this.body.toString()}`;
    }

    subst(name, term) {
        if (name === this.arg) {
            return this;
        }
        else {
            return new Abs(this.arg, this.body.subst(name, term));
        }
    }
}

class App extends Term {
    constructor(func, arg) {
        super();
        this.func = func;
        this.arg  = arg;
    }

    toString() {
        let funcStr = this.func instanceof Var || this.func instanceof App
            ? this.func.toString()
            : `(${this.func.toString()})`;
        let argStr = this.arg instanceof Var
            ? this.arg.toString()
            : `(${this.arg.toString()})`;
        return `${funcStr} ${argStr}`
    }

    subst(name, term) {
        return new App(this.func.subst(name, term), this.arg.subst(name, term));
    }

    eval1() {
        if (!(this.func instanceof Val)) {
            return new App(this.func.eval1(), this.arg);
        }
        else if (!(this.arg instanceof Val)) {
            return new App(this.func, this.arg.eval1());
        }
        else {
            return this.func.body.subst(this.func.arg, this.arg);
        }
    }
}

let parse = (() => {
    const lq = require("loquat");
    let langDef = new lq.LanguageDef(
        "",
        "",
        "",
        true,
        lq.letter,
        lq.alphaNum.or(lq.oneOf("_'")),
        lq.oneOf(":!#$%&*+./<=>?@\\^|-~"),
        lq.oneOf(":!#$%&*+./<=>?@\\^|-~"),
        [],
        [],
        true
    );
    let tp = lq.makeTokenParser(langDef);
    let term = lq.lazy(() => lq.choice([
        abs,
        app,
        tp.parens(term)
    ]));
    let aterm = lq.lazy(() => lq.choice([
        variable,
        tp.parens(term)
    ]));
    let variable = lq.gen(function * () {
        let name = yield tp.identifier;
        return new Var(name);
    });
    let abs = lq.gen(function * () {
        yield tp.reservedOp("λ");
        let arg = yield tp.identifier;
        yield tp.reservedOp(".");
        let body = yield term;
        return new Abs(arg, body);
    });
    let app = lq.gen(function * () {
        let func = yield aterm;
        let args = yield aterm.many();
        return args.reduce((f, x) => new App(f, x), func);
    });
    let prog = tp.whiteSpace.then(term).left(lq.eof);
    return function parse(src) {
        let res = lq.parse(prog, "", src, 8);
        if (res.succeeded) {
            return res.value;
        }
        else {
            throw res.error;
        }
    };
})();

let I = parse(`λx. x`);
let K = parse(`λx. λy. x`);
let S = parse(`λx. λy. λz. x z (y z)`);
let Y = parse(`λf. (λx. f (λy. x x y)) (λx. f (λy. x x y))`);

console.log(`I = ${I.toString()}`);
console.log(`K = ${K.toString()}`);
console.log(`S = ${S.toString()}`);
console.log(`Y = ${Y.toString()}`);

let SKIq = parse(`(λx. λy. λz. x z (y z)) (λx. λy. x) (λx. x) q`);
SKIq.eval(true);

class IxTerm {
    constructor() {

    }

    eval(log) {
        let term = this;
        if (log) {
            console.log(term.toString());
        }
        while (!(term instanceof IxVal)) {
            term = term.eval1();
            if (log) {
                console.log(`\t-> ${term.toString()}`);
            }
        }
        return term;
    }
}

class IxVal extends IxTerm {
    constructor() {
        super();
    }

    eval1() {
        return this;
    }
}

class IxVar extends IxVal {
    constructor(index) {
        super();
        this.index = index;
    }

    toString() {
        return this.index;
    }

    shift(i, n) {
        return new IxVar(this.index >= i ? this.index + n : this.index);
    }

    subst(n, term) {
        if (this.index === n) {
            return term;
        }
        else {
            return this;
        }
    }

    contains(n) {
        return this.index === n;
    }
}

class IxAbs extends IxVal {
    constructor(body) {
        super();
        this.body = body;
    }

    toString() {
        return `\u001b[1;33mλ\u001b[22;39m. ${this.body.toString()}`;
    }

    shift(i, n) {
        return new IxAbs(this.body.shift(i + 1, n));
    }

    subst(n, term) {
        return new IxAbs(this.body.subst(n + 1, term.shift(0, 1)));
    }

    contains(n) {
        return this.body.contains(n + 1);
    }
}

class IxApp extends IxTerm {
    constructor(func, arg) {
        super();
        this.func = func;
        this.arg  = arg;
    }

    toString() {
        let funcStr = this.func instanceof IxVar || this.func instanceof IxApp
            ? this.func.toString()
            : `(${this.func.toString()})`;
        let argStr = this.arg instanceof IxVar
            ? this.arg.toString()
            : `(${this.arg.toString()})`;
        return `${funcStr} ${argStr}`
    }

    shift(i, n) {
        return new IxApp(this.func.shift(i, n), this.arg.shift(i, n));
    }

    subst(n, term) {
        return new IxApp(this.func.subst(n, term), this.arg.subst(n, term));
    }

    eval1() {
        if (!(this.func instanceof IxVal)) {
            return new IxApp(this.func.eval1(), this.arg);
        }
        else if (!(this.arg instanceof IxVal)) {
            return new IxApp(this.func, this.arg.eval1());
        }
        else {
            return this.func.body.subst(0, this.arg.shift(0, 1)).shift(0, -1);
        }
    }

    contains(n) {
        return this.func.contains(n) || this.arg.contains(n);
    }
}

function deBruijnIndex(term, ctx) {
    if (term instanceof Var) {
        let n = ctx.indexOf(term.name);
        if (n >= 0) {
            return new IxVar(n);
        }
        else {
            throw new Error("unbound variable: " + term.name);
        }
    }
    else if (term instanceof Abs) {
        return new IxAbs(deBruijnIndex(term.body, [term.arg].concat(ctx)));
    }
    else if (term instanceof App) {
        return new IxApp(deBruijnIndex(term.func, ctx), deBruijnIndex(term.arg, ctx));
    }
    else {
        throw new Error("unexpected term");
    }
}

let ix = deBruijnIndex;

let ixI = deBruijnIndex(I, []);
let ixK = deBruijnIndex(K, []);
let ixS = deBruijnIndex(S, []);
let ixY = deBruijnIndex(Y, []);

console.log(`I = ${ixI.toString()}`);
console.log(`K = ${ixK.toString()}`);
console.log(`S = ${ixS.toString()}`);
console.log(`Y = ${ixY.toString()}`);

let IxSKIq = deBruijnIndex(SKIq, ["q"]);
IxSKIq.eval(true);

function cpsTransform(term) {
    if (term instanceof IxVar) {
        return new IxAbs(
                new IxApp(
                    new IxVar(0),
                    term.shift(0, 1)
                )
            );
    }
    else if (term instanceof IxAbs) {
        return new IxAbs(
                new IxApp(
                    new IxVar(0),
                    new IxAbs(
                        cpsTransform(term.body.shift(1, 1))
                    )
                )
            );
    }
    else if (term instanceof IxApp) {
        return new IxAbs(
                new IxApp(
                    cpsTransform(term.func.shift(0, 1)),
                    new IxAbs(
                        new IxApp(
                            cpsTransform(term.arg.shift(0, 2)),
                            new IxAbs(
                                new IxApp(
                                    new IxApp(
                                        new IxVar(1), new IxVar(0)
                                    ),
                                    new IxVar(2)
                                )
                            )
                        )
                    )
                )
            );
    }
    else {
        throw new Error("unexpected term");
    }
}

let cps = cpsTransform;

function evalCPS(term, log) {
    term = new IxApp(term, ixI);
    return term.eval(log);
}

let cpsI = cpsTransform(ixI);
let cpsK = cpsTransform(ixK);
let cpsS = cpsTransform(ixS);
let cpsY = cpsTransform(ixY);
console.log(`I' = ${cpsI.toString()}`);
console.log(`K' = ${cpsK.toString()}`);
console.log(`S' = ${cpsS.toString()}`);
console.log(`Y' = ${cpsY.toString()}`);

let cpsSKIq = cpsTransform(IxSKIq);
evalCPS(cpsSKIq, true);

class IxAbs2 extends IxVal {
    constructor(body) {
        super();
        this.body = body;
    }

    toString() {
        return `\u001b[1;36mμ\u001b[22;39m. ${this.body.toString()}`;
    }

    shift(i, n) {
        return new IxAbs2(this.body.shift(i + 1, n));
    }

    subst(n, term) {
        return new IxAbs2(this.body.subst(n + 1, term.shift(0, 1)));
    }

    contains(n) {
        return this.body.contains(n + 1);
    }
}

function cpsTransformMod(term) {
    if (term instanceof IxVar) {
        return new IxAbs2(
                new IxApp(
                    new IxVar(0),
                    term.shift(0, 1)
                )
            );
    }
    else if (term instanceof IxAbs) {
        return new IxAbs2(
                new IxApp(
                    new IxVar(0),
                    new IxAbs(
                        cpsTransformMod(term.body.shift(1, 1))
                    )
                )
            );
    }
    else if (term instanceof IxApp) {
        return new IxAbs2(
                new IxApp(
                    cpsTransformMod(term.func.shift(0, 1)),
                    new IxAbs2(
                        new IxApp(
                            cpsTransformMod(term.arg.shift(0, 2)),
                            new IxAbs2(
                                new IxApp(
                                    new IxApp(
                                        new IxVar(1), new IxVar(0)
                                    ),
                                    new IxVar(2)
                                )
                            )
                        )
                    )
                )
            );
    }
    else {
        throw new Error("unexpected term");
    }
}

let cpsMod = cpsTransformMod;

let cpsModI = cpsTransformMod(ixI);
let cpsModK = cpsTransformMod(ixK);
let cpsModS = cpsTransformMod(ixS);
let cpsModY = cpsTransformMod(ixY);
console.log(`I'' = ${cpsModI.toString()}`);
console.log(`K'' = ${cpsModK.toString()}`);
console.log(`S'' = ${cpsModS.toString()}`);
console.log(`Y'' = ${cpsModY.toString()}`);

let cpsModSKIq = cpsTransformMod(IxSKIq);
evalCPS(cpsModSKIq, true);

function normalize2(term) {
    if (term instanceof IxVar) {
        return term;
    }
    else if (term instanceof IxAbs) {
        return new IxAbs(normalize2(term.body));
    }
    else if (term instanceof IxApp) {
        let func = normalize2(term.func);
        let arg  = normalize2(term.arg);
        if (func instanceof IxAbs2) {
            return normalize2(func.body.subst(0, arg.shift(0, 1)).shift(0, -1));
        }
        else {
            return new IxApp(func, arg);
        }
    }
    else if (term instanceof IxAbs2) {
        let body = normalize2(term.body);
        if (term.body instanceof IxApp && term.body.arg instanceof IxVar
            && term.body.arg.index === 0 && !term.body.func.contains(0)) {
            return normalize2(term.body.func.shift(1, -1));
        }
        else {
            return new IxAbs2(body);
        }
    }
    else {
        throw new Error("unexpected term");
    }
}

function cpsTransform2(term) {
    return normalize2(cpsTransformMod(term));
}

let cps2 = cpsTransform2;

let cps2I = cpsTransform2(ixI);
let cps2K = cpsTransform2(ixK);
let cps2S = cpsTransform2(ixS);
let cps2Y = cpsTransform2(ixY);
console.log(`I2 = ${cps2I.toString()}`);
console.log(`K2 = ${cps2K.toString()}`);
console.log(`S2 = ${cps2S.toString()}`);
console.log(`Y2 = ${cps2Y.toString()}`);

let cps2SKIq = cpsTransform2(IxSKIq);
evalCPS(cps2SKIq, true);
