"use strict";

class Term {
    eval() {
        var res = this;
        var output = res.toString() + "\n";
        try {
            while (res.isReducible()) {
                res = res.eval1();
                output += "-> " + res.toString() + "\n";
            }
        }
        catch (error) {
            console.error(String(error));
        }
        console.log(output);
        return res;
    }
}

class Var extends Term {
    constructor(index) {
        super();
        this.index = index;
    }

    toString() {
        return this.index.toString();
    }

    isReducible() {
        return false;
    }

    shift(d, c) {
        if (this.index >= c) {
            return new Var(this.index + d);
        }
        else {
            return this;
        }
    }

    subst(x, s) {
        if (this.index === x) {
            return s;
        }
        else {
            return this;
        }
    }

    eval1() {
        throw new Error("no evaluation rule applied");
    }
}

class Abs extends Term {
    constructor(body) {
        super();
        this.body = body;
    }

    toString() {
        return "λ." + this.body.toString();
    }

    isReducible() {
        return false;
    }

    shift(d, c) {
        return new Abs(this.body.shift(d, c + 1));
    }

    subst(x, s) {
        return new Abs(this.body.subst(x + 1, s.shift(1, 0)));
    }

    eval1() {
        throw new Error("no evaluation rule applied");
    }
}

class App extends Term {
    constructor(func, arg) {
        super();
        this.func = func;
        this.arg  = arg;
    }

    toString() {
        var funcStr = this.func instanceof Abs
            ? "(" + this.func.toString() + ")"
            : this.func.toString();
        var argStr = this.arg instanceof Abs || this.arg instanceof App
            ? "(" + this.arg.toString() + ")"
            : this.arg.toString();
        return funcStr + " " + argStr;
    }

    isReducible() {
        return this.func.isReducible() || this.arg.isReducible() || this.func instanceof Abs;
    }

    shift(d, c) {
        return new App(this.func.shift(d, c), this.arg.shift(d, c));
    }

    subst(x, s) {
        return new App(this.func.subst(x, s), this.arg.subst(x, s));
    }

    eval1() {
        if (this.func.isReducible()) {
            return new App(this.func.eval1(), this.arg);
        }
        else if (this.arg.isReducible()) {
            return new App(this.func, this.arg.eval1());
        }
        else if (this.func instanceof Abs) {
            return this.func.body.subst(0, this.arg.shift(1, 0)).shift(-1, 0);
        }
        else {
            throw new Error("no evaluation rule applied");
        }
    }
}

var v = index => new Var(index);
var abs = body => new Abs(body);
var app = (func, arg) => new App(func, arg);

var s = abs(abs(abs(app(app(v(2), v(0)), app(v(1), v(0))))));
var k = abs(abs(v(1)));
var i = abs(v(0));

app(i, v(6)).eval();

app(app(k, v(6)), v(28)).eval();

app(
    app(app(s, k), k),
    v(6)
).eval();
