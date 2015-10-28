var evaljs = require("evaljs");

var src = `
function loop(n) {
    var c = 0;
    while (c < n) {
        c++;
    }
    return n;
}

console.log(loop(1000000));
`;

evaljs.evaluate(src);
