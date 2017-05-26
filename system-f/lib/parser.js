/* eslint-plugin-disable flowtype */

import { TyVar, TyArr, TyAll } from "./type.js";
import { TmVar, TmAbs, TmApp, TmTyAbs, TmTyApp } from "./term.js";

import loquat from "loquat";
import loquatToken from "loquat-token";

const lq = loquat();
lq.use(loquatToken);

const tp = lq.makeTokenParser(new lq.LanguageDef({
  commentStart  : "(*",
  commentEnd    : "*)",
  nestedComments: true,
  idStart       : lq.letter,
  idLetter      : lq.alphaNum.or(lq.char("'")),
  opStart       : lq.oneOf(":.->λΛ∀→"),
  opLetter      : lq.oneOf(":.->λΛ∀→"),
  reservedIds   : ["fun", "fun2", "forall"],
  reservedOps   : [":", ".", "->", "λ", "Λ", "∀", "→"],
  caseSensitive : true
}));

const dot    = tp.reservedOp(".");
const colon  = tp.reservedOp(":");
const forall = tp.reserved("forall").or(tp.reservedOp("∀"));
const arrow  = tp.reservedOp("->").or(tp.reservedOp("→"));
const fun    = tp.reserved("fun").or(tp.reservedOp("λ"));
const funL   = tp.reserved("fun2").or(tp.reservedOp("Λ"));

const type = lq.lazy(() => tyArr);
const tyVar = lq.do(function* () {
  const pos  = yield lq.getPosition;
  const name = yield tp.identifier;
  return new TyVar(pos, name);
});
const tyAll = lq.do(function* () {
  const pos = yield lq.getPosition;
  yield forall;
  const params = yield tp.commaSep1(tp.identifier);
  yield dot;
  const body = yield type;
  return params.reduceRight(
    (b, p) => new TyAll(pos, p, b),
    body
  );
});

const atype = lq.choice([
  tyVar,
  tyAll,
  tp.parens(type)
]);
const tyArr = lq.chainr1(
  atype,
  lq.getPosition.left(arrow)
    .map(pos => (dom, codom) => new TyArr(pos, dom, codom))
);

const term = lq.lazy(() => lq.choice([
  tmApp,
  tmAbs,
  tmTyAbs,
  tp.parens(term)
]));
const tmVar = lq.do(function* () {
  const pos  = yield lq.getPosition;
  const name = yield tp.identifier;
  return new TmVar(pos, name);
});
const param = lq.do(function* () {
  const paramName = yield tp.identifier;
  yield colon;
  const paramType = yield type;
  return { name: paramName, type: paramType };
});
const tmAbs = lq.do(function* () {
  const pos = yield lq.getPosition;
  yield fun;
  const params = yield tp.commaSep1(param);
  yield dot;
  const body = yield term;
  return params.reduceRight(
    (b, p) => new TmAbs(pos, p.name, p.type, b),
    body
  );
});
const tmTyAbs = lq.do(function* () {
  const pos = yield lq.getPosition;
  yield funL;
  const params = yield tp.commaSep1(tp.identifier);
  yield dot;
  const body = yield term;
  return params.reduceRight(
    (b, p) => new TmTyAbs(pos, p, b),
    body
  );
});
const fterm = lq.choice([
  tmVar,
  tp.parens(term)
]);
const aterm = lq.choice([
  fterm.map(t => ({ type: "term", content: t })),
  tp.brackets(type).map(t => ({ type: "type", content: t }))
]);
const tmApp = lq.do(function* () {
  const func = yield fterm;
  const args = yield aterm.many();
  return args.reduce(
    (f, a) => (
      a.type === "term"
        ? new TmApp(a.content.pos, f, a.content)
        : new TmTyApp(a.content.pos, f, a.content)
    ),
    func
  );
});

const prog = tp.whiteSpace.right(term).left(lq.eof);

export function parse(src) {
  const res = lq.parse(prog, "", src, undefined, { unicode: true, tabWidth: 4 });
  if (res.success) {
    return res.value;
  }
  else {
    throw new SyntaxError(res.error.toString());
  }
}
