"use strict";

function debug(x) {
    console.log(require("util").inspect(x, { "depth": null, "colors": true }));
}

// result type
var RT = Object.freeze({
    "UNKNOWN": "unknown",
    "OK"     : "ok",
    "ERROR"  : "error",
    "CONT"   : "continuation",
    "NEXT"   : "next"
});

// result
function Res() {
    if (!(this instanceof Res)) {
        return new Res();
    }
}
Res.prototype = Object.create(Object.prototype, {
    "constructor": {
        "writable"    : true,
        "configurable": true,
        "value": Res
    },
    "resType": {
        "configurable": true,
        "get": function () {
            return RT.UNKNOWN;
        }
    }
});

// value
// raw: *
function Val(raw) {
    if (!(this instanceof Val)) {
        return new Val(raw);
    }
    this.raw = raw;
}
Val.prototype = Object.create(Res.prototype, {
    "constructor": {
        "writable"    : true,
        "configurable": true,
        "value": Val
    },
    "resType": {
        "configurable": true,
        "get": function () {
            return RT.OK;
        }
    }
});

// error
// mes: string
function Err(mes) {
    if (!(this instanceof Err)) {
        return new Err(mes);
    }
    this.mes = mes;
}
Err.prototype = Object.create(Res.prototype, {
    "constructor": {
        "writable"    : true,
        "configurable": true,
        "value": Err
    },
    "resType": {
        "configurable": true,
        "get": function () {
            return RT.ERROR;
        }
    }
});

// next
// val: Val *
function Next(val) {
    if (!(this instanceof Next)) {
        return new Next(val);
    }
    this.val = val;
}
Next.prototype = Object.create(Res.prototype, {
    "constructor": {
        "writable"    : true,
        "configurable": true,
        "value": Next
    },
    "resType": {
        "configurable": true,
        "get": function () {
            return RT.NEXT;
        }
    }
});

// continuation
// func    : Val (Val (Val * -> (Res | TC)) -> (Res | TC))
// contList: CL
// done    : boolean
function Cont(func, contList, done) {
    if (!(this instanceof Cont)) {
        return new Cont(func, contList, done);
    }
    this.func     = func;
    this.contList = contList;
    this.done     = done;
}
Cont.prototype = Object.create(Res.prototype, {
    "constructor": {
        "writable"    : true,
        "configurable": true,
        "value": Cont
    },
    "resType": {
        "configurable": true,
        "get": function () {
            return RT.CONT;
        }
    }
});

// continuation list
// proc: (Res | TC) -> (Res | TC)
// next: CL
function CL(proc, next) {
    if (!(this instanceof CL)) {
        return new CL(proc, next);
    }
    this.proc = proc;
    this.next = next;
}

// create continuation function
// contList: CL
// -> Val ((Res | TC) -> (Res | TC))
function createCF(contList) {
    var procs = [];
    while (contList) {
        procs.push(contList.proc);
        contList = contList.next;
    }
    return Val(function (x) {
        for (var i = procs.length - 1; i >= 0; i--) {
            x = procs[i](x);
        }
        return x;
    });
}

// run continuation
// cont: Cont
// -> Res | TC
function runCont(cont) {
    var cf = createCF(cont.contList);
    return cf.raw(cont.func.raw(cf));
}

// run all continuation
// res: Res | TC
// -> Res | TC
function runAllCont(res) {
    while (res instanceof Cont) {
        res = runCont(res);
    }
    return res;
}

// tail call
// func: Val (Val * -> Res | TC)
// arg : Val *
function TC(func, arg) {
    if (!(this instanceof TC)) {
        return new TC(func, arg);
    }
    this.func = func;
    this.arg  = arg;
}

// calculate tail call
// res: Res | TC
// -> Res
function calcTC(res) {
    while (res instanceof TC) {
        res = res.func.raw(res.arg);
    }
    return res;
}

// expression (evaluable)
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
    // evaluate
    // env     : Object
    // tailCall: boolean
    // -> Res | TC
    "eval": {
        "writable"    : true,
        "configurable": true,
        "value": function (env, tailCall) {
            return Val(undefined);
        }
    }
});

