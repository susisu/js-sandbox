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
        if (this.index >= i) {
            return new IxVar(this.index + n);
        }
        else {
            return this;
        }
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

    swap(n, m) {
        if (this.index === n) {
            return new IxVar(m);
        }
        else if (this.index === m) {
            return new IxVar(n);
        }
        else {
            return this;
        }
    }

    equals(term) {
        return term instanceof IxVar && this.index === term.index;
    }

    isClosed(n) {
        return this.index <= n;
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

    swap(n, m) {
        return new IxAbs(this.body.swap(n + 1, m + 1));
    }

    equals(term) {
        return term instanceof IxAbs && this.body.equals(term.body);
    }

    isClosed(n) {
        return this.body.isClosed(n + 1);
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

    swap(n, m) {
        return new IxApp(this.func.swap(n, m), this.arg.swap(n, m));
    }

    equals(term) {
        return term instanceof IxApp && this.func.equals(term.func) && this.arg.equals(term.arg);
    }

    isClosed(n) {
        return this.func.isClosed(n) && this.arg.isClosed(n);
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

let ixSKIq = deBruijnIndex(SKIq, ["q"]);
ixSKIq.eval(true);

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

let cpsSKIq = cpsTransform(ixSKIq);
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
        if (this.index >= i) {
            return new IxContVar(this.index + n);
        }
        else {
            return this;
        }
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

    swap(n, m) {
        if (this.index === n) {
            return new IxContVar(m);
        }
        else if (this.index === m) {
            return new IxContVar(n);
        }
        else {
            return this;
        }
    }

    equals(term) {
        return term instanceof IxContVar && this.index === term.index;
    }

    isClosed(n) {
        return this.index <= n;
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

    swap(n, m) {
        return new IxContAbs(this.body.swap(n + 1, m + 1));
    }

    equals(term) {
        return term instanceof IxContAbs && this.body.equals(term.body);
    }

    isClosed(n) {
        return this.body.isClosed(n + 1);
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

    swap(n, m) {
        return new IxCPSTerm(this.body.swap(n + 1, m + 1));
    }

    equals(term) {
        return term instanceof IxCPSTerm && this.body.equals(term.body);
    }

    isClosed(n) {
        return this.body.isClosed(n + 1);
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

let cpsModSKIq = cpsTransformMod(ixSKIq);
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

let cps2SKIq = cpsTransform2(ixSKIq);
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

    swap(n, m) {
        return new IxLet(this.expr.swap(n, m), this.body.swap(n + 1, m + 1));
    }

    equals(term) {
        return term instanceof IxLet && this.expr.equals(term.expr) && this.body.equals(term.body);
    }

    isClosed(n) {
        return this.expr.isClosed(n) && this.body.isClosed(n + 1);
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

class LetExprContext extends EvalContext {
    constructor(body) {
        super();
        this.body = body;
    }

    apply(term) {
        return new IxLet(term, this.body);
    }

    shift(i, n) {
        return new LetExprContext(this.body.shift(i + 1, n));
    }
}

class AppFuncContext extends EvalContext {
    constructor(arg) {
        super();
        this.arg = arg;
    }

    apply(term) {
        return new IxApp(term, this.arg);
    }

    shift(i, n) {
        return new AppFuncContext(this.arg.shift(i, n));
    }
}

class AppArgContext extends EvalContext {
    constructor(func) {
        super();
        this.func = func;
    }

    apply(term) {
        return new IxApp(this.func, term);
    }

    shift(i, n) {
        return new AppArgContext(this.func.shift(i, n));
    }
}

function aNormalize(term, context) {
    if (term instanceof IxAbs) {
        return context.apply(new IxAbs(aNormalize(term.body, new EmptyContext())));
    }
    else if (term instanceof IxApp) {
        let func = term.func;
        let arg  = term.arg;
        if (func instanceof IxAbs) {
            func = aNormalize(func, new EmptyContext());
        }
        if (arg instanceof IxAbs) {
            arg = aNormalize(arg, new EmptyContext());
        }
        if (func instanceof IxVal && arg instanceof IxVal
            && !(context instanceof EmptyContext) && !(context.innermost() instanceof LetExprContext)) {
            return aNormalize(new IxLet(new IxApp(func, arg), context.shift(0, 1).apply(new IxVar(0))), new EmptyContext());
        }
        else if (!(func instanceof IxVal)) {
            return aNormalize(context.apply(aNormalize(func, new AppFuncContext(arg))), new EmptyContext());
        }
        else if (!(arg instanceof IxVal)) {
            return aNormalize(context.apply(aNormalize(arg, new AppArgContext(func))), new EmptyContext());
        }
        else {
            return context.apply(new IxApp(func, arg));
        }
    }
    else if (term instanceof IxLet) {
        if (!(context instanceof EmptyContext)) {
            return aNormalize(new IxLet(term.expr, context.shift(0, 1).apply(term.body)), new EmptyContext());
        }
        else {
            return context.apply(aNormalize(term.expr, new LetExprContext(aNormalize(term.body, new EmptyContext()))));
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

let aNormSKIq = aNormalize(ixSKIq, new EmptyContext());
aNormSKIq.eval(true);

// Modified version of A-normalization
// does not allow lambda-abstractions in applications.
function aNormalizeMod(term, context) {
    if (term instanceof IxAbs) {
        return context.apply(new IxAbs(aNormalizeMod(term.body, new EmptyContext())));
    }
    else if (term instanceof IxApp) {
        let func = term.func;
        let arg  = term.arg;
        if (func instanceof IxAbs) {
            func = aNormalizeMod(func, new EmptyContext());
        }
        if (arg instanceof IxAbs) {
            arg = aNormalizeMod(arg, new EmptyContext());
        }
        if (func instanceof IxVar && arg instanceof IxVar
            && !(context instanceof EmptyContext) && !(context.innermost() instanceof LetExprContext)) {
            return new IxLet(new IxApp(func, arg), aNormalizeMod(context.shift(0, 1).apply(new IxVar(0)), new EmptyContext()));
        }
        else if (func instanceof IxAbs) {
            return context.apply(new IxLet(func, aNormalizeMod(new IxApp(new IxVar(0), arg.shift(0, 1)), new EmptyContext())));
        }
        else if (arg instanceof IxAbs) {
            return context.apply(new IxLet(arg, aNormalizeMod(new IxApp(func.shift(0, 1), new IxVar(0)), new EmptyContext())));
        }
        else if (!(func instanceof IxVar)) {
            return aNormalizeMod(context.apply(aNormalizeMod(func, new AppFuncContext(arg))), new EmptyContext());
        }
        else if (!(arg instanceof IxVar)) {
            return aNormalizeMod(context.apply(aNormalizeMod(arg, new AppArgContext(func))), new EmptyContext());
        }
        else {
            return context.apply(new IxApp(func, arg));
        }
    }
    else if (term instanceof IxLet) {
        if (!(context instanceof EmptyContext)) {
            return aNormalizeMod(new IxLet(term.expr, context.shift(0, 1).apply(term.body)), new EmptyContext());
        }
        else {
            return context.apply(aNormalizeMod(term.expr, new LetExprContext(aNormalizeMod(term.body, new EmptyContext()))));
        }
    }
    else {
        return context.apply(term);
    }
}

let aNormModI = aNormalizeMod(ixI, new EmptyContext());
let aNormModK = aNormalizeMod(ixK, new EmptyContext());
let aNormModS = aNormalizeMod(ixS, new EmptyContext());
let aNormModY = aNormalizeMod(ixY, new EmptyContext());
console.log(`I = ${aNormModI.toString()}`);
console.log(`K = ${aNormModK.toString()}`);
console.log(`S = ${aNormModS.toString()}`);
console.log(`Y = ${aNormModY.toString()}`);

let aNormModSKIq = aNormalizeMod(ixSKIq, new EmptyContext());
aNormModSKIq.eval(true);

function liftLambda(term, toplevel) {
    if (term instanceof IxVar) {
        return term;
    }
    else if (term instanceof IxAbs) {
        let body = liftLambda(term.body, false);
        if (body instanceof IxLet && body.expr instanceof IxAbs) {
            if (body.expr.contains(0)) {
                return new IxLet(new IxAbs(body.expr), liftLambda(new IxAbs(new IxLet(new IxApp(new IxVar(1), new IxVar(0)), body.body.shift(2, 1))), false));
            }
            else {
                return new IxLet(body.expr.shift(0, -1), liftLambda(new IxAbs(body.body.swap(0, 1)), false));
            }
        }
        else {
            return new IxAbs(body);
        }
    }
    else if (term instanceof IxApp) {
        // Assuming an application has no lambda-abstractions (modified-A-normalized or A- and Grass-normalized).
        return term;
    }
    else if (term instanceof IxLet) {
        let expr = liftLambda(term.expr, toplevel);
        if (expr instanceof IxLet) {
            return liftLambda(new IxLet(expr.expr, new IxLet(expr.body, term.body.shift(1, 1))), toplevel);
        }
        else {
            let body = liftLambda(term.body, toplevel);
            if (toplevel) {
                return new IxLet(expr, body);
            }
            else {
                if (body instanceof IxLet && !(expr instanceof IxAbs) && body.expr instanceof IxAbs) {
                    if (body.expr.contains(0)) {
                        return new IxLet(new IxAbs(body.expr), liftLambda(new IxLet(expr.shift(0, 1), new IxLet(new IxApp(new IxVar(1), new IxVar(0)), body.body.shift(2, 1))), false));
                    }
                    else {
                        return new IxLet(body.expr.shift(0, -1), liftLambda(new IxLet(expr.shift(0, 1), body.body.swap(0, 1)), false));
                    }
                }
                else if (body instanceof IxAbs) {
                    return liftLambda(new IxLet(expr, new IxLet(body, new IxLet(new IxAbs(new IxVar(0)), new IxApp(new IxVar(0), new IxVar(1))))), false);
                }
                else {
                    return new IxLet(expr, body);
                }
            }
        }
    }
    else {
        throw new Error("unexpected term");
    }
}

let liftedI = liftLambda(aNormModI, true);
let liftedK = liftLambda(aNormModK, true);
let liftedS = liftLambda(aNormModS, true);
let liftedY = liftLambda(aNormModY, true);
console.log(`I = ${liftedI.toString()}`);
console.log(`K = ${liftedK.toString()}`);
console.log(`S = ${liftedS.toString()}`);
console.log(`Y = ${liftedY.toString()}`);

let liftedSKIq = liftLambda(aNormModSKIq, true);
liftedSKIq.eval(true);

// Normalization for Grass
function grassNormalize(term) {
    if (term instanceof IxVar) {
        if (term.index === 0) {
            return term;
        }
        else {
            return new IxLet(new IxAbs(new IxVar(0)), new IxApp(new IxVar(0), term.shift(0, 1)));
        }
    }
    else if (term instanceof IxAbs) {
        return new IxAbs(grassNormalize(term.body));
    }
    else if (term instanceof IxApp) {
        if (term.func instanceof IxAbs) {
            return new IxLet(grassNormalize(term.func), grassNormalize(new IxApp(new IxVar(0), term.arg.shift(0, 1))));
        }
        else if (term.arg instanceof IxAbs) {
            return new IxLet(grassNormalize(term.arg), grassNormalize(new IxApp(term.func.shift(0, 1), new IxVar(0))));
        }
        else {
            return term;
        }
    }
    else if (term instanceof IxLet) {
        if (term.expr instanceof IxVar) {
            return grassNormalize(term.body.subst(0, term.expr.shift(0, 1)).shift(0, -1));
        }
        else {
            let expr = grassNormalize(term.expr);
            if (expr instanceof IxVar) {
                return grassNormalize(term.body.subst(0, expr.shift(0, 1)).shift(0, -1));
            }
            else {
                let body = grassNormalize(term.body);
                if (body instanceof IxVar && body.index === 0) {
                    return expr;
                }
                else {
                    return new IxLet(expr, body);
                }
            }
        }
    }
    else {
        throw new Error("unexpected term");
    }
}

let liftedModI = liftLambda(grassNormalize(aNormI), true);
let liftedModK = liftLambda(grassNormalize(aNormK), true);
let liftedModS = liftLambda(grassNormalize(aNormS), true);
let liftedModY = liftLambda(grassNormalize(aNormY), true);
console.log(`I = ${liftedModI.toString()}`);
console.log(`K = ${liftedModK.toString()}`);
console.log(`S = ${liftedModS.toString()}`);
console.log(`Y = ${liftedModY.toString()}`);

let liftedModSKIq = liftLambda(grassNormalize(aNormSKIq), true);
liftedModSKIq.eval(true);

class Nil {
    constructor() {
    }

    toString() {
        return "[]";
    }
}

class Cons {
    constructor(car, cdr) {
        this.car = car;
        this.cdr = cdr;
    }

    toString() {
        return `${this.car.toString()} :: ${this.cdr.toString()}`;
    }
}

class List {
    constructor(nilCons) {
        this.list = nilCons;
    }

    static empty() {
        return new List(new Nil());
    }

    static fromArray(arr) {
        let l   = new Nil();
        let len = arr.length;
        for (let i = len - i; i >= 0; i--) {
            l = new Cons(arr[i], l);
        }
        return new List(l);
    }

    toString() {
        return this.list.toString();
    }

    toArray() {
        let l   = this.list;
        let arr = [];
        let i   = 0;
        while (!(l instanceof Nil)) {
            arr[i] = l.car;
            l = l.cdr;
            i++;
        }
        return arr;
    }

    isEmpty() {
        return this.list instanceof Nil;
    }

    append(x) {
        return new List(new Cons(x, this.list));
    }

    head() {
        if (this.list instanceof Nil) {
            throw new Error("empty list");
        }
        else {
            return this.list.car;
        }
    }

    tail() {
        if (this.list instanceof Nil) {
            throw new Error("empty list");
        }
        else {
            return new List(this.list.cdr);
        }
    }

    findIndexBy(callback) {
        let l = this.list;
        let i = 0;
        while (!(l instanceof Nil)) {
            if (callback(l.car, i)) {
                return i;
            }
            l = l.cdr;
            i++;
        }
        return -1;
    }
}

function optimize(term, context) {
    if (term instanceof IxVar) {
        return term;
    }
    else if (term instanceof IxAbs) {
        // A normalized abstraction cannot be optimized
        return term;
    }
    else if (term instanceof IxApp) {
        return term;
    }
    else if (term instanceof IxLet) {
        // term.expr (abs or app) cannot be optimized
        let body = optimize(term.body, context.append(term.expr));
        if (term.expr instanceof IxVal && !body.contains(0)) {
            return body.shift(0, -1);
        }
        else if (term.expr instanceof IxVar) {
            return optimize(body.subst(0, term.expr.shift(0, 1)).shift(0, -1), context);
        }
        else if (term.expr instanceof IxAbs) {
            let n = context.findIndexBy((t, i) => term.expr.equals(t.shift(0, i + 1)));
            if (n >= 0) {
                return optimize(body.subst(0, new IxVar(n).shift(0, 1)).shift(0, -1), context);
            }
            else {
                return new IxLet(term.expr, body);
            }
        }
        else {
            return new IxLet(term.expr, body);
        }
    }
    else {
        throw new Error("unexpected term");
    }
}

let optI = optimize(liftedModI, List.empty());
let optK = optimize(liftedModK, List.empty());
let optS = optimize(liftedModS, List.empty());
let optY = optimize(liftedModY, List.empty());
console.log(`I = ${optI.toString()}`);
console.log(`K = ${optK.toString()}`);
console.log(`S = ${optS.toString()}`);
console.log(`Y = ${optY.toString()}`);

let optSKIq = optimize(liftedModSKIq, List.empty());
optSKIq.eval(true);

function termToList(term) {
    if (term instanceof IxAbs) {
        return List.empty().append(term);
    }
    else if (term instanceof IxApp) {
        return List.empty().append(term);
    }
    else if (term instanceof IxLet) {
        return termToList(term.body).append(term.expr);
    }
    else {
        throw new Error("unexpected term");
    }
}

function termFromList(list) {
    if (list.tail().isEmpty()) {
        return list.head();
    }
    else {
        return new IxLet(list.head(), termFromList(list.tail()));
    }
}

class Dependency {
    constructor(map) {
        this.map = map;
    }

    static shift(dep) {
        let newMap = new Map();
        for (let [i, v] of dep.map.entries()) {
            if (i > 0) {
                newMap.set(i - 1, v);
            }
        }
        return new Dependency(newMap);
    }

    static merge(dep1, dep2) {
        let newMap = new Map();
        for (let [i, v] of dep1.map.entries()) {
            newMap.set(i, v);
        }
        for (let [i, v] of dep2.map.entries()) {
            if (newMap.has(i)) {
                newMap.set(i, newMap.get(i) + v);
            }
            else {
                newMap.set(i, v);
            }
        }
        return new Dependency(newMap);
    }

    toString() {
        if (this.map.size === 0) {
            return "()";
        }
        else {
            let arr = [];
            for (let [i, v] of this.map.entries()) {
                arr.push(i.toString() + " => " + v.toString());
            }
            return "(" + arr.join(", ") + ")";
        }
    }

    has(i) {
        return this.map.has(i);
    }

    entries() {
        return this.map.entries();
    }

    add(i, n) {
        if (this.map.has(i)) {
            this.map.set(i, this.map.get(i) + n);
        }
        else {
            this.map.set(i, n);
        }
    }
}

function getTermDependency(term) {
    if (term instanceof IxVar) {
        let map = new Map();
        map.set(term.index, 1);
        return new Dependency(map);
    }
    else if (term instanceof IxAbs) {
        return Dependency.shift(getTermDependency(term.body));
    }
    else if (term instanceof IxApp) {
        return Dependency.merge(getTermDependency(term.func), getTermDependency(term.arg));
    }
    else if (term instanceof IxLet) {
        return Dependency.merge(getTermDependency(term.expr), Dependency.shift(getTermDependency(term.body)));
    }
    else {
        throw new Error("unexpected term");
    }
}

function getDependencies(terms) {
    let len        = terms.length;
    let deps       = [];
    let appIndices = [];
    for (let i = 0; i < len; i++) {
        let dep = getTermDependency(terms[i]);
        // applications (with side-effect) do not commute
        if (terms[i] instanceof IxApp) {
            for (let j of appIndices) {
                dep.add(j, 0);
            }
            appIndices.push(i);
        }
        deps.push(dep);
    }
    // last term cannot be moved
    if (len > 0) {
        let last = deps[len - 1];
        for (let i = 0; i <= len - 2; i++) {
            last.add(i, 0);
        }
    }
    return deps;
}

function calcCost(perm, deps) {
    let c = 0;
    for (let [i, dep] of deps.entries()) {
        for (let [j, w] of dep.entries()) {
            let k = i - j - 1;
            if (k >= 0) {
                c += (perm[i] - perm[k]) * w;
            }
            else {
                c += (perm[i] - k) * w;
            }
        }
    }
}
