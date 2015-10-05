function debug(x) {
    console.log(require("util").inspect(x, { "depth": null, "colors": true }));
}

function Val(raw) {
    if (!(this instanceof Val)) {
        return new Val(raw);
    }
    this.raw = raw;
}

function Cont(func, cont) {
    if (!(this instanceof Cont)) {
        return new Cont(func, cont);
    }
    this.func = func;
    this.cont = cont;
}

function Next(value) {
    if (!(this instanceof Next)) {
        return new Next(value);
    }
    this.value = value;
}

// evaluables

function Lit(value) {
    if (!(this instanceof Lit)) {
        return new Lit(value);
    }
    this.value = value;
}
Lit.prototype.eval = function (env) {
    return this.value;
};

function Var(name) {
    if (!(this instanceof Var)) {
        return new Var(name);
    }
    this.name = name;
}
Var.prototype.eval = function (env) {
    return env[this.name];
}

function Ret(expr) {
    if (!(this instanceof Ret)) {
        return new Ret(expr);
    }
    this.expr = expr;
}
Ret.prototype.eval = function (env) {
    var _value = this.expr.eval(env);
    if (_value instanceof Val) {
        return Next(_value);
    }
    else if (_value instanceof Cont) {
        var cont = function (x) { return Next(_value.cont(x)); };
        return cont(_value.func.raw(cont));
    }
    else if (_value instanceof Next) {
        return _value;
    }
}

function CallCC(func) {
    if (!(this instanceof CallCC)) {
        return new CallCC(func);
    }
    this.func = func;
}
CallCC.prototype.eval = function (env) {
    var _func = this.func.eval(env);
    if (_func instanceof Val) {
        return Cont(_func, function (x) { return x; });
    }
    else if (_func instanceof Cont) {
        return Cont(_func.func, function (x) { return CallCC(Lit(_func.cont(x))).eval(env); })
    }
    else if (_func instanceof Next) {
        return _func;
    }
};

function App(func, arg) {
    if (!(this instanceof App)) {
        return new App(func, arg);
    }
    this.func = func;
    this.arg  = arg;
}
App.prototype.eval = function (env, toplevel) {
    var _func = this.func.eval(env);
    if (_func instanceof Val) {
        var _arg = this.arg.eval(env);
        if (_arg instanceof Val) {
            return _func.raw(_arg);
        }
        else if (_arg instanceof Cont) {
            return Cont(_arg.func, function (x) { return App(Lit(_func), Lit(_arg.cont(x))).eval(env); });
        }
        else if (_arg instanceof Next) {
            return _arg;
        }
    }
    else if (_func instanceof Cont) {
        var arg = this.arg;
        return Cont(_func.func, function (x) {
            return App(Lit(_func.cont(x)), arg).eval(env);
        });
    }
    else if (_func instanceof Next) {
        return _func;
    }
}

var env = Object.create(null);
env["x"] = Val(1);
env["y"] = Val(2);
env["+"] = Val(function (x) {
    return Val(function (y) {
        return Val(x.raw + y.raw);
    });
});

debug(
    Ret(
        App(
            App(Var("+"), Var("x")),
            CallCC(Lit(Val(function (cont) {
                env["f"] = Val(cont);
                return Val(2);
            })))
        )
    ).eval(env)
);

debug(
    Ret(
        App(Var("f"), Lit(Val(3)))
    ).eval(env)
);
