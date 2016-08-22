const immutable = require("immutable");

{
    const M = 100000;
    {
        let list = new immutable.List();
        console.time("immutable:push");
        for (let i = 0; i < M; i++) {
            list = list.push(Math.random());
        }
        console.timeEnd("immutable:push");
    }

    {
        let list = [];
        console.time("mutable:push");
        for (let i = 0; i < M; i++) {
            list.push(Math.random());
        }
        console.timeEnd("mutable:push");
    }
}


{
    const M = 1000;
    {
        let list = new immutable.List();
        console.time("immutable:concat");
        for (let i = 0; i < M; i++) {
            list = list.concat(Math.random());
        }
        console.timeEnd("immutable:concat");
    }

    {
        let list = [];
        console.time("mutable:concat");
        for (let i = 0; i < M; i++) {
            list = list.concat(Math.random());
        }
        console.timeEnd("mutable:concat");
    }
}

