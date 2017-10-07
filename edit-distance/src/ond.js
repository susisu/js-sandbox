"use strict";

// O((M + N)D) algorithm
function distance(from, to) {
  const fromLen = from.length;
  const toLen = to.length;
  const maxi = new Array(2 * (fromLen + toLen) + 1);
  const offset = fromLen + toLen;
  for (let d = 0; d <= fromLen + toLen; d++) {
    for (let k = -d; k <= d; k += 2) {
      let i = d === 0  ? 0
            : k === -d ? maxi[offset + k + 1] + 1
            : k === d  ? maxi[offset + k - 1]
            : Math.max(maxi[offset + k + 1] + 1, maxi[offset + k - 1]);
      while (i < fromLen && i + k < toLen && from[i] === to[i + k]) {
        i += 1;
      }
      if (k === toLen - fromLen && i === fromLen) {
        return d;
      }
      maxi[offset + k] = i;
    }
  }
  throw new Error("never");
}

require("./test.js").test(distance);
require("./exec.js").exec(distance);
