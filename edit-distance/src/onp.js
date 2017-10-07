"use strict";

// O((M + N)P) algorithm
function distance(from, to) {
  const fromLen = from.length;
  const toLen = to.length;
  if (fromLen > toLen) {
    return distance(to, from);
  }
  const maxi = new Array(fromLen + toLen + 1);
  const offset = fromLen;
  const delta = toLen - fromLen;
  for (let p = 0; p <= fromLen; p++) {
    for (let k = -p; k < delta; k++) {
      let i = p === 0  ? 0
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
      let i = p === 0 ? 0
            : Math.max(maxi[offset + k + 1] + 1, maxi[offset + k - 1]);
      while (i < fromLen && i + k < toLen && from[i] === to[i + k]) {
        i += 1;
      }
      if (i === fromLen) {
        return delta + 2 * p;
      }
      maxi[offset + k] = i;
    }
  }
  throw new Error("never");
}

require("./test.js").test(distance);
require("./exec.js").exec(distance);
