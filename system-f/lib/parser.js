// @flow

import { parse as _parse } from "./_parser.js";
import { Term } from "./term.js";

export function parse(src: string): Term {
  return _parse(src);
}
