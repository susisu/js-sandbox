"use strict";

var MeCab = require("mecab-async");

var text = "日本？日本は今、朝ですよ。\
不思議ですよね。ここはまだ夜なのに、もう太陽が昇ってるんです。\
なんだか私たちだけ世界の端っこに置いて行かれてしまったようです。";

var mecab = new MeCab();
mecab.parse(text, function (error, result) {
    if (error) {
        throw error;
    }
    console.log(result);
});
