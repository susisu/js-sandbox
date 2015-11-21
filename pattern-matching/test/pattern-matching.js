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
});
