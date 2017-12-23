"use strict";

const Promise = require("bluebird").Promise;

const N = 2 * 1000 * 1000;

const init = Promise.resolve(0);
let current = init;
for (let i = 0; i < N; i++) {
  current = current.then(x => x + 1);
}
current.then(x => {
  console.timeEnd("bluebird");
  console.log(x);
});
console.time("bluebird");
