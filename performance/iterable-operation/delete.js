"use strict";

const N = 100000;

// fast <---------------------------------------> slow
// array-pop > set > map > array-shift >~ array-splice

// array-pop
{
    const arr = [];
    for (let i = 0; i < N; i++) {
        arr.push(i);
    }
    console.time("array-pop");
    for (let i = 0; i < N; i++) {
        arr.pop();
    }
    console.timeEnd("array-pop");
}

// array-shift
{
    const arr = [];
    for (let i = 0; i < N; i++) {
        arr.push(i);
    }
    console.time("array-shift");
    for (let i = 0; i < N; i++) {
        arr.shift();
    }
    console.timeEnd("array-shift");
}

// array-splice
{
    const arr = [];
    for (let i = 0; i < N; i++) {
        arr.push(i);
    }
    console.time("array-splice");
    for (let i = 0; i < N; i++) {
        arr.splice(0, 1);
    }
    console.timeEnd("array-splice");
}

// set
{
    const set = new Set();
    for (let i = 0; i < N; i++) {
        set.add(i);
    }
    console.time("set");
    for (let i = 0; i < N; i++) {
        set.delete(i);
    }
    console.timeEnd("set");
}

// map
{
    const map = new Map();
    for (let i = 0; i < N; i++) {
        map.set(i, i);
    }
    console.time("map");
    for (let i = 0; i < N; i++) {
        map.delete(i);
    }
    console.timeEnd("map");
}
