"use strict";

const N = 100000;

// fast <--------------------------------------------------------------------> slow
// array-push > array-splice-back > set > map > array-unshift >~ array-splice-front

// array-push
{
    const arr = [];
    console.time("array-push");
    for (let i = 0; i < N; i++) {
        arr.push(i);
    }
    console.timeEnd("array-push");
}

// array-unshift
{
    const arr = [];
    console.time("array-unshift");
    for (let i = 0; i < N; i++) {
        arr.unshift(i);
    }
    console.timeEnd("array-unshift");
}

// array-splice-front
{
    const arr = [];
    console.time("array-splice-front");
    for (let i = 0; i < N; i++) {
        arr.splice(0, 0, i);
    }
    console.timeEnd("array-splice-front");
}

// array-splice-back
{
    const arr = [];
    console.time("array-splice-back");
    for (let i = 0; i < N; i++) {
        arr.splice(i, 0, i);
    }
    console.timeEnd("array-splice-back");
}

// set
{
    const set = new Set();
    console.time("set");
    for (let i = 0; i < N; i++) {
        set.add(i);
    }
    console.timeEnd("set");
}

// map
{
    const map = new Map();
    console.time("map");
    for (let i = 0; i < N; i++) {
        map.set(i, i);
    }
    console.timeEnd("map");
}
