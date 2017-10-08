#!/usr/bin/env node
"use strict";

const M = parseInt(process.argv[2]);
const D = parseInt(process.argv[3]);
const P = parseInt(process.argv[4]);

if (Number.isNaN(M) || Number.isNaN(D) || Number.isNaN(P)) {
  process.stderr.write("Usage: generate.js <M> <D> <P>\n");
  process.exit(1);
}

if (P > M) {
  process.stderr.write("P must be smaller than M");
  process.exit(1);
}

const I = D - P;

const alphabet = [];
for (let c = "A".charCodeAt(0); c <= "Z".charCodeAt(0); c++) {
  alphabet.push(String.fromCharCode(c));
}
for (let c = "a".charCodeAt(0); c <= "z".charCodeAt(0); c++) {
  alphabet.push(String.fromCharCode(c));
}

function genChar() {
  const i = Math.floor(Math.random() * alphabet.length);
  return alphabet[i];
}

const original = new Array(M);
for (let i = 0; i < M; i++) {
  original[i] = genChar();
}

const modified = original.slice();
// delete
for (let t = 0; t < P; t++) {
  const i = Math.floor(Math.random() * (M - t));
  modified.splice(i, 1);
}
// insert
for (let t = 0; t < I; t++) {
  const i = Math.floor(Math.random() * (M - P + t + 1));
  modified.splice(i, 0, genChar());
}

process.stdout.write(`${original.join("")}\n`);
process.stdout.write(`${modified.join("")}\n`);

const dist = distance(original, modified);
process.stdout.write(`## M ${dist.M}\n`);
process.stdout.write(`## N ${dist.N}\n`);
process.stdout.write(`## D ${dist.D}\n`);
process.stdout.write(`## P ${dist.P}\n`);

function distance(from, to, flip = false) {
  const fromLen = from.length;
  const toLen = to.length;
  if (fromLen > toLen) {
    return distance(to, from, true);
  }
  const maxi = new Array(fromLen + toLen + 1);
  const offset = fromLen;
  const delta = toLen - fromLen;
  for (let p = 0; p <= fromLen; p++) {
    for (let k = -p; k < delta; k++) {
      let i = p === 0  ? (k === 0 ? 0 : maxi[offset + k - 1])
            : k === -p ? maxi[offset + k + 1] + 1
            : Math.max(maxi[offset + k + 1] + 1, maxi[offset + k - 1]);
      while (i < fromLen && i + k < toLen && from[i] === to[i + k]) {
        i += 1;
      }
      maxi[offset + k] = i;
    }
    for (let k = delta + p; k > delta; k--) {
      let i = k === delta + p ? maxi[offset + k - 1]
            : Math.max(maxi[offset + k + 1] + 1, maxi[offset + k - 1]);
      while (i < fromLen && i + k < toLen && from[i] === to[i + k]) {
        i += 1;
      }
      maxi[offset + k] = i;
    }
    {
      const k = delta;
      let i = p === 0 ? (k === 0 ? 0 : maxi[offset + k - 1])
            : Math.max(maxi[offset + k + 1] + 1, maxi[offset + k - 1]);
      while (i < fromLen && i + k < toLen && from[i] === to[i + k]) {
        i += 1;
      }
      if (i === fromLen) {
        const d = delta + 2 * p;
        return flip
          ? { M: toLen, N: fromLen, D: d, P: d - p }
          : { M: fromLen, N: toLen, D: d, P: p }
      }
      maxi[offset + k] = i;
    }
  }
  throw new Error("never");
}
