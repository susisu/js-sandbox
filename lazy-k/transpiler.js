/*
 * Reference:
 * - https://tromp.github.io/cl/lazy-k.html
 * - https://en.wikipedia.org/wiki/Combinatory_logic
 */

"use strict";

class Term {
    constructor() {
    }

    toString() {
        return "?";
    }

    toComb() {
        return "?";
    }

    hasFreeVar() {
        return false;
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

    toComb() {
        return this.name;
    }

    hasFreeVar(name) {
        return this.name === name;
    }
}

class Abs extends Term {
    constructor(param, body) {
        super();
        this.param = param;
        this.body  = body;
    }

    toString() {
        return "fun " + this.param + " -> " + this.body.toString();
    }

    toComb() {
        return "?";
    }

    hasFreeVar(name) {
        return this.param === name
            ? false
            : this.body.hasFreeVar(name);
    }
}

class App extends Term {
    constructor(func, arg) {
        super();
        this.func = func;
        this.arg  = arg;
    }

    toString() {
        return "(" + this.func.toString() + ") (" + this.arg.toString() + ")";
    }

    toComb() {
        return "`" + this.func.toComb() + this.arg.toComb();
    }

    hasFreeVar(name) {
        return this.func.hasFreeVar(name) || this.arg.hasFreeVar(name);
    }
}

function transpile(term) {
    if (term instanceof Var) {
        return new Var(term.name);
    }
    if (term instanceof Abs) {
        if (!term.body.hasFreeVar(term.param)) {
            return new App(new Var("k"), transpile(term.body));
        }
        if (term.body instanceof Var) {
            return new Var("i");
        }
        if (term.body instanceof Abs) {
            return transpile(new Abs(
                term.param,
                transpile(new Abs(term.body.param, term.body.body))
            ));
        }
        if (term.body instanceof App) {
            return new App(
                new App(
                    new Var("s"),
                    transpile(new Abs(term.param, term.body.func))
                ),
                transpile(new Abs(term.param, term.body.arg))
            );
        }
    }
    if (term instanceof App) {
        return new App(transpile(term.func), transpile(term.arg));
    }
    throw new Error("unknown term");
}

const parse = (() => {
    const lq = require("loquat")();
    lq.use(require("loquat-token"));

    const def = new lq.LanguageDef({
        commentStart  : "(*",
        commentEnd    : "*)",
        nestedComments: true,
        idStart       : lq.letter,
        idLetter      : lq.alphaNum.or(lq.oneOf("_'")),
        opStart       : lq.oneOf("=->"),
        opLetter      : lq.oneOf("=->"),
        reservedIds   : ["fun", "let", "in"],
        reservedOps   : ["=", "->"],
        caseSensitive : true
    });
    const tp = lq.makeTokenParser(def);

    const term = lq.lazy(() => lq.choice([
        abstraction,
        application,
        binding,
        tp.parens(term)
    ]));

    const aterm = lq.lazy(() => lq.choice([
        charLiteral,
        variable,
        tp.parens(term)
    ]));

    const zero = new Abs("f", new Abs("x", new Var("x")));
    const succ = new Abs("n", new Abs("f", new Abs("x",
        new App(
            new Var("f"),
            new App(
                new App(new Var("n"), new Var("f")),
                new Var("x")
            )
        )
    )));

    const charLiteral = lq.do(function* () {
        const chr = yield tp.charLiteral;
        const c   = chr.codePointAt(0);
        let expr = zero;
        for (let i = 0; i < c; i++) {
            expr = new App(succ, expr);
        }
        return expr;
    });

    const variable = lq.do(function* () {
        const name = yield tp.identifier;
        return new Var(name);
    });

    const abstraction = lq.do(function* () {
        yield tp.reserved("fun");
        const params = yield tp.identifier.many1();
        yield tp.reservedOp("->");
        const body = yield term;
        return params.reduceRight((b, p) => new Abs(p, b), body);
    });

    const application = lq.do(function* () {
        const func = yield aterm;
        const args = yield aterm.many();
        return args.reduce((f, a) => new App(f, a), func);
    });

    const binding = lq.do(function* () {
        yield tp.reserved("let");
        const name   = yield tp.identifier;
        const params = yield tp.identifier.many();
        yield tp.reservedOp("=");
        const expr = yield term;
        yield tp.reserved("in");
        const body = yield term;
        return new App(new Abs(name, body), params.reduceRight((b, p) => new Abs(p, b), expr));
    });

    const prog = lq.do(function* () {
        yield tp.whiteSpace;
        const expr = yield term;
        yield lq.eof;
        return expr;
    });

    return src => {
        const res = lq.parse(prog, "", src, undefined, { unicode: false });
        if (res.success) {
            return res.value;
        }
        else {
            throw res.error;
        }
    };
})();

const term = parse(`
let const x y  = x in
let cons x y c = c x y in
let fix f      = (fun x -> f (x x)) (fun x -> f (x x)) in
let eof        = (fun n -> n n) ((fun n -> n n) (fun f x -> f (f x))) in
let rest       = fix (cons eof) in
const (cons 'A' (cons 'B' (cons '\\n' rest)))
`);
const cterm = transpile(term);
console.log(cterm.toComb());
