/* eslint-plugin-disable flowtype */

import loquat from "loquat";
import loquatToken from "loquat-token";

import {
  TmVar,
  TmAbs,
  TmApp,
  TmProd,
  TmProp,
  TmType
} from "./term.js";
import {
  StAssume,
  StDefine
} from "./statement.js";

const lq = loquat();
lq.use(loquatToken);

const tp = lq.makeTokenParser(new lq.LanguageDef({
  commentStart  : "(*",
  commentEnd    : "*)",
  nestedComments: true,
  idStart       : lq.letter,
  idLetter      : lq.alphaNum.or(lq.oneOf("'_")),
  opStart       : lq.oneOf("=:.->"),
  opLetter      : lq.oneOf("=:.->"),
  reservedIds   : ["fun", "forall", "assume", "define"],
  reservedOps   : ["=", ":", ".", "->"],
  caseSensitive : true
}));

const star  = tp.symbol("*");
const sharp = tp.symbol("#");
const colon = tp.reservedOp(":");
const dot   = tp.reservedOp(".");
const arrow = tp.reservedOp("->");
const equal = tp.reservedOp("=");

const tmProp = lq.do(function* () {
  const pos = yield lq.getPosition;
  yield star;
  return new TmProp(pos);
});
const tmType = lq.do(function* () {
  const pos = yield lq.getPosition;
  yield sharp;
  return new TmType(pos);
});
const tmVar = lq.do(function* () {
  const pos  = yield lq.getPosition;
  const name = yield tp.identifier;
  return new TmVar(pos, name);
});
const tmUnit = lq.lazy(() => lq.choice([
  tmProp,
  tmType,
  tmVar,
  tp.parens(_term)
]));
const tmApp = lq.do(function* () {
  const func = yield tmUnit;
  const args = yield tmUnit.many();
  return args.reduce(
    (f, x) => new TmApp(x.pos, f, x),
    func
  );
});
const tmBind = lq.do(function* () {
  const name = yield tp.identifier;
  yield colon;
  const type = yield _term;
  return { name, type };
});
const tmAbs = lq.do(function* () {
  const pos = yield lq.getPosition;
  yield tp.reserved("fun");
  const bind = yield tmBind;
  yield dot;
  const body = yield _term;
  return new TmAbs(pos, bind.name, bind.type, body);
});
const tmProd = lq.do(function* () {
  const pos = yield lq.getPosition;
  const tag = yield tp.reserved("forall").optionMaybe();
  if (tag.empty) {
    const dom   = yield tmApp;
    const codom = yield arrow.and(_term).optionMaybe();
    return codom.empty ? dom : new TmProd(pos, "", dom, codom.value);
  }
  else {
    const bind = yield tmBind;
    yield dot;
    const body = yield _term;
    return new TmProd(pos, bind.name, bind.type, body);
  }
});
const _term = lq.choice([
  tmAbs,
  tmProd
]);
const term = _term.label("term");

const stAssume = lq.do(function* () {
  const pos = yield lq.getPosition;
  yield tp.reserved("assume");
  const bind = yield tmBind;
  return new StAssume(pos, bind.name, bind.type);
});
const stDefine = lq.do(function* () {
  const pos = yield lq.getPosition;
  yield tp.reserved("define");
  const name = yield tp.identifier;
  const type = yield colon.and(term).optionMaybe();
  yield equal;
  const body = yield term;
  return new StDefine(pos, name, body, type.empty ? undefined : type.value);
});
const statement = lq.choice([
  stAssume,
  stDefine
]).label("statement");

const program = lq.do(function* () {
  yield tp.whiteSpace;
  yield tp.semi.skipMany();
  const sts = yield statement.sepEndBy(tp.semi);
  yield tp.semi.skipMany();
  yield lq.eof;
  return sts;
});

export function parse(name, src) {
  const res = lq.parse(program, name, src, undefined, { unicode: true });
  if (res.success) {
    return res.value;
  }
  else {
    throw new Error(
        `Parse Error at ${res.error.pos.toString()}\n`
      + lq.ErrorMessage.messagesToString(res.error.msgs)
        .split("\n")
        .map(msgStr => "  " + msgStr)
        .join("\n")
    );
  }
}
