// @flow

export type Showable = { toString: () => string } | string;

export const INTERNAL_POS = "<internal>";

export function generateTyVarName(id: number): string {
  let name = "";
  let n    = id;
  while (n >= 0) {
    name = String.fromCharCode((n % 26) + "A".charCodeAt(0)) + name;
    n    = (n / 26 >> 0) - 1;
  }
  return name;
}

export function generateTmVarName(id: number): string {
  let name = "";
  let n    = id;
  while (n >= 0) {
    name = String.fromCharCode((n % 26) + "a".charCodeAt(0)) + name;
    n    = (n / 26 >> 0) - 1;
  }
  return name;
}

export function createReferenceError(pos: Showable, message: string): Error {
  return new Error(
      `Reference Error at ${pos.toString()}:\n`
    + `  ${message}`
  );
}

export function createKindError(pos: Showable, expected: string, actual: string): Error {
  return new Error(
      `Kind Error at ${pos.toString()}:\n`
    + `  expected: ${expected}\n`
    + `  actual  : ${actual}`
  );
}
