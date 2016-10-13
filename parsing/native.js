"use strict";

// const fs = require("fs");
// const util = require("util");
// fs.readFile("./sample.json", "utf8", (err, src) => {
//     if (err) {
//         console.error(err);
//         process.exit(1);
//     }
    const src1k = require("./1K_json.js");
    let data;
    console.time("parse");
    for (let k = 0; k < 1000; k++) {
        data = JSON.parse(src1k);
    }
    console.timeEnd("parse");
//     console.log(util.inspect(data, { depth: null, colors: true }));
// });
