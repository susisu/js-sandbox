/*
 * reference: http://qiita.com/Quramy/items/a4be32769366cfe55778
 */

"use strict";

var app = require("app");
var BrowserWindow = require("browser-window");
var http = require("http");
var IOServer = require("socket.io");

require("crash-reporter").start();

app.once("ready", onReady);

var mainWindow = null;
var server = null;
var io = null;

function onReady(event) {
    openMainWindow();

    setupServer(9000);
}

function openMainWindow() {
    mainWindow = new BrowserWindow({ "width": 800, "height": 600 });
    // TODO: get the resource path (== __dirname + "/../..") from somewhere
    mainWindow.loadUrl("file://" + __dirname + "/../../static/index.html");
    mainWindow.once("closed", onMainWindowClosed);
}

function onMainWindowClosed(event) {
    mainWindow = null;

    server.close();
    io.removeListener("connection", onIOConnection);
    server = null;
    io = null;

    app.quit();
}

function setupServer(port) {
    server = http.createServer(function (request, response) {
        response.writeHead(200);
        response.end("It works!");
    });
    server.listen(port);

    io = new IOServer(server);
    io.on("connection", onIOConnection);
}

function onIOConnection(socket) {
    socket.once("disconnect", onDisconnect);

    io.emit("newConnection", "test");

    function onDisconnect() {
        console.log("user disconnected");
    }
}
