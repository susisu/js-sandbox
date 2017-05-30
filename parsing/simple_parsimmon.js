"use strict";

const P = require("parsimmon");

const a = P.string("A");
const b = P.string("B");
const p = a.chain(() => b);

const N = 4000000;
const src = "AB";
let res;
console.time("parse");
for (let i = 0; i < N; i++) {
    res = p.parse(src);
}
console.timeEnd("parse");
console.log(res);