// literal
// val: Res | TC
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
    "eval": {
        "writable"    : true,
        "configurable": true,
        "value": function (env, tailCall) {
            if (tailCall) {
                return this.val;
            }
            else {
                return calcTC(this.val);
            }
        }
    }
});

// variable
// name: string
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
    "eval": {
        "writable"    : true,
        "configurable": true,
        "value": function (env, tailCall) {
            var val = env[this.name];
            if (val === undefined) {
                return Err("undefined variable: " + this.name);
            }
            else {
                return val;
            }
        }
    }
});

// lambda
// argName: string
// body   : Expr
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
    "eval": {
        "writable"    : true,
        "configurable": true,
        "value": function (env, tailCall) {
            var argName = this.argName,
                body    = this.body;
            return Val(function (arg) {
                var local = Object.create(env);
                local[argName] = arg;
                return body.eval(local, true);
            });
        }
    }
});

// return
// expr: Expr
function Ret(expr) {
    if (!(this instanceof Ret)) {
        return new Ret(expr);
    }
    this.expr = expr;
}
Ret.prototype = Object.create(Expr.prototype, {
    "constructor": {
        "writable"    : true,
        "configurable": true,
        "value": Ret
    },
    "eval": {
        "writable"    : true,
        "configurable": true,
        "value": function (env, tailCall) {
            var _res = this.expr.eval(env, false);
            switch (_res.resType) {
                case RT.OK:
                    return Next(_res);
                case RT.ERROR:
                case RT.NEXT:
                    return _res;
                case RT.CONT:
                    if (_res.done) {
                        return _res;
                    }
                    else {
                        return Cont(_res.func, CL(function (x) {
                            return Ret(Lit(x)).eval(env, tailCall);
                        }, _res.contList), true);
                    }
            }
        }
    }
});

// application
// func: Expr
// arg : Expr
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
    "eval": {
        "writable"    : true,
        "configurable": true,
        "value": function (env, tailCall) {
            var arg = this.arg;
            var _func = this.func.eval(env, false);
            switch (_func.resType) {
                case RT.OK:
                    var _arg = this.arg.eval(env, false);
                    switch (_arg.resType) {
                        case RT.OK:
                            if (tailCall) {
                                return TC(_func, _arg);
                            }
                            else {
                                return calcTC(_func.raw(_arg));
                            }
                        case RT.ERROR:
                        case RT.NEXT:
                            return _arg;
                        case RT.CONT:
                            if (_arg.done) {
                                return _arg;
                            }
                            else {
                                return Cont(_arg.func, CL(function (x) {
                                    return App(Lit(_func), Lit(x)).eval(env, tailCall);
                                }, _arg.contList), false);
                            }
                    }
                case RT.ERROR:
                case RT.NEXT:
                    return _func;
                case RT.CONT:
                    if (_func.done) {
                        return _func;
                    }
                    else {
                        return Cont(_func.func, CL(function (x) {
                            return App(Lit(x), arg).eval(env, tailCall);
                        }, _func.contList), false);
                    }
            }
        }
    }
});

// let-in binding
// binds: [(string, Expr)]
// body : Expr
function Let(binds, body) {
    if (!(this instanceof Let)) {
        return new Let(binds, body);
    }
    this.binds = binds.slice();
    this.body  = body;
}
Let.prototype = Object.create(Expr.prototype, {
    "constructor": {
        "writable"    : true,
        "configurable": true,
        "value": Let
    },
    "eval": {
        "writable"    : true,
        "configurable": true,
        "value": function (env, tailCall) {
            var binds = this.binds,
                body  = this.body;
            var local = Object.create(env);
            for (var i = 0; i < binds.length; i++) {
                var name  = binds[i][0];
                var _expr = binds[i][1].eval(local, false);
                switch (_expr.resType) {
                    case RT.OK:
                        local[name] = _expr;
                        break;
                    case RT.ERROR:
                    case RT.NEXT:
                        return _expr;
                    case RT.CONT:
                        if (_expr.done) {
                            return _expr;
                        }
                        else {
                            return Cont(_expr.func, CL(function (x) {
                                return Let([[name, Lit(x)]].concat(binds.slice(i + 1)), body).eval(local, tailCall);
                            }, _expr.contList), false);
                        }
                }
            }
            var _body = body.eval(local, tailCall);
            if (_body instanceof TC) {
                return _body;
            }
            else {
                switch (_body.resType) {
                    case RT.OK:
                    case RT.ERROR:
                    case RT.NEXT:
                        return _body;
                    case RT.CONT:
                        if (_body.done) {
                            return _body;
                        }
                        else {
                            return Cont(_body.func, CL(function (x) {
                                return Let([], Lit(x)).eval(local, tailCall);
                            }, _body.contList), false);
                        }
                        
                }
            }
        }
    }
});

