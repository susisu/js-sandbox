"use strict";

function endModule() {
    module.exports = Object.freeze({
        "match": match,

        "Pattern"  : Pattern,
        "Unbound"  : PUnbound,
        "Variable" : PVariable,
        "Number"   : PNumber,
        "String"   : PString,
        "Bool"     : PBool,
        "As"       : PAs
    });
}

var values   = require("./values.js"),
    DataType = values.DataType,
    Value    = values.Value;

function match(env, pattern, value) {
    return pattern.match(env, value);
}

function Pattern() {
    if (!(this instanceof Pattern)) {
        return new Pattern();
    }
}

Pattern.prototype = Object.create(Object.prototype, {
    "constructor": {
        "writable"    : true,
        "configurable": true,
        "value": Pattern
    },
    "match": {
        "writable"    : true,
        "configurable": true,
        "value": function (env, value) {
            return false;
        }
    }
});

function PUnbound() {
    if (!(this instanceof PUnbound)) {
        return new PUnbound();
    }
    Pattern.call(this);
}

PUnbound.prototype = Object.create(Pattern.prototype, {
    "constructor": {
        "writable"    : true,
        "configurable": true,
        "value": PUnbound
    },
    "match": {
        "writable"    : true,
        "configurable": true,
        "value": function (env, value) {
            return true;
        }
    }
});

function PVariable(name) {
    if (!(this instanceof PVariable)) {
        return new PVariable(name);
    }
    Pattern.call(this);
    this.name = name;
}

PVariable.prototype = Object.create(Pattern.prototype, {
    "constructor": {
        "writable"    : true,
        "configurable": true,
        "value": PVariable
    },
    "match": {
        "writable"    : true,
        "configurable": true,
        "value": function (env, value) {
            env[this.name] = value;
            return true;
        }
    }
});

function PNumber(num) {
    if (!(this instanceof PNumber)) {
        return new PNumber(num);
    }
    Pattern.call(this);
    this.num = num;
}

PNumber.prototype = Object.create(Pattern.prototype, {
    "constructor": {
        "writable"    : true,
        "configurable": true,
        "value": PNumber
    },
    "match": {
        "writable"    : true,
        "configurable": true,
        "value": function (env, value) {
            return value.type === DataType.NUMBER
                && value.data === this.num;
        }
    }
});

function PString(str) {
    if (!(this instanceof PString)) {
        return new PString(str);
    }
    Pattern.call(this);
    this.str = str;
}

PString.prototype = Object.create(Pattern.prototype, {
    "constructor": {
        "writable"    : true,
        "configurable": true,
        "value": PString
    },
    "match": {
        "writable"    : true,
        "configurable": true,
        "value": function (env, value) {
            return value.type === DataType.STRING
                && value.data === this.str;
        }
    }
});

function PBool(b) {
    if (!(this instanceof PBool)) {
        return new PBool(b);
    }
    Pattern.call(this);
    this.b = b;
}

PBool.prototype = Object.create(Pattern.prototype, {
    "constructor": {
        "writable"    : true,
        "configurable": true,
        "value": PBool
    },
    "match": {
        "writable"    : true,
        "configurable": true,
        "value": function (env, value) {
            return value.type === DataType.bool
                && value.data === this.b;
        }
    }
});

function PAs(name, pattern) {
    if (!(this instanceof PAs)) {
        return new PAs(name, pattern);
    }
    Pattern.call(this);
    this.name    = name;
    this.pattern = pattern;
}

PAs.prototype = Object.create(Pattern.prototype, {
    "constructor": {
        "writable"    : true,
        "configurable": true,
        "value": PAs
    },
    "match": {
        "writable"    : true,
        "configurable": true,
        "value": function (env, value) {
            var res = this.pattern.match(value);
            if (res) {
                env[this.name] = value;
                return true;
            }
            else {
                return false;
            }
        }
    }
});

endModule();
