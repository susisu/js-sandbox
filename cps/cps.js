class Var {
    constructor(name) {
        this.name = name;
    }

    toString() {
        return this.name;
    }
}

class Abs {
    constructor(arg, body) {
        this.arg  = arg;
        this.body = body;
    }

    toString() {
        return `\u001b[1;32mλ\u001b[22;39m${this.arg}. ${this.body.toString()}`;
    }
}

class App {
    constructor(func, arg) {
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

class IxVar {
    constructor(index) {
        this.index = index;
    }

    toString() {
        return this.index;
    }

    lift(i, n) {
        return new IxVar(this.index >= i ? this.index + n : this.index);
    }
}

class IxAbs {
    constructor(body) {
        this.body = body;
    }

    toString() {
        return `\u001b[1;33mλ\u001b[22;39m. ${this.body.toString()}`;
    }

    lift(i, n) {
        return new IxAbs(this.body.lift(i + 1, n));
    }
}

class IxApp {
    constructor(func, arg) {
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

    lift(i, n) {
        return new IxApp(this.func.lift(i, n), this.arg.lift(i, n));
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

let IxI = deBruijnIndex(I, []);
let IxK = deBruijnIndex(K, []);
let IxS = deBruijnIndex(S, []);
let IxY = deBruijnIndex(Y, []);

console.log(`I = ${IxI.toString()}`);
console.log(`K = ${IxK.toString()}`);
console.log(`S = ${IxS.toString()}`);
console.log(`Y = ${IxY.toString()}`);

function cpsTransform(term) {
    if (term instanceof IxVar) {
        return new IxAbs(
                new IxApp(
                    new IxVar(0),
                    term.lift(0, 1)
                )
            );
    }
    else if (term instanceof IxAbs) {
        return new IxAbs(
                new IxApp(
                    new IxVar(0),
                    new IxAbs(
                        cpsTransform(term.body.lift(1, 1))
                    )
                )
            );
    }
    else if (term instanceof IxApp) {
        return new IxAbs(
                new IxApp(
                    cpsTransform(term.func.lift(0, 1)),
                    new IxAbs(
                        new IxApp(
                            cpsTransform(term.arg.lift(0, 2)),
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

let CPSI = cpsTransform(IxI);
let CPSK = cpsTransform(IxK);
let CPSS = cpsTransform(IxS);
let CPSY = cpsTransform(IxY);
console.log(`I = ${CPSI.toString()}`);
console.log(`K = ${CPSK.toString()}`);
console.log(`S = ${CPSS.toString()}`);
console.log(`Y = ${CPSY.toString()}`);

