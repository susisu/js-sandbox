"use strict";

// naive DP algorithm
function distance(from, to) {
  const fromLen = from.length;
  const toLen = to.length;
  const dist = new Array(fromLen + 1);
  for (let i = 0; i <= fromLen; i++) {
    dist[i] = new Array(toLen + 1);
    dist[i][0] = i;
  }
  for (let j = 1; j <= toLen; j++) {
    dist[0][j] = j;
  }
  for (let i = 1; i <= fromLen; i++) {
    for (let j = 1; j <= toLen; j++) {
      dist[i][j] = from[i - 1] === to[j - 1]
        ? Math.min(dist[i - 1][j] + 1, dist[i][j - 1] + 1, dist[i - 1][j - 1])
        : Math.min(dist[i - 1][j] + 1, dist[i][j - 1] + 1);
    }
  }
  return dist[fromLen][toLen];
}

require("./test.js").test(distance);
require("./exec.js").exec(distance);
