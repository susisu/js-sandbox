"use strict";

const parser = require("./peg_parser.js");

const fs = require("fs");
const util = require("util");
fs.readFile("./sample.json", "utf8", (err, src) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    let data;
    console.time("parse");
    for (let k = 0; k < 100; k++) {
        data = parser.parse(src);
    }
    console.timeEnd("parse");
    console.log(util.inspect(data, { depth: null, colors: true }));
});
