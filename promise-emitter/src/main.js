"use strict";

const co = require("co");

class Emitter {
    constructor() {
        this.resolve = null;
        this.port = new Promise(function (resolve, reject) {
            this.resolve = function (value) {
                resolve(value);
            };
        }.bind(this));
    }

    emit(value) {
        let packet = new Packet(value);
        this.resolve(packet);
        this.port = new Promise(function (resolve, reject) {
            this.resolve = resolve;
        }.bind(this));
        return co(function* () {
            return yield packet.result;
        });
    }
}

class Packet {
    constructor(value) {
        this.value = value;
        this.resolve = null, this.reject = null;
        this.result = new Promise(function (resolve, reject) {
            this.resolve = resolve;
            this.reject  = reject;
        }.bind(this));
    }

    resolve(value) {
        this.resolve(value);
    }

    reject(error) {
        this.reject(error);
    }
}

co(function* main() {
    let emitter = new Emitter();
    co(function* () {
        let x = 0;
        while (true) {
            let packet = yield emitter.port;
            x += packet.value;
            console.log(x);
            packet.resolve(x < 100);
        }
    });
    let loop = true;
    while (loop) {
        loop = yield emitter.emit(1);
    }
});
