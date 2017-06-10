/* eslint-plugin-disable flowtype */

import loquat from "loquat";
import loquatToken from "loquat-token";

import {
  KnStar,
  KnArr
} from "./kind.js";
import {
  TyVar,
  TyArr,
  TyAll,
  TyAbs,
  TyApp
} from "./type.js";
import {
  TmVar,
  TmAbs,
  TmApp,
  TmTyAbs,
  TmTyApp
} from "./term.js";
import {
  StTyAssume,
  StTmAssume,
  StTyDefine,
  StTmDefine
} from "./statement.js";

const lq = loquat();
lq.use(loquatToken);

const tp = lq.makeTokenParser(new lq.LanguageDef({
  commentStart  : "(*",
  commentEnd    : "*)",
  nestedComments: true,
  idStart       : lq.letter,
  idLetter      : lq.alphaNum.or(lq.char("'")),
  opStart       : lq.oneOf("=.:->"),
  opLetter      : lq.oneOf("=.:->"),
  reservedIds   : ["fun", "forall", "assume", "define"],
  reservedOps   : [".", ":", "->", "::", "=>"],
  caseSensitive : true
}));

// utilities
function isTmVarName(name) {
  return /^[a-z]/.test(name);
}

function isTyVarName(name) {
  return /^[A-Z]/.test(name);
}

const invalidTmVarName = lq.unexpected("variable name must start with a lowercase letter");
const invalidTyVarName = lq.unexpected("type variable name must start with an uppercase letter");

// operators
const dot         = tp.dot;
const star        = tp.symbol("*");
const arrow       = tp.reservedOp("->");
const thickArrow  = tp.reservedOp("=>");
const colon       = tp.reservedOp(":");
const doubleColon = tp.reservedOp("::");
const equal       = tp.reservedOp("=");

// kinds
const knStar = lq.do(function* () {
  const pos = yield lq.getPosition;
  yield star;
  return new KnStar(pos);
});
const knOperand = lq.lazy(() => lq.choice([
  knStar,
  tp.parens(knArr)
]));
const knArr = lq.chainr1(
  knOperand,
  lq.do(function* () {
    const pos = yield lq.getPosition;
    yield thickArrow;
    return (x, y) => new KnArr(pos, x, y);
  })
);
const kind = knArr.label("kind");

// types
const tyVar = lq.do(function* () {
  const pos  = yield lq.getPosition;
  const name = yield tp.identifier;
  if (!isTyVarName(name)) {
    throw invalidTyVarName;
  }
  return new TyVar(pos, name);
});
const tyAll = lq.do(function* () {
  const pos = yield lq.getPosition;
  yield tp.reserved("forall");
  const paramName = yield tp.identifier;
  if (!isTyVarName(paramName)) {
    throw invalidTyVarName;
  }
  yield doubleColon;
  const paramKind = yield kind;
  yield dot;
  const body = yield tyArr;
  return new TyAll(pos, paramName, paramKind, body);
});
const tyAbs = lq.do(function* () {
  const pos = yield lq.getPosition;
  yield tp.reserved("fun");
  const paramName = yield tp.identifier;
  if (!isTyVarName(paramName)) {
    throw invalidTyVarName;
  }
  yield doubleColon;
  const paramKind = yield kind;
  yield dot;
  const body = yield tyArr;
  return new TyAbs(pos, paramName, paramKind, body);
});
const tySingle = lq.lazy(() => lq.choice([
  tyVar,
  tp.parens(tyArr)
]));
const tyApp = lq.do(function* () {
  const func = yield tySingle;
  const args = yield tySingle.many();
  return args.reduce(
    (f, x) => new TyApp(x.pos, f, x),
    func
  );
});
const tyOperand = lq.lazy(() => lq.choice([
  tyApp,
  tyAll,
  tyAbs,
  tp.parens(tyArr)
]));
const tyArr = lq.chainr1(
  tyOperand,
  lq.do(function* () {
    const pos = yield lq.getPosition;
    yield arrow;
    return (dom, codom) => new TyArr(pos, dom, codom);
  })
);
const type = tyArr.label("type");

// terms
const tmVar = lq.do(function* () {
  const pos = yield lq.getPosition;
  const name = yield tp.identifier;
  if (!isTmVarName(name)) {
    throw invalidTmVarName;
  }
  return new TmVar(pos, name);
});
const tmAbs = lq.do(function* () {
  const pos = yield lq.getPosition;
  yield tp.reserved("fun");
  const paramName = yield tp.identifier;
  if (isTmVarName(paramName)) {
    yield colon;
    const paramType = yield type;
    yield dot;
    const body = yield tmTot;
    return new TmAbs(pos, paramName, paramType, body);
  }
  else if (isTyVarName(paramName)) {
    yield doubleColon;
    const paramKind = yield kind;
    yield dot;
    const body = yield tmTot;
    return new TmTyAbs(pos, paramName, paramKind, body);
  }
  else {
    throw lq.unexpected("invalid parameter name");
  }
});
const tmSingle = lq.lazy(() => lq.choice([
  tmVar,
  tp.parens(tmTot)
]));
const tmArg = lq.choice([
  tmSingle.map(tm => ({ type: "term", entity: tm })),
  tp.brackets(tmSingle).map(tm => ({ type: "type", entity: tm }))
]);
const tmApp = lq.do(function* () {
  const func = yield tmSingle;
  const args = yield tmArg.many();
  return args.reduce(
    (f, x) => x.type === "term"
      ? new TmApp(x.entity.pos, f, x.entity)
      : new TmTyApp(x.entity.pos, f, x.entity),
    func
  );
});
const tmTot = lq.lazy(() => lq.choice([
  tmApp,
  tmAbs,
  tp.parens(tmTot)
]));
const term = tmTot.label("term");

// statements
const stAssume = lq.do(function* () {
  const pos = yield lq.getPosition;
  yield tp.reserved("assume");
  const name = yield tp.identifier;
  if (isTmVarName(name)) {
    yield colon;
    const ty = yield type;
    return new StTmAssume(pos, name, ty);
  }
  else if (isTyVarName(name)) {
    yield doubleColon;
    const kn = yield kind;
    return new StTyAssume(pos, name, kn);
  }
  else {
    throw lq.unexpected("invalid name");
  }
});
const stDefine = lq.do(function* () {
  const pos = yield lq.getPosition;
  yield tp.reserved("define");
  const name = yield tp.identifier;
  if (isTmVarName(name)) {
    const a = yield colon.optionMaybe();
    if (a.empty) {
      yield equal;
      const tm = yield term;
      return new StTmDefine(pos, name, undefined, tm);
    }
    else {
      const ty = yield type;
      yield equal;
      const tm = yield term;
      return new StTmDefine(pos, name, ty, tm);
    }
  }
  else if (isTyVarName(name)) {
    const a = yield doubleColon.optionMaybe();
    if (a.empty) {
      yield equal;
      const ty = yield type;
      return new StTyDefine(pos, name, undefined, ty);
    }
    else {
      const kn = yield kind;
      yield equal;
      const ty = yield type;
      return new StTyDefine(pos, name, kn, ty);
    }
  }
  else {
    throw lq.unexpected("invalid name");
  }
});
const statement = lq.choice([
  stAssume,
  stDefine
]).label("statement");

// program
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
    throw new Error(res.error.toString());
  }
}
