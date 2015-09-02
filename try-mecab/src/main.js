"use strict";

var MeCab = require("mecab-async");
var mecab = new MeCab();

var MIN_LENGTH = 6;

process.stdin.resume();
process.stdin.setEncoding("utf8");

process.stdin.on("data", function (chunk) {
    var result = mecab.parseSync(chunk);
    var words = [];
    var i;
    for (i = 0; i < result.length; i++) {
        if (result[i][0] !== "EOS") {
            words.push(result[i]);
        }
    }
    var palindromes = [];
    for (i = 0; i < words.length; i++) {
        var text = "";
        var yomi = "";
        if (words[i][1] === "助詞" || words[i][1] === "助動詞" || words[i][1] == "記号") {
            continue;
        }
        for (var j = i; j < words.length; j++) {
            text += words[j][0];
            if (words[j][1] !== "記号") {
                if (words[j][8]) {
                    yomi += normalize(words[j][8]);
                }
                else {
                    yomi += normalize(words[j][0]);
                }
            }
            if (isPalindrome(yomi)) {
                palindromes.push([text, yomi]);
                process.stdout.write(text + "\n");
            }
            if (words[j][0] === "。") {
                break;
            }
        }
    }
});

process.stdin.on("end", function () {
    process.exit(0);
});

function normalize(yomi) {
    return yomi
        .replace(/ァ/g, "ア")
        .replace(/ィ/g, "イ")
        .replace(/ゥ/g, "ウ")
        .replace(/ェ/g, "エ")
        .replace(/ォ/g, "オ")
        .replace(/ッ/g, "ツ")
        .replace(/ャ/g, "ヤ")
        .replace(/ュ/g, "ユ")
        .replace(/ョ/g, "ヨ")
        .replace(/ヮ/g, "ワ")
        .replace(/ガ/g, "カ")
        .replace(/ギ/g, "キ")
        .replace(/グ/g, "ク")
        .replace(/ゲ/g, "ケ")
        .replace(/ゴ/g, "コ")
        .replace(/ザ/g, "サ")
        .replace(/ジ/g, "シ")
        .replace(/ズ/g, "ス")
        .replace(/ゼ/g, "セ")
        .replace(/ゾ/g, "ソ")
        .replace(/ダ/g, "タ")
        .replace(/ヂ/g, "チ")
        .replace(/ヅ/g, "ツ")
        .replace(/デ/g, "テ")
        .replace(/ド/g, "ト")
        .replace(/[バパ]/g, "ハ")
        .replace(/[ビピ]/g, "ヒ")
        .replace(/[ブプ]/g, "フ")
        .replace(/[ベペ]/g, "ヘ")
        .replace(/[ボポ]/g, "ホ");
}

function isPalindrome(yomi) {
    return yomi.length >= MIN_LENGTH && yomi === yomi.split("").reverse().join("");
}
