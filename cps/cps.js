"use strict";

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

    toFuncString() {
        return this.toString();
    }

    toArgString() {
        return this.toString();
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

    toFuncString() {
        return `(${this.toString()})`;
    }

    toArgString() {
        return `(${this.toString()})`;
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
        return `${this.func.toFuncString()} ${this.arg.toArgString()}`;
    }

    toFuncString() {
        return this.toString();
    }

    toArgString() {
        return `(${this.toString()})`;
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
        return this.index.toString();
    }

    toFuncString() {
        return this.toString();
    }

    toArgString() {
        return this.toString();
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
        return `\u001b[1;32mλ\u001b[22;39m. ${this.body.toString()}`;
    }

    toFuncString() {
        return `(${this.toString()})`;
    }

    toArgString() {
        return `(${this.toString()})`;
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
        return `${this.func.toFuncString()} ${this.arg.toArgString()}`;
    }

    toFuncString() {
        return this.toString();
    }

    toArgString() {
        return `(${this.toString()})`;
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
console.log(`I = ${cpsI.toString()}`);
console.log(`K = ${cpsK.toString()}`);
console.log(`S = ${cpsS.toString()}`);
console.log(`Y = ${cpsY.toString()}`);

let cpsSKIq = cpsTransform(IxSKIq);
evalCPS(cpsSKIq, true);

class IxContVal extends IxVal {
    constructor() {
        super();
    }
}

class IxContVar extends IxContVal {
    constructor(index) {
        super();
        this.index = index;
    }

    toString() {
        return `\u001b[1;37m${this.index.toString()}\u001b[22;39m`;
    }

    toFuncString() {
        return this.toString();
    }

    toArgString() {
        return this.toString();
    }

    shift(i, n) {
        return new IxContVar(this.index >= i ? this.index + n : this.index);
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

class IxContAbs extends IxContVal {
    constructor(body) {
        super();
        this.body = body;
    }

    toString() {
        return `\u001b[1;33mμ\u001b[22;39m. ${this.body.toString()}`;
    }

    toFuncString() {
        return `(${this.toString()})`;
    }

    toArgString() {
        return `(${this.toString()})`;
    }

    shift(i, n) {
        return new IxContAbs(this.body.shift(i + 1, n));
    }

    subst(n, term) {
        return new IxContAbs(this.body.subst(n + 1, term.shift(0, 1)));
    }

    contains(n) {
        return this.body.contains(n + 1);
    }
}

class IxCPSTerm extends IxVal {
    constructor(body) {
        super();
        this.body = body;
    }

    toString() {
        return `\u001b[1;36mδ\u001b[22;39m. ${this.body.toString()}`;
    }

    toFuncString() {
        return `(${this.toString()})`;
    }

    toArgString() {
        return `(${this.toString()})`;
    }

    shift(i, n) {
        return new IxCPSTerm(this.body.shift(i + 1, n));
    }

    subst(n, term) {
        return new IxCPSTerm(this.body.subst(n + 1, term.shift(0, 1)));
    }

    contains(n) {
        return this.body.contains(n + 1);
    }
}

function cpsTransformMod(term) {
    if (term instanceof IxVar) {
        return new IxCPSTerm(
                new IxApp(
                    new IxContVar(0),
                    term.shift(0, 1)
                )
            );
    }
    else if (term instanceof IxAbs) {
        return new IxCPSTerm(
                new IxApp(
                    new IxContVar(0),
                    new IxAbs(
                        cpsTransformMod(term.body.shift(1, 1))
                    )
                )
            );
    }
    else if (term instanceof IxApp) {
        return new IxCPSTerm(
                new IxApp(
                    cpsTransformMod(term.func.shift(0, 1)),
                    new IxContAbs(
                        new IxApp(
                            cpsTransformMod(term.arg.shift(0, 2)),
                            new IxContAbs(
                                new IxApp(
                                    new IxApp(
                                        new IxVar(1), new IxVar(0)
                                    ),
                                    new IxContVar(2)
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
console.log(`I = ${cpsModI.toString()}`);
console.log(`K = ${cpsModK.toString()}`);
console.log(`S = ${cpsModS.toString()}`);
console.log(`Y = ${cpsModY.toString()}`);

let cpsModSKIq = cpsTransformMod(IxSKIq);
evalCPS(cpsModSKIq, true);

function normalize2(term) {
    if (term instanceof IxVar || term instanceof IxContVar) {
        return term;
    }
    else if (term instanceof IxAbs) {
        return new IxAbs(normalize2(term.body));
    }
    else if (term instanceof IxApp) {
        let func = normalize2(term.func);
        let arg  = normalize2(term.arg);
        if (func instanceof IxCPSTerm || func instanceof IxContAbs) {
            return normalize2(func.body.subst(0, arg.shift(0, 1)).shift(0, -1));
        }
        else {
            return new IxApp(func, arg);
        }
    }
    else if (term instanceof IxCPSTerm) {
        let body = normalize2(term.body);
        if (term.body instanceof IxApp && term.body.arg instanceof IxContVar
            && term.body.arg.index === 0 && !term.body.func.contains(0)) {
            return normalize2(term.body.func.shift(1, -1));
        }
        else {
            return new IxCPSTerm(body);
        }
    }
    else if (term instanceof IxContAbs) {
        let body = normalize2(term.body);
        if (term.body instanceof IxApp && term.body.arg instanceof IxContVar
            && term.body.arg.index === 0 && !term.body.func.contains(0)) {
            return normalize2(term.body.func.shift(1, -1));
        }
        else {
            return new IxContAbs(body);
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
console.log(`I = ${cps2I.toString()}`);
console.log(`K = ${cps2K.toString()}`);
console.log(`S = ${cps2S.toString()}`);
console.log(`Y = ${cps2Y.toString()}`);

let cps2SKIq = cpsTransform2(IxSKIq);
evalCPS(cps2SKIq, true);

class IxLet extends IxTerm {
    constructor(expr, body) {
        super();
        this.expr = expr;
        this.body = body;
    }

    toString() {
        return `\u001b[1;35mlet\u001b[22;39m (${this.expr.toString()}) \u001b[1;35min\u001b[22;39m ${this.body.toString()}`;
    }

    toFuncString() {
        return `(${this.toString()})`;
    }

    toArgString() {
        return `(${this.toString()})`;
    }

    shift(i, n) {
        return new IxLet(this.expr.shift(i, n), this.body.shift(i + 1, n));
    }

    subst(n, term) {
        return new IxLet(this.expr.subst(n, term), this.body.subst(n + 1, term.shift(0, 1)));
    }

    eval1() {
        if (!(this.expr instanceof IxVal)) {
            return new IxLet(this.expr.eval1(), this.body);
        }
        else {
            return this.body.subst(0, this.expr.shift(0, 1)).shift(0, -1);
        }
    }

    contains(n) {
        return this.expr.contains(n) || this.body.contains(n + 1);
    }
}

function unCPSTransform(term) {
    if (term instanceof IxCPSTerm) {
        return unCPSExpr(term.body).shift(1, -1);
    }
    else {
        throw new Error("unexpected term");
    }
}

function unCPSExpr(term) {
    if (term instanceof IxApp) {
        if (term.func instanceof IxContVar && term.func.index === 0 && !term.arg.contains(0)) {
            if (term.arg instanceof IxVar) {
                return term.arg;
            }
            else if (term.arg instanceof IxAbs) {
                return new IxAbs(unCPSTransform(term.arg.body));
            }
            else {
                throw new Error("invalid form");
            }
        }
        else if (term.func instanceof IxCPSTerm && term.arg instanceof IxContVal) {
            let func = unCPSTransform(term.func);
            if (term.arg instanceof IxContVar) {
                return func;
            }
            else if (term.arg instanceof IxContAbs) {
                if (func instanceof IxVar) {
                    return unCPSExpr(term.arg.body.subst(0, func.shift(0, 1)).shift(0, -1));
                }
                else {
                    return expandLet(func, unCPSExpr(term.arg.body));
                }
            }
            else {
                throw new Error("unexpected term");
            }
        }
        else if (term.func instanceof IxApp && term.func.func instanceof IxVar && term.func.arg instanceof IxVar && term.arg instanceof IxContVal) {
            if (term.arg instanceof IxContVar) {
                return term.func;
            }
            else if (term.arg instanceof IxContAbs) {
                return new IxLet(term.func, unCPSExpr(term.arg.body));
            }
            else {
                throw new Error("unexpected term");
            }
        }
    }
    else {
        throw new Error("invalid form");
    }
}

function expandLet(term, body) {
    if (term instanceof IxLet) {
        return new IxLet(term.expr, expandLet(term.body, body.shift(1, 1)));
    }
    else {
        return new IxLet(term, body);
    }
}

let unCPS = unCPSTransform;

let unCPSI = unCPSTransform(cpsModI);
let unCPSK = unCPSTransform(cpsModK);
let unCPSS = unCPSTransform(cpsModS);
let unCPSY = unCPSTransform(cpsModY);
console.log(`I = ${unCPSI.toString()}`);
console.log(`K = ${unCPSK.toString()}`);
console.log(`S = ${unCPSS.toString()}`);
console.log(`Y = ${unCPSY.toString()}`);

let unCPSSKIq = unCPSTransform(cpsModSKIq);
unCPSSKIq.eval(true);

class EvalContext {
    constructor() {
    }

    compose(ctx) {
        return new CompositionContext(this, ctx);
    }

    innermost() {
        return this;
    }
}

class CompositionContext extends EvalContext {
    constructor(ctx1, ctx2) {
        super();
        this.ctx1 = ctx1;
        this.ctx2 = ctx2;
    }

    apply(term) {
        return this.ctx1.apply(this.ctx2.apply(term));
    }

    innermost() {
        return this.ctx2.innermost();
    }

    shift(i, n) {
        return new CompositionContext(this.ctx1.shift(i, n), this.ctx2.shift(i, n));
    }
}

class EmptyContext extends EvalContext {
    constructor() {
        super();
    }

    apply(term) {
        return term;
    }

    shift(i, n) {
        return this;
    }
}

class LetContext extends EvalContext {
    constructor(body) {
        super();
        this.body = body;
    }

    apply(term) {
        return new IxLet(term, this.body);
    }

    shift(i, n) {
        return new LetContext(this.body.shift(i + 1, n));
    }
}

class FuncContext extends EvalContext {
    constructor(arg) {
        super();
        this.arg = arg;
    }

    apply(term) {
        return new IxApp(term, this.arg);
    }

    shift(i, n) {
        return new FuncContext(this.arg.shift(i, n));
    }
}

class ArgContext extends EvalContext {
    constructor(func) {
        super();
        this.func = func;
    }

    apply(term) {
        return new IxApp(this.func, term);
    }

    shift(i, n) {
        return new ArgContext(this.func.shift(i, n));
    }
}

function aNormalize(term, context) {
    // console.log(term.toString());
    if (term instanceof IxAbs) {
        return context.apply(new IxAbs(aNormalize(term.body, new EmptyContext())));
    }
    else if (term instanceof IxApp) {
        if (term.func instanceof IxVal && term.arg instanceof IxVal
            && !(context instanceof EmptyContext) && !(context.innermost() instanceof LetContext)) {
            return aNormalize(new IxLet(term, context.shift(0, 1).apply(new IxVar(0))), new EmptyContext());
        }
        else if (!(term.func instanceof IxVal)) {
            return aNormalize(context.apply(aNormalize(term.func, new FuncContext(term.arg))), new EmptyContext());
        }
        else if (!(term.arg instanceof IxVal)) {
            return aNormalize(context.apply(aNormalize(term.arg, new ArgContext(term.func))), new EmptyContext());
        }
        else {
            return context.apply(term);
        }
    }
    else if (term instanceof IxLet) {
        if (!(context instanceof EmptyContext)) {
            return aNormalize(new IxLet(term.expr, context.shift(0, 1).apply(term.body)), new EmptyContext());
        }
        else {
            return context.apply(aNormalize(term.expr, new LetContext(aNormalize(term.body, new EmptyContext()))));
        }
    }
    else {
        return context.apply(term);
    }
}

let aNormI = aNormalize(ixI, new EmptyContext());
let aNormK = aNormalize(ixK, new EmptyContext());
let aNormS = aNormalize(ixS, new EmptyContext());
let aNormY = aNormalize(ixY, new EmptyContext());
console.log(`I = ${aNormI.toString()}`);
console.log(`K = ${aNormK.toString()}`);
console.log(`S = ${aNormS.toString()}`);
console.log(`Y = ${aNormY.toString()}`);

let aNormSKIq = aNormalize(IxSKIq, new EmptyContext());
aNormSKIq.eval(true);
