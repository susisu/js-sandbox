"use strict";

const lq = require("loquat");

function lexeme(p) {
    return p.left(lq.spaces);
}

let value = lq.lazy(() => lq.choice([
    object,
    array,
    lexeme(string),
    lexeme(number),
    lexeme(lq.string("null")).then(lq.pure(null)),
    lexeme(lq.string("true")).then(lq.pure(true)),
    lexeme(lq.string("false")).then(lq.pure(false)),
]));

let hexDigits = lq.hexDigit.count(4).map(x => x.join(""));
let escaped   = lq.char("\\").then(lq.choice([
    lq.char("\""),
    lq.char("\\"),
    lq.char("/"),
    lq.char("b").then(lq.pure("\b")),
    lq.char("f").then(lq.pure("\f")),
    lq.char("n").then(lq.pure("\n")),
    lq.char("r").then(lq.pure("\r")),
    lq.char("t").then(lq.pure("\t")),
    lq.char("u").then(hexDigits)
        .map(x => String.fromCharCode(parseInt(x, 16)))
]));
let character = escaped.or(lq.noneOf("\"\\\b\f\n\r\t"));
let string    = lq.char("\"").right(character.manyChar()).left(lq.char("\""));

let zero    = lq.char("0");
let digits  = lq.digit.manyChar();
let digits1 = lq.digit.manyChar1();
let natural = lq.oneOf("123456789").bind(x => digits.map(y => x + y));
let integer = lq.choice([
    natural.or(zero),
    lq.char("-").then(natural.or(zero)).map(x => "-" + x),
]);
let frac = lq.option("",
    lq.char(".").then(digits1).map(x => "." + x)
);
let exp = lq.option("",
    lq.oneOf("eE").then(lq.option("", lq.oneOf("-+")).bind(sign =>
        digits1.map(x => "e" + sign + x)
    ))
);
let number = integer.bind(x =>
    frac.bind(y =>
        exp.map(z => x + y + z)
    )
).map(x => parseFloat(x));

let comma = lexeme(lq.char(","));
let array = lexeme(lq.char("[")).right(value.sepBy(comma)).left(lexeme(lq.char("]")));

let colon = lexeme(lq.char(":"));
let member = string.bind(x => colon.then(value).map(y => [x, y]));
let object = lexeme(lq.char("{")).right(member.sepBy(comma)).left(lexeme(lq.char("}")))
    .map(xy => {
        let obj = {};
        for (let [x, y] of xy) {
            obj[x] = y;
        }
        return obj;
    });

let json = lq.spaces.right(value).left(lq.eof);

function parse(src) {
    let res = lq.parse(json, "", src, 8);
    if (res.succeeded) {
        return res.value;
    }
    else {
        throw res.error;
    }
}

// const fs = require("fs");
// const util = require("util");
// fs.readFile("./sample.json", "utf8", (err, src) => {
//     if (err) {
//         console.error(err);
//         process.exit(1);
//     }
    const src1k = require("./1K_json.js");
    let data;
    console.time("parse");
    for (let k = 0; k < 1000; k++) {
        data = parse(src1k);
    }
    console.timeEnd("parse");
//     console.log(util.inspect(data, { depth: null, colors: true }));
// });
