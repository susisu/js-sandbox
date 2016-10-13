"use strict";

const _core = require("loquat-core")();
const _prim = require("loquat-prim")(_core);
const _char = require("loquat-char")(_core);
const _comb = require("loquat-combinators")(_core);

const {
    SourcePos,
    ParseError,
    Config,
    State,
    Result,
    Parser,
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
    mplus,
    label,
    many
} = _prim;
const {
    string,
    oneOf,
    noneOf,
    char,
    spaces,
    digit,
    manyChars,
    manyChars1,
    regexp
} = _char;
const {
    choice,
    option,
    between,
    sepBy,
    eof
} = _comb;

let escapes = new Map();
escapes.set("b", "\b");
escapes.set("f", "\f");
escapes.set("n", "\n");
escapes.set("r", "\r");
escapes.set("t", "\t");
let f = (_, escape) => {
    let type = escape[0];
    let hex  = escape.slice(1);
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

function lexeme(parser) {
    return left(parser, spaces);
}

let lbrace   = lexeme(char("{"));
let rbrace   = lexeme(char("}"));
let lbracket = lexeme(char("["));
let rbracket = lexeme(char("]"));
let comma    = lexeme(char(","));
let colon    = lexeme(char(":"));

function commaSep(parser) {
    return sepBy(parser, lexeme(comma))
}

let nullLiteral  = then(lexeme(string("null")), pure(null));
let trueLiteral  = then(lexeme(string("true")), pure(true));
let falseLiteral = then(lexeme(string("false")), pure(false));

let stringLiteral = map(lexeme(regexp(/"((?:\\.|.)*?)"/, 1)), interpretEscapes);

let numberLiteral = map(lexeme(regexp(/-?(0|[1-9][0-9]*)([.][0-9]+)?([eE][+-]?[0-9]+)?/, 0)), Number);

let value = lazy(() => choice([
    object,
    array,
    stringLiteral,
    numberLiteral,
    nullLiteral,
    trueLiteral,
    falseLiteral
]));

let array = between(lbracket, rbracket, commaSep(value));

let pair = bind(stringLiteral, k =>
    then(colon,
        map(value, v =>
            [k, v]
        )
    )
);
let object = map(
    between(lbrace, rbrace, commaSep(pair)),
    ps => {
        let obj = {};
        for (let p of ps) {
            obj[p[0]] = p[1];
        }
        return obj;
    }
);

let json = left(right(spaces, value), eof);

function _parse(src) {
    let res = parse(json, "", src);
    if (res.succeeded) {
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
    let src1k = require("./1K_json.js");
    let data;
    console.time("parse");
    for (let k = 0; k < 1000; k++) {
        data = _parse(src1k);
    }
    console.timeEnd("parse");
    // console.log(util.inspect(data, { depth: null, colors: true }));
// });
