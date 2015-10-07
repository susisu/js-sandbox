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

function Lambda(argName, body) {
    if (!(this instanceof Lambda)) {
        return new Lambda(argName, body);
    }
    this.argName = argName;
    this.body    = body;
}
Lambda.prototype.eval = function (env) {
    var argName = this.argName;
    var body    = this.body;
    return Val(function (x) {
        var local = Object.create(env);
        local[argName] = x;
        return body.eval(local);
    });
};

function Ret(expr) {
    if (!(this instanceof Ret)) {
        return new Ret(expr);
    }
    this.expr = expr;
}
Ret.prototype.eval = function (env) {
    var _expr = this.expr.eval(env);
    if (_expr instanceof Val) {
        return Next(_expr);
    }
    else if (_expr instanceof Cont) {
        var cont = Val(function (x) {
            return Ret(Lit(_expr.cont(x))).eval(env);
        });
        return cont.raw(_expr.func.raw(cont));
    }
    else if (_expr instanceof Next) {
        return _expr;
    }
};

function App(func, arg) {
    if (!(this instanceof App)) {
        return new App(func, arg);
    }
    this.func = func;
    this.arg  = arg;
}
App.prototype.eval = function (env) {
    var _func = this.func.eval(env);
    if (_func instanceof Val) {
        var _arg = this.arg.eval(env);
        if (_arg instanceof Val) {
            return _func.raw(_arg);
        }
        else if (_arg instanceof Cont) {
            return Cont(_arg.func, function (x) {
                return App(Lit(_func), Lit(_arg.cont(x))).eval(env);
            });
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
};

function Let(binds, body) {
    if (!(this instanceof Let)) {
        return new Let(binds, body);
    }
    this.binds = binds.slice();
    this.body  = body;
}
Let.prototype.eval = function (env) {
    var local = Object.create(env);
    var binds = this.binds;
    var body  = this.body;
    for (var i = 0; i < binds.length; i++) {
        var name = binds[i][0];
        var expr = binds[i][1];
        var _expr = expr.eval(local);
        if (_expr instanceof Val) {
            local[name] = _expr;
        }
        else if (_expr instanceof Cont) {
            return Cont(_expr.func, function (x) {
                return Let([[name, Lit(_expr.cont(x))]].concat(binds.slice(i + 1)), body).eval(local);
            });
        }
        else if (_expr instanceof Next) {
            return _expr;
        }
    }
    var _body = body.eval(local);
    if (_body instanceof Val) {
        return _body;
    }
    else if (_body instanceof Cont) {
        return Cont(_body.func, function (x) {
            return Let([], _body.cont(x)).eval(local);
        });
    }
    else if (_body instanceof Next) {
        return _body;
    }
};

function Proc(exprs) {
    if (!(this instanceof Proc)) {
        return new Proc(exprs);
    }
    this.exprs = exprs.slice();
}
Proc.prototype.eval = function (env) {
    var exprs = this.exprs;
    for (var i = 0; i < exprs.length - 1; i++) {
        var _expr = exprs[i].eval(env);
        if (_expr instanceof Val) {
            // nothing
        }
        else if (_expr instanceof Cont) {
            return Cont(_expr.func, function (x) {
                return Proc(exprs.slice(i + 1)).eval(env);
            });
        }
        else if (_expr instanceof Next) {
            return _expr;
        }
    }
    var _last = exprs[exprs.length - 1].eval(env);
    if (_last instanceof Val) {
        return _last;
    }
    else if (_last instanceof Cont) {
        return Cont(_last.func, function (x) {
            return Proc([Lit(_last.cont(x))]).eval(env);
        });
    }
    else if (_last instanceof Next) {
        return _last;
    }
}

var env = Object.create(null);
env["call/cc"] = Val(function (func) {
    return Cont(func, function (x) { return x; });
});
env["print"] = Val(function (x) {
    process.stdout.write(String(x.raw));
    return Val("undefined");
});
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
            App(Var("call/cc"), Lit(Val(function (cont) {
                env["f"] = cont;
                return Val(2);
            })))
        )
    ).eval(env)
);

env["x"] = Val(100);

debug(
    Ret(
        App(Var("f"), Lit(Val(3)))
    ).eval(env)
);

debug(
    Ret(
        App(Var("call/cc"), Lambda("ret1",
            App(Var("call/cc"), Lambda("ret2",
                App(Var("ret1"), Lit(Val(5)))
            ))
        ))
    ).eval(env)
);

debug(
    Ret(
        App(Var("call/cc"),
            App(Var("call/cc"), Lambda("ret1",
                App(Var("ret1"), Lambda("ret2",
                    App(Var("ret2"), Lit(Val(6)))
                ))
            ))
        )
    ).eval(env)
);

debug(
    Ret(
        Let([
                ["yin",
                    App(
                        Lambda("foo", Proc([
                            App(Var("print"), Lit(Val("\n"))),
                            Var("foo")
                        ])),
                        App(Var("call/cc"), Lambda("bar", Var("bar")))
                    )
                ],
                ["yang",
                    App(
                        Lambda("foo", Proc([
                            App(Var("print"), Lit(Val("*"))),
                            Var("foo")
                        ])),
                        App(Var("call/cc"), Lambda("bar", Var("bar")))
                    )
                ]
            ],
            App(Var("yin"), Var("yang"))
        )
    ).eval(env)
);
