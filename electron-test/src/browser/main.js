/*
 * reference: http://qiita.com/Quramy/items/a4be32769366cfe55778
 */

"use strict";

var app = require("app");

var BrowserWindow = require("browser-window");

require("crash-reporter").start();

app.once("ready", onReady);

var mainWindow = null;

function onReady(event) {
    openMainWindow();
    
    app.on("window-all-closed", onWindowAllClosed);
}

function onWindowAllClosed(event) {
    if (process.platform != "darwin") {
        app.removeListener("window-all-closed", onWindowAllClosed);
        app.quit();
    }
}

function openMainWindow() {
    mainWindow = new BrowserWindow({ "width": 800, "height": 600 });
    // TODO: get the resource path (== __dirname + "/../..") from somewhere
    mainWindow.loadUrl("file://" + __dirname + "/../../static/index.html");
    mainWindow.once("closed", onMainWindowClosed);
}

function onMainWindowClosed(event) {
    mainWindow = null;
}
