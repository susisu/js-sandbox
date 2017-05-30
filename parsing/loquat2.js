"use strict";

const _core = require("loquat-core")();
const _prim = require("loquat-prim")(_core);
const _char = require("loquat-char")(_core);
const _comb = require("loquat-combinators")(_core);

const {
    lazy,
    parse
} = _core;
const {
    map,
    pure,
    left,
    right,
    bind,
    then,
    skipMany
} = _prim;
const {
    string,
    oneOf,
    char,
    regexp
} = _char;
const {
    choice,
    between,
    sepBy,
    eof
} = _comb;

const escapes = new Map();
escapes.set("b", "\b");
escapes.set("f", "\f");
escapes.set("n", "\n");
escapes.set("r", "\r");
escapes.set("t", "\t");
const f = (_, escape) => {
    const type = escape[0];
    const hex  = escape.slice(1);
    if (type === "u") {
        return String.fromCharCode(parseInt(hex, 16));
    }
    else if (escapes.has(type)) {
        return escapes.get(type);
    }
    else {
        return type;
    }
};

function interpretEscapes(str) {
    return str.replace(/\\(u[0-9A-Fa-f]{4}|[^u])/g, f);
}

const whitespace = regexp(/\s*/m);

function lexeme(parser) {
    return left(parser, whitespace);
}

const lbrace   = lexeme(char("{"));
const rbrace   = lexeme(char("}"));
const lbracket = lexeme(char("["));
const rbracket = lexeme(char("]"));
const comma    = lexeme(char(","));
const colon    = lexeme(char(":"));

function commaSep(parser) {
    return sepBy(parser, lexeme(comma))
}

const nullLiteral  = then(lexeme(string("null")), pure(null));
const trueLiteral  = then(lexeme(string("true")), pure(true));
const falseLiteral = then(lexeme(string("false")), pure(false));

const stringLiteral = map(lexeme(regexp(/"((?:\\.|.)*?)"/, 1)), interpretEscapes);

const numberLiteral = map(lexeme(regexp(/-?(0|[1-9][0-9]*)([.][0-9]+)?([eE][+-]?[0-9]+)?/, 0)), Number);

const value = lazy(() => choice([
    object,
    array,
    stringLiteral,
    numberLiteral,
    nullLiteral,
    trueLiteral,
    falseLiteral
]));

const array = between(lbracket, rbracket, commaSep(value));

const pair = bind(stringLiteral, k =>
    then(colon,
        map(value, v =>
            [k, v]
        )
    )
);
const object = map(
    between(lbrace, rbrace, commaSep(pair)),
    ps => {
        const obj = {};
        for (const p of ps) {
            obj[p[0]] = p[1];
        }
        return obj;
    }
);

const json = left(right(whitespace, value), eof);

function _parse(src) {
    const res = parse(json, "", src, undefined, { unicode: false });
    if (res.success) {
        return res.value;
    }
    else {
        throw res.error;
    }
    return res;
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
        data = _parse(src1k);
    }
    console.timeEnd("parse");
    // console.log(util.inspect(data, { depth: null, colors: true }));
// });
