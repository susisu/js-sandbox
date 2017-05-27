// @flow
/* eslint-disable no-console */

import { parse } from "./lib/parser.js";
import { emptyContext } from "./lib/term.js";

const src = `
Variable False;
Axiom ex: forall X. False -> X;
Axiom dne: forall X. ((X -> False) -> False) -> X;
Theorem peirce: forall A, B. ((A -> B) -> A) -> A
= fun2 A.
  fun2 B.
  dne [((A -> B) -> A) -> A] (
    fun H: (((A -> B) -> A) -> A) -> False.
    H (
      fun H0: (A -> B) -> A.
      H0 (
        fun H1: A.
        ex [B] (
          H (
            fun H2: (A -> B) -> A.
            H1
          )
        )
      )
    )
  );
`;

const stmts = parse(src);
let context = emptyContext();
for (let i = 0; i < stmts.length; i++) {
  const st = stmts[i];
  context = st.exec(context);
}
