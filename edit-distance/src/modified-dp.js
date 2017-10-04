"use strict";

// DP algorithm, linear memory
function distance(from, to) {
  const fromLen = from.length;
  const toLen = to.length;
  if (fromLen >= toLen) {
    const dist = new Array(toLen + 1);
    for (let j = 0; j <= toLen; j++) {
      dist[j] = j;
    }
    for (let i = 1; i <= fromLen; i++) {
      dist[0] = i;
      let diagonal = i - 1;
      for (let j = 1; j <= toLen; j++) {
        let temp = dist[j];
        dist[j] = from[i - 1] === to[j - 1]
          ? Math.min(dist[j] + 1, dist[j - 1] + 1, diagonal)
          : Math.min(dist[j] + 1, dist[j - 1] + 1);
        diagonal = temp;
      }
    }
    return dist[toLen];
  }
  else {
    const dist = new Array(fromLen + 1);
    for (let i = 0; i <= fromLen; i++) {
      dist[i] = i;
    }
    for (let j = 1; j <= toLen; j++) {
      dist[0] = j;
      let diagonal = j - 1;
      for (let i = 1; i <= fromLen; i++) {
        let temp = dist[i];
        dist[i] = from[i - 1] === to[j - 1]
          ? Math.min(dist[i] + 1, dist[i - 1] + 1, diagonal)
          : Math.min(dist[i] + 1, dist[i - 1] + 1);
        diagonal = temp;
      }
    }
    return dist[fromLen];
  }
}

require("./test.js").test(distance);
require("./exec.js").exec(distance);
