function debug(x) {
    console.log(require("util").inspect(x, { "depth": null, "colors": true }));
}

function calcTC(_res) {
    while (_res instanceof TC) {
        _res = _res.func.raw(_res.arg);
    }
    return _res;
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

function TC(func, arg) {
    if (!(this instanceof TC)) {
        return new TC(func, arg);
    }
    this.func = func;
    this.arg  = arg;
}

// evaluables

function Lit(value) {
    if (!(this instanceof Lit)) {
        return new Lit(value);
    }
    this.value = value;
}
Lit.prototype.eval = function (env, tailCall) {
    if (tailCall) {
        return this.value;
    }
    else {
        return calcTC(this.value);
    }
};

function Var(name) {
    if (!(this instanceof Var)) {
        return new Var(name);
    }
    this.name = name;
}
Var.prototype.eval = function (env, tailCall) {
    return env[this.name];
}

function Lambda(argName, body) {
    if (!(this instanceof Lambda)) {
        return new Lambda(argName, body);
    }
    this.argName = argName;
    this.body    = body;
}
Lambda.prototype.eval = function (env, tailCall) {
    var argName = this.argName;
    var body    = this.body;
    return Val(function (x) {
        var local = Object.create(env);
        local[argName] = x;
        return body.eval(local, true);
    });
};

function Ret(expr) {
    if (!(this instanceof Ret)) {
        return new Ret(expr);
    }
    this.expr = expr;
}
Ret.prototype.eval = function (env, tailCall) {
    var _expr = this.expr.eval(env, false);
    if (_expr instanceof Val) {
        return Next(_expr);
    }
    else if (_expr instanceof Cont) {
        var cont = Val(function (x) {
            return Ret(Lit(_expr.cont(x))).eval(env, tailCall);
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
App.prototype.eval = function (env, tailCall) {
    var _func = this.func.eval(env, false);
    if (_func instanceof Val) {
        var _arg = this.arg.eval(env, false);
        if (_arg instanceof Val) {
            // return _func.raw(_arg);
            if (tailCall) {
                return TC(_func, _arg);
            }
            else {
                return calcTC(_func.raw(_arg));
            }
        }
        else if (_arg instanceof Cont) {
            return Cont(_arg.func, function (x) {
                return App(Lit(_func), Lit(_arg.cont(x))).eval(env, tailCall);
            });
        }
        else if (_arg instanceof Next) {
            return _arg;
        }
    }
    else if (_func instanceof Cont) {
        var arg = this.arg;
        return Cont(_func.func, function (x) {
            return App(Lit(_func.cont(x)), arg).eval(env, tailCall);
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
Let.prototype.eval = function (env, tailCall) {
    var local = Object.create(env);
    var binds = this.binds;
    var body  = this.body;
    for (var i = 0; i < binds.length; i++) {
        var name = binds[i][0];
        var expr = binds[i][1];
        var _expr = expr.eval(local, false);
        if (_expr instanceof Val) {
            local[name] = _expr;
        }
        else if (_expr instanceof Cont) {
            return Cont(_expr.func, function (x) {
                return Let([[name, Lit(_expr.cont(x))]].concat(binds.slice(i + 1)), body).eval(local, tailCall);
            });
        }
        else if (_expr instanceof Next) {
            return _expr;
        }
    }
    var _body = body.eval(local, tailCall);
    if (_body instanceof TC) {
        return _body;
    }
    else if (_body instanceof Val) {
        return _body;
    }
    else if (_body instanceof Cont) {
        return Cont(_body.func, function (x) {
            return Let([], Lit(_body.cont(x))).eval(local, tailCall);
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
Proc.prototype.eval = function (env, tailCall) {
    var exprs = this.exprs;
    for (var i = 0; i < exprs.length - 1; i++) {
        var _expr = exprs[i].eval(env, false);
        if (_expr instanceof Val) {
            // nothing
        }
        else if (_expr instanceof Cont) {
            return Cont(_expr.func, function (x) {
                return Proc(exprs.slice(i + 1)).eval(env, tailCall);
            });
        }
        else if (_expr instanceof Next) {
            return _expr;
        }
    }
    var _last = exprs[exprs.length - 1].eval(env, tailCall);
    if (_last instanceof TC) {
        return _last;
    }
    else if (_last instanceof Val) {
        return _last;
    }
    else if (_last instanceof Cont) {
        return Cont(_last.func, function (x) {
            return Proc([Lit(_last.cont(x))]).eval(env, tailCall);
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
    ).eval(env, false)
);

env["x"] = Val(100);

debug(
    Ret(
        App(Var("f"), Lit(Val(3)))
    ).eval(env, false)
);

debug(
    Ret(
        App(Var("call/cc"), Lambda("ret1",
            App(Var("call/cc"), Lambda("ret2",
                App(Var("ret1"), Lit(Val(5)))
            ))
        ))
    ).eval(env, false)
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
    ).eval(env, false)
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
    ).eval(env, false)
);

