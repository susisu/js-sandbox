"use strict";

var remote = require("remote");
var io = remote.require("socket.io-client");

var socket = io.connect("http://localhost:9000");

socket.on("newConnection", function (data) {
    var p = window.document.createElement("p");
    p.innerText = data;
    window.document.getElementById("messages").appendChild(p);
});
