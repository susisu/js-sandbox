"use strict";

var chai   = require("chai"),
    expect = chai.expect;

var v = require("../lib/values.js"),
    T = v.DataType,
    V = v.Value;

var p     = require("../lib/patterns.js"),
    match = p.match;

describe("pattern-matching", function () {
    it("unbound pattern" , function () {
        var env = Object.create(null);
        var pat = p.Unbound();
        var val = V(T.NUMBER, 3.14);
        var res = match(env, pat, val);

        expect(res).to.be.true;
        expect(env).to.deep.equal({});
    });

    it("variable pattern", function () {
        var env = Object.create(null);
        var pat = p.Variable("x");
        var val = V(T.NUMBER, 3.14);
        var res = match(env, pat, val);

        expect(res).to.be.true;
        expect(env).to.deep.equal({
            "x": val
        });
    });

    it("number pattern" , function () {
        (function () {
            var env = Object.create(null);
            var pat = p.Number(3.14);
            var val = V(T.NUMBER, 3.14);
            var res = match(env, pat, val);

            expect(res).to.be.true;
            expect(env).to.deep.equal({});
        })();
        
        (function () {
            var env = Object.create(null);
            var pat = p.Number(3.14);
            var val = V(T.STRING, "foobar");
            var res = match(env, pat, val);

            expect(res).to.be.false;
            expect(env).to.deep.equal({});
        })();
    });

    it("string pattern" , function () {
        (function () {
            var env = Object.create(null);
            var pat = p.String("foobar");
            var val = V(T.STRING, "foobar");
            var res = match(env, pat, val);

            expect(res).to.be.true;
            expect(env).to.deep.equal({});
        })();
        
        (function () {
            var env = Object.create(null);
            var pat = p.String("foobar");
            var val = V(T.NUMBER, 3.14);
            var res = match(env, pat, val);

            expect(res).to.be.false;
            expect(env).to.deep.equal({});
        })();
    });

    it("bool pattern" , function () {
        (function () {
            var env = Object.create(null);
            var pat = p.Bool(true);
            var val = V(T.BOOL, true);
            var res = match(env, pat, val);

            expect(res).to.be.true;
            expect(env).to.deep.equal({});
        })();
        
        (function () {
            var env = Object.create(null);
            var pat = p.Bool(true);
            var val = V(T.NUMBER, 3.14);
            var res = match(env, pat, val);

            expect(res).to.be.false;
            expect(env).to.deep.equal({});
        })();
    });

    it("as pattern", function () {
        (function () {
            var env = Object.create(null);
            var pat = p.As("x", p.Number(3.14));
            var val = V(T.NUMBER, 3.14);
            var res = match(env, pat, val);

            expect(res).to.be.true;
            expect(env).to.deep.equal({
                "x": val
            });
        })();
        
        (function () {
            var env = Object.create(null);
            var pat = p.As("x", p.Number(3.14));
            var val = V(T.STRING, "foobar");
            var res = match(env, pat, val);

            expect(res).to.be.false;
            expect(env).to.deep.equal({});
        })();
    });

    it("array pattern", function () {
        (function () {
            var env = Object.create(null);
            var pat = p.Array([
                p.Unbound(),
                p.Variable("x"),
                p.Number(3.14),
                p.As("y", p.String("foobar"))
            ]);
            var val = V(T.ARRAY,[
                V(T.NUMBER, 2.72),
                V(T.STRING, "nya"),
                V(T.NUMBER, 3.14),
                V(T.STRING, "foobar")
            ]);
            var res = match(env, pat, val);

            expect(res).to.be.true;
            expect(env).to.deep.equal({
                "x": V(T.STRING, "nya"),
                "y": V(T.STRING, "foobar")
            });
        })();

        (function () {
            var env = Object.create(null);
            var pat = p.Array([
                p.Unbound(),
                p.Variable("x"),
                p.Number(3.14),
                p.As("y", p.String("foobar"))
            ]);
            var val = V(T.ARRAY,[
                V(T.NUMBER, 2.72),
                V(T.STRING, "nya"),
                V(T.NUMBER, 3.14),
                V(T.STRING, "piyo")
            ]);
            var res = match(env, pat, val);

            expect(res).to.be.false;
            expect(env).to.deep.equal({});
        })();
    });

    it("object pattern", function () {
        (function () {
            var env = Object.create(null);
            var pat = p.Object({
                "x": p.Unbound(),
                "y": p.Variable("x"),
                "z": p.Number(3.14),
                "w": p.As("y", p.String("foobar"))
            });
            var val = V(T.OBJECT,{
                "x": V(T.NUMBER, 2.72),
                "y": V(T.STRING, "nya"),
                "z": V(T.NUMBER, 3.14),
                "w": V(T.STRING, "foobar")
            });
            var res = match(env, pat, val);

            expect(res).to.be.true;
            expect(env).to.deep.equal({
                "x": V(T.STRING, "nya"),
                "y": V(T.STRING, "foobar")
            });
        })();

        (function () {
            var env = Object.create(null);
            var pat = p.Object({
                "x": p.Unbound(),
                "y": p.Variable("x")
            });
            var val = V(T.OBJECT,{
                "x": V(T.NUMBER, 2.72),
                "y": V(T.STRING, "nya"),
                "z": V(T.NUMBER, 3.14),
                "w": V(T.STRING, "foobar")
            });
            var res = match(env, pat, val);

            expect(res).to.be.true;
            expect(env).to.deep.equal({
                "x": V(T.STRING, "nya")
            });
        })();

        (function () {
            var env = Object.create(null);
            var pat = p.Object({
                "x": p.Unbound(),
                "y": p.Variable("x"),
                "z": p.Number(3.14),
                "w": p.As("y", p.String("foobar"))
            });
            var val = V(T.OBJECT,{
                "x": V(T.NUMBER, 2.72),
                "y": V(T.STRING, "nya")
            });
            var res = match(env, pat, val);

            expect(res).to.be.false;
            expect(env).to.deep.equal({});
        })();
    });
});
