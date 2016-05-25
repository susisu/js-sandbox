"use strict";

const lq = require("loquat");

let langDef = new lq.LanguageDef(
    "",
    "",
    "",
    false,
    lq.letter,
    lq.alphaNum,
    undefined,
    undefined,
    [],
    [],
    true
);
let tp = lq.makeTokenParser(langDef);

let value = lq.lazy(() => lq.choice([
    object,
    array,
    string,
    number,
    tp.reserved("null").then(lq.pure(null)),
    tp.reserved("true").then(lq.pure(true)),
    tp.reserved("false").then(lq.pure(false))
]));

let hexDigits = lq.hexDigit.count(4).map(x => x.join(""));
let escaped   = lq.char("\\").then(lq.choice([
    lq.char("\""),
    lq.char("\\"),
    lq.char("/"),
    lq.char("b").then("\b"),
    lq.char("f").then("\f"),
    lq.char("n").then("\n"),
    lq.char("r").then("\r"),
    lq.char("t").then("\t"),
    lq.char("u").then(hexDigits)
        .map(x => String.fromCharCode(parseInt(x, 16)))
]));
let character = escaped.or(lq.noneOf("\"\\\b\f\n\r\t"));
let string    = tp.lexeme(lq.char("\"").right(character.manyChar()).left(lq.char("\"")));

let number = lq.choice([
    tp.naturalOrFloat.map(x => x.length === 2 ? x[1] : x[0]),
    lq.char("-").then(tp.naturalOrFloat).map(x => x.length === 2 ? -x[1] : -x[0])
]);

let array = tp.brackets(tp.commaSep(value));

let member = string.bind(x => tp.colon.then(value.map(y => [x, y])));
let object = tp.braces(tp.commaSep(member))
    .map(xy => {
        let obj = {};
        for (let [x, y] of xy) {
            obj[x] = y;
        }
        return obj;
    })

let json = tp.whiteSpace.right(value).left(lq.eof);

function parse(src) {
    let res = lq.parse(json, "", src, 8);
    if (res.succeeded) {
        return res.value;
    }
    else {
        throw res.error;
    }
}

const fs = require("fs");
const util = require("util");
fs.readFile("./sample.json", "utf8", (err, src) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    let data;
    console.time("parse")
    for (let k = 0; k < 100; k++) {
        data = parse(src);
    }
    console.timeEnd("parse");
    console.log(util.inspect(data, { depth: null, colors: true }));
});