// procedure
// exprs: [Expr]
function Proc(exprs) {
    if (!(this instanceof Proc)) {
        return new Proc(exprs);
    }
    this.exprs = exprs.slice();
}
Proc.prototype = Object.create(Expr.prototype, {
    "constructor": {
        "writable"    : true,
        "configurable": true,
        "value": Proc
    },
    "eval": {
        "writable"    : true,
        "configurable": true,
        "value": function (env, tailCall) {
            var exprs = this.exprs;
            for (var i = 0; i < exprs.length - 1; i++) {
                var _expr = exprs[i].eval(env, false);
                switch (_expr.resType) {
                    case RT.OK:
                        break;
                    case RT.ERROR:
                    case RT.NEXT:
                        return _expr;
                    case RT.CONT:
                        if (_expr.done) {
                            return _expr;
                        }
                        else {
                            return Cont(_expr.func, CL(function (x) {
                                return Proc(exprs.slice(i + 1)).eval(env, tailCall);
                            }, _expr.contList), false);
                        }
                }
            }
            var _last = exprs[exprs.length - 1].eval(env, tailCall);
            if (_last instanceof TC) {
                return _last;
            }
            else {
                switch (_last.resType) {
                    case RT.OK:
                    case RT.ERROR:
                    case RT.NEXT:
                        return _last;
                    case RT.CONT:
                        if (_last.done) {
                            return _last;
                        }
                        else {
                            return Cont(_last.func, CL(function (x) {
                                return Proc([Lit(x)]).eval(env, tailCall);
                            }, _last.contList), false);
                        }
                }
            }
        }
    }
});

var env = Object.create(null);

env["call/cc"] = Val(function (f) {
    return Cont(f, null, false);
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

debug(runAllCont(
    Ret(
        App(
            App(Var("+"), Var("x")),
            App(Var("call/cc"), Lit(Val(function (cont) {
                env["f"] = cont;
                return Val(2);
            })))
        )
    ).eval(env, false)
));

env["x"] = Val(100);

debug(runAllCont(
    Ret(
        App(Var("f"), Lit(Val(3)))
    ).eval(env, false)
));

debug(runAllCont(
    Ret(
        App(Var("call/cc"), Lambda("ret1",
            App(Var("call/cc"), Lambda("ret2",
                App(Var("ret1"), Lit(Val(5)))
            ))
        ))
    ).eval(env, false)
));

debug(runAllCont(
    Ret(
        App(Var("call/cc"),
            App(Var("call/cc"), Lambda("ret1",
                App(Var("ret1"), Lambda("ret2",
                    App(Var("ret2"), Lit(Val(6)))
                ))
            ))
        )
    ).eval(env, false)
));

env["id"] = Val(function (x) { return x; });

env["l1"] = Ret(Lambda("foo", Proc([
    App(Var("print"), Lit(Val("\n"))),
    Var("foo")
]))).eval(env, false).val;

env["l2"] = Ret(Lambda("foo", Proc([
    App(Var("print"), Lit(Val("*"))),
    Var("foo")
]))).eval(env, false).val;

debug(runAllCont(
    Ret(
        Let([
                ["yin",
                    App(
                        Var("l1"),
                        App(Var("call/cc"), Var("id"))
                    )
                ],
                ["yang",
                    App(
                        Var("l2"),
                        App(Var("call/cc"), Var("id"))
                    )
                ]
            ],
            App(Var("yin"), Var("yang"))
        )
    ).eval(env, false)
));
