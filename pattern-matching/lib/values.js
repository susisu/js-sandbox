"use strict";

function endModule() {
    module.exports = Object.freeze({
        "DataType": DataType,

        "Value": Value
    });
}

var DataType = Object.freeze({
    "NUMBER": "number",
    "STRING": "string",
    "BOOL"  : "bool",
    "ARRAY" : "array",
    "OBJECT": "object"
});

function Value(type, data) {
    if (!(this instanceof Value)) {
        return new Value(type, data);
    }
    this.type = type;
    this.data = data;
}

Value.prototype = Object.create(Object.prototype, {
    "constructor": {
        "writable"    : true,
        "configurable": true,
        "value": Value
    }
});

endModule();
