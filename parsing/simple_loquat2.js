"use strict";

const _core = require("loquat-core")();
const _prim = require("loquat-prim")(_core);
const _char = require("loquat-char")(_core);
const _comb = require("loquat-combinators")(_core);

const a = _char.char("A");
const b = _char.char("B");
const p = _prim.left(_prim.then(a, b), _comb.eof);

const N = 4000000;
const src = "AB";
let res;
console.time("parse");
for (let i = 0; i < N; i++) {
    res = _core.parse(p, "", src);
}
console.timeEnd("parse");
console.log(res);
