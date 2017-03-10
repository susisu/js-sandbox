"use strict";

const N = 10000000;

// fast <-----------------------------> slow
// array-index > set >~ map > array-iterator

// array-index
{
    const arr = new Array(N);
    for (let i = 0; i < N; i++) {
        arr[i] = Math.random();
    }
    let sum = 0;
    console.time("array-index");
    for (let i = 0; i < N; i++) {
        sum += arr[i];
    }
    console.timeEnd("array-index");
    console.log(sum);
}

// array-iterator
{
    const arr = new Array(N);
    for (let i = 0; i < N; i++) {
        arr[i] = Math.random();
    }
    let sum = 0;
    console.time("array-iterator");
    for (const elem of arr) {
        sum += elem;
    }
    console.timeEnd("array-iterator");
    console.log(sum);
}

// set
{
    const set = new Set();
    for (let i = 0; i < N; i++) {
        set.add(Math.random());
    }
    let sum = 0;
    console.time("set");
    for (const elem of set) {
        sum += elem;
    }
    console.timeEnd("set");
    console.log(sum);
}

// map
{
    const map = new Map();
    for (let i = 0; i < N; i++) {
        map.set(i, Math.random());
    }
    let sum = 0;
    console.time("map");
    for (const elem of map.values()) {
        sum += elem;
    }
    console.timeEnd("map");
    console.log(sum);
}
