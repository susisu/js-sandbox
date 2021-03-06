"use strict";

const assert = require("assert");

module.exports.test = distanceFunc => {
  assert(distanceFunc("ABC", "DEF") === 6);
  assert(distanceFunc("DEF", "ABC") === 6);
  assert(distanceFunc("ABC", "") === 3);
  assert(distanceFunc("", "ABC") === 3);
  assert(distanceFunc("ABC", "ABCDE") === 2);
  assert(distanceFunc("ABCDE", "ABC") === 2);
  assert(distanceFunc("CDE", "ABCDE") === 2);
  assert(distanceFunc("ABCDE", "CDE") === 2);
  assert(distanceFunc("foobarbaz", "fooxbrbiz") === 4);
  assert(distanceFunc("fooxbrbiz", "foobarbaz") === 4);
  assert(distanceFunc("kitten", "sitting") === 5);
  assert(distanceFunc("sitting", "kitten") === 5);
};
