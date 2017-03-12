"use strict";

const N = 100000000;

// fast <-------------------------------------------------------> slow
// arrow >~ method-arrow-temp > normal > call > method > bound > apply

// normal function
{
    const func = function (x) { return x * x; };
    console.time("normal");
    for (let i = 0; i < N; i++) {
        func(i);
    }
    console.timeEnd("normal");
}

// arrow function
{
    const func = x => x * x;
    console.time("arrow");
    for (let i = 0; i < N; i++) {
        func(i);
    }
    console.timeEnd("arrow");
}

// method normal
{
    const obj = {
        method: function (x) { return x * x; }
    };
    console.time("method-normal");
    for (let i = 0; i < N; i++) {
        obj.method(i);
    }
    console.timeEnd("method-normal");
}

// method arrow
{
    const obj = {
        method: x => x * x
    };
    console.time("method-arrow");
    for (let i = 0; i < N; i++) {
        obj.method(i);
    }
    console.timeEnd("method-arrow");
}

// method-arrow-temp
{
    const obj = {
        method: x => x * x
    };
    console.time("method-arrow-temp");
    for (let i = 0; i < N; i++) {
        const func = obj.method;
        func(i);
    }
    console.timeEnd("method-arrow-temp");
}

// call
{
    const func = function (x) { return x * x; };
    console.time("call");
    for (let i = 0; i < N; i++) {
        func.call(undefined, i);
    }
    console.timeEnd("call");
}

// apply
{
    const func = function (x) { return x * x; };
    console.time("apply");
    for (let i = 0; i < N; i++) {
        func.apply(undefined, [i]);
    }
    console.timeEnd("apply");
}

// bound
{
    const obj  = {};
    const func = (function (x) { return x * x; }).bind(obj);
    console.time("bound");
    for (let i = 0; i < N; i++) {
        func(i);
    }
    console.timeEnd("bound");
}
