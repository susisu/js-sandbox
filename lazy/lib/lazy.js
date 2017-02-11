"use strict";

function Lazy(func) {
    if (!(this instanceof Lazy)) {
        return new Lazy(func);
    }
    this.func = func;
    this.promise;
}

Object.defineProperties(Lazy, {
    "val": {
        "writable"    : true,
        "configurable": true,
        "value": function (x) {
            return Lazy(() => Promise.resolve(x));
        }
    }
});

Lazy.prototype = Object.create(Object.prototype, {
    "constructor": {
        "writable"    : true,
        "configurable": true,
        "value": Lazy
    },
    "eval": {
        "writable"    : true,
        "configurable": true,
        "value": function () {
            if (!this.promise) {
                this.promise = this.func.call(this)
                    .then(_x => _x instanceof Lazy ? _x.eval() : _x);
            }
            return this.promise;
        }
    }
});

function TC(_func, _arg) {
    if (!(this instanceof TC)) {
        return new TC(_func, _arg);
    }
    this._func = _func;
    this._arg  = _arg;
}

function Expr() {
    if (!(this instanceof Expr)) {
        return new Expr();
    }
}

Expr.prototype = Object.create(Object.prototype, {
    "constructor": {
        "writable"    : true,
        "configurable": true,
        "value": Expr
    },
    "generate": {
        "writable"    : true,
        "configurable": true,
        "value": function (env) {
            return Lazy(() => Promise.reject(undefined));
        }
    }
});

function Lit(val) {
    if (!(this instanceof Lit)) {
        return new Lit(val);
    }
    this.val = val;
}

Lit.prototype = Object.create(Expr.prototype, {
    "constructor": {
        "writable"    : true,
        "configurable": true,
        "value": Lit
    },
    "generate": {
        "writable"    : true,
        "configurable": true,
        "value": function (env) {
            return Lazy(() => Promise.resolve(this.val));
        }
    }
});

function Var(name) {
    if (!(this instanceof Var)) {
        return new Var(name);
    }
    this.name = name;
}

Var.prototype = Object.create(Expr.prototype, {
    "constructor": {
        "writable"    : true,
        "configurable": true,
        "value": Var
    },
    "generate": {
        "writable"    : true,
        "configurable": true,
        "value": function (env) {
            return Lazy(() => Promise.resolve(env[this.name]));
        }
    }
});

function Lambda(argName, body) {
    if (!(this instanceof Lambda)) {
        return new Lambda(argName, body);
    }
    this.argName = argName;
    this.body    = body;
}
Lambda.prototype = Object.create(Expr.prototype, {
    "constructor": {
        "writable"    : true,
        "configurable": true,
        "value": Lambda
    },
    "generate": {
        "writable"    : true,
        "configurable": true,
        "value": function (env) {
            return Lazy(() => Promise.resolve(_arg => {
                var local = Object.create(env);
                local[this.argName] = _arg;
                return this.body.generate(local);
            }));
        }
    }
});

function App(func, arg) {
    if (!(this instanceof App)) {
        return new App(func, arg);
    }
    this.func = func;
    this.arg  = arg;
}

App.prototype = Object.create(Expr.prototype, {
    "constructor": {
        "writable"    : true,
        "configurable": true,
        "value": App
    },
    "generate": {
        "writable"    : true,
        "configurable": true,
        "value": function (env) {
            var _func = this.func.generate(env);
            var _arg  = this.arg.generate(env);
            return Lazy(() => _func.eval().then(__func => __func(_arg)));
        }
    }
});

var env = Object.create(null);
env["x"] = Lazy.val(2);
env["y"] = Lazy(() => { console.log("y is evaluated!"); return Promise.resolve(3); });
env["I"] = Lambda("x", Var("x")).generate(env);
env["K"] = Lambda("x", Lambda("y", Var("x"))).generate(env);
env["S"] = Lambda("x", Lambda("y", Lambda("z",
    App(
        App(Var("x"), Var("z")),
        App(Var("y"), Var("z"))
    )
))).generate(env);

function print(expr) {
    expr.generate(env).eval().then(x => console.log(x), e => console.error("Error: " + String(e)));
}

print(
    App(
        App(Var("K"), Var("x")),
        Var("y")
    )
);

print(
    App(
        App(
            App(
                Var("S"),
                Var("K")
            ),
            Var("K")
        ),
        Lit(3)
    )
);
