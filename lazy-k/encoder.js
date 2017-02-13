"use strict";

const zero = "`ki";
const succ = "`s``s`ksk";
const term = "```sii```sii``s``s`kski";
const cons = "``s``s`ks``s`kk``s`ks``s`k`sik`kk";
const fix  = "```ssk``s`k``ss`s``sskk";

// encoded =  (``cons (`succ)* 0)* `fix `cons 256

function encode(str) {
    let code = "";
    for (const chr of str) {
        const c = chr.codePointAt(0);
        code += "``" + cons
            + ("`" + succ).repeat(c)
            + zero;
    }
    return "`k" + code + "`" + fix + "`" + cons + term;
}

console.log(encode("Hello!\n"));
