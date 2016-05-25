start = json

_ = [ \t\n\r\f\v]*

hexDigit = [0-9] / [A-F] / [a-f]
escaped = "\\" ch:(
        "\"" 
        / "\\"
        / "/"
        / "b" { return "\b"; }
        / "f" { return "\f"; }
        / "n" { return "\n"; }
        / "r" { return "\r"; }
        / "t" { return "\t"; }
        / "u" digits:$(hexDigit hexDigit hexDigit hexDigit) {
            return String.fromCharCode(parseInt(digits, 16));
        }
    ) { return ch; }
character = escaped / [^\"\\\b\f\n\r\t]
string = "\"" str:character* "\"" _ { return str.join(""); }

natural = head:[1-9] tail:$([0-9]*) { return head + tail; }
integer = sign:"-"? digits:(natural / "0") { return (sign || "") + digits }
frac = "." digits:$([0-9]+) { return "." + digits; }
exp = ("e" / "E") sign:("-" / "+")? digits:$([0-9]+) { return "e" + (sign || "") + digits; }
number = i:integer f:frac? e:exp? _ { return parseFloat(i + (f || "") + (e || "")); }

null = "null" _ { return null; }
true = "true" _ { return true; }
false = "false" _ { return false; }

comma = "," _
openBracket = "[" _
closeBracket = "]" _

tailelem = comma val:value { return val; }
array = openBracket closeBracket { return []; }
    / openBracket head:value tail:tailelem* closeBracket { return [head].concat(tail); }

colon = ":" _
openBrace = "{" _
closeBrace = "}" _

member = key:string _ colon val:value _ { return [key, val]; }
tailmember = comma key:string _ colon val:value _ { return [key, val]; }
object = openBrace closeBrace { return {}; }
    / openBrace head:member _ tail:tailmember* closeBrace {
        let kv = [head].concat(tail);
        let obj = {};
        for (let [key, val] of kv) {
            obj[key] = val;
        }
        return obj;
    }

value = object
    / array
    / string
    / number
    / null
    / true
    / false

json = _ value
