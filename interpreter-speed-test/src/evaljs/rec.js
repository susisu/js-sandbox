var evaljs = require("evaljs");

var src = `
function loop(c, n) {
    if (c < n) {
        return loop(c + 1, n);
    }
    else {
        return n;
    }
}

console.log(loop(0, 1000));
`;

// NOTE: maximum call stack size exceeded for n = 10000
evaljs.evaluate(src);
