// https://github.com/jneen/parsimmon/blob/master/examples/json.js
const P = require('parsimmon');

// Turn escaped characters into real ones (e.g. "\\n" becoems "\n").
function interpretEscapes(str) {
  const escapes = {
    b: '\b',
    f: '\f',
    n: '\n',
    r: '\r',
    t: '\t'
  };
  return str.replace(/\\(u[0-9a-fA-F]{4}|[^u])/, function(_, escape) {
    const type = escape.charAt(0);
    const hex = escape.slice(1);
    if (type === 'u') return String.fromCharCode(parseInt(hex, 16));
    if (escapes.hasOwnProperty(type)) return escapes[type];
    return type;
  });
}

// This gets reused for both array and object parsing.
function commaSep(parser) {
  return P.sepBy(parser, token(comma));
}

// Use the JSON standard's definition of whitespace rather than Parsimmon's.
const whitespace = P.regexp(/\s*/m);

// JSON is pretty relaxed about whitespace, so let's make it easy to ignore
// after most text.
function token(p) {
  return p.skip(whitespace);
}

// The basic tokens in JSON, with optional whitespace afterward.
const lbrace = token(P.string('{'));
const rbrace = token(P.string('}'));
const lbracket = token(P.string('['));
const rbracket = token(P.string(']'));
const comma = token(P.string(','));
const colon = token(P.string(':'));

// `.result` is like `.map` but it takes a value instead of a function, and
// `.always returns the same value.
const nullLiteral = token(P.string('null')).result(null);
const trueLiteral = token(P.string('true')).result(true);
const falseLiteral = token(P.string('false')).result(false);

// Regexp based parsers should generally be named for better error reporting.
const stringLiteral =
  token(P.regexp(/"((?:\\.|.)*?)"/, 1))
    .map(interpretEscapes)
    .desc('string');

const numberLiteral =
  token(P.regexp(/-?(0|[1-9][0-9]*)([.][0-9]+)?([eE][+-]?[0-9]+)?/))
    .map(Number)
    .desc('number');

// This is the main entry point of the parser: a full JSON document.
const json = P.lazy(function() {
  return whitespace.then(P.alt(
      object,
      array,
      stringLiteral,
      numberLiteral,
      nullLiteral,
      trueLiteral,
      falseLiteral
    ));
});

// Array parsing is just ignoring brackets and commas and parsing as many nested
// JSON documents as possible. Notice that we're using the parser `json` we just
// defined above. Arrays and objects in the JSON grammar are recursive because
// they can contain any other JSON document within them.
const array = lbracket.then(commaSep(json)).skip(rbracket);

// Object parsing is a little trickier because we have to collect all the key-
// value pairs in order as length-2 arrays, then manually copy them into an
// object.
const pair = P.seq(stringLiteral.skip(colon), json);
const object =
  lbrace.then(commaSep(pair)).skip(rbrace).map(function(pairs) {
    const out = {};
    for (var i = pairs.length-1; i >= 0; i -= 1) {
      out[pairs[i][0]] = pairs[i][1];
    }
    return out;
  });

///////////////////////////////////////////////////////////////////////

function parse(src) {
  return json.parse(src);
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
