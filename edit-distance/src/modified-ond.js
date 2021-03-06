"use strict";

// O((M + N)D) algorithm, less memory and search path
function distance(from, to) {
  const fromLen = from.length;
  const toLen = to.length;
  const maxi = new Array(fromLen + toLen + 1);
  const offset = fromLen;
  for (let d = 0; d <= fromLen + toLen; d++) {
    const min = d <= fromLen ? -d :  d - 2 * fromLen;
    const max = d <= toLen   ?  d : -d + 2 * toLen;
    for (let k = min; k <= max; k += 2) {
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
