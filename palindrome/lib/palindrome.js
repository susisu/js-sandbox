/*
 * copyright (c) 2015 Susisu
 */

"use strict";

var MeCab = require("mecab-async");
var mecab = new MeCab();
mecab.command = "mecab -d /usr/local/lib/mecab/dic/ipadic"

function extract(input, minLength) {
    var words = mecab.parseSync(input);
    var palindromes = [];
    for (var i = 0; i < words.length; i++) {
        // 読みが不明ということになるカタカナのみの語を修正
        if (!words[i][8] && /^[ァ-ヺ]+$/.test(words[i][0])) {
            words[i][8] = words[i][0];
        }
        // EOS または助詞、助動詞、記号が先頭に来たら飛ばす
        // 読みの不明な単語も飛ばすようにしておく
        if (words[i].length <= 1 ||
            words[i][1] === "助詞" || words[i][1] === "助動詞" || words[i][1] === "記号" ||
            !words[i][8]) {
            continue;
        }
        var ws = [];
        var longest = "";
        for (var j = i; j < words.length; j++) {
            // EOS または括弧閉、読みの不明な単語が来たら区切る
            if (words[j].length <= 1 ||
                words[j][2] === "括弧開" || words[j][2] === "括弧閉" ||
                !words[j][8]) {
                break;
            }
            ws.push(words[j]);
            // 活用する語が基本形で終わっていない場合は (完全な文ではないので) 回文判定しない
            if ((words[j][1] === "動詞" || words[j][1] === "形容詞" ||
                words[j][1] === "形容動詞" || words[j][1] === "助動詞") &&
                words[j][6] !== "基本形") {
                continue;
            }
            if (isPalindrome(ws, minLength)) {
                longest = joinWords(ws);
            }
            // 句点で終わっていたら区切る
            if (words[j][2] === "句点") {
                break;
            }
        }
        if (longest.length > 0) {
            palindromes.push(longest);
        }
    }
    return palindromes;
}

// 拗音、促音、濁音、半濁音を清音と同一化する
function normalizeReading(reading) {
    return reading
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
        .replace(/[ボポ]/g, "ホ")
        .replace(/ヷ/g, "ワ")
        .replace(/ヸ/g, "ヰ")
        .replace(/ヴ/g, "ウ")
        .replace(/ヹ/g, "ヱ")
        .replace(/ヺ/g, "ヲ")
        .replace(/ヵ/g, "カ")
        .replace(/ヶ/g, "ケ");
}

function isPalindrome(words, minLength) {
    // 記号でなく、かつ読みのわかる単語のみを集める
    var nonSymbols =
        words.filter(function (word) {
            return word[1] !== "記号" && word[8]
        });
    if (nonSymbols.length <= 1) {
        return false;
    }
    // 名詞のみからなる場合は除く
    if (nonSymbols.every(function (word) { return word[1] === "名詞"; })) {
        return false;
    }
    var reading =
        nonSymbols.map(function (word) { return word[8]; })
            .join("");
    // 短いものを除く
    if (reading.length < minLength) {
        return false;
    }
    reading = normalizeReading(reading);
    return reading === reading.split("").reverse().join("");
}

function joinWords(words) {
    var kanji =
        words.map(function (word) { return word[0]; })
            .join("");
    return kanji;
}

module.exports = Object.freeze({
    "extract": extract
});
