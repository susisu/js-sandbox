"use strict";

module.exports.exec = distanceFunc => {
  let buffer = "";

  process.stdin.setEncoding("utf8");

  process.stdin.on("readable", () => {
    const chunk = process.stdin.read();
    if (chunk !== null) {
      buffer += chunk;
    }
  });

  process.stdin.on("end", () => {
    const [original, modified] = buffer.split("\n");
    console.time("time");
    const dist = distanceFunc(original, modified);
    console.timeEnd("time");
    console.log("distance: " + dist);
  });
};
