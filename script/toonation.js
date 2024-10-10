//https://github.com/nomomo/Twip-Toonation-Afreehp-Parser-Example/blob/master/index.js
//////////////////////////////////////////////////////////////////
/// toonat
//////////////////////////////////////////////////////////////////
const util = require("util");
const io = require("socket.io-client");
const request = require("request");
const WebSocket = require("websocket");
const WebSocketClient = WebSocket.client;
const requestPromise = util.promisify(request);
require("console-stamp")(console, {
    format: ":date(yyyy/mm/dd HH:MM:ss.l)",
});
var pjson = require("./package.json");
const { clear } = require("console");
console.log("==============================================");
console.log("Initialize toonat");
var payload;
var alertbox_url;
try {
    var response = await requestPromise(alertbox_url);
    if (response.statusCode == 200) {
        var matched_res = response.body.match(
            /"payload"\s*:\s*"([a-zA-Z0-9]+)"/
        );
        if (matched_res !== null && matched_res.length > 1) {
            payload = matched_res[1];
            console.log(`Get toonat.payload succeed : ${payload}\n`);
        } else {
            console.error("Get toonat.payload failed.\n");
        }
    } else {
        console.error("Get toonat.payload failed.");
    }
} catch (e) {
    console.error("Error toonat.payload parse: " + e.toString());
}

function doSomething(cont) {
    // doSomething
    console.log(cont);
}

var toonAtClient = null;
var toonAtIsConnected = false;

function connect_toonat() {
    if (payload == undefined) {
        console.log("can not found toonay payload");
        return;
    }

    toonAtClient = null;
    toonAtClient = new WebSocketClient();

    toonAtClient.on("connectFailed", function (error) {
        console.log("Toonat Connect Error: " + error.toString());
    });

    toonAtClient.on("connect", function (connection) {
        console.log("Toonat Connected");
        toonAtIsConnected = true;

        // Send pings every 12000ms when websocket is connected
        const ping_toonat = function () {
            if (!toonAtIsConnected) {
                return;
            }
            setTimeout(function () {
                connection.ping("#ping");
                ping_toonat();
            }, 12000);
        };
        ping_toonat();

        connection.on("error", function (error) {
            toonAtIsConnected = false;
            console.error("Toonat Connection Error: " + error.toString());
        });
        connection.on("close", function () {
            console.error(
                "Toonat Connection Closed. Try to reconnect after 10 seconds..."
            );
            toonAtIsConnected = false;
            setTimeout(function () {
                connect_toonat();
            }, 10000);
        });
        connection.on("message", function (message) {
            // console.log(message);
            try {
                if (message.type === "utf8") {
                    var data = JSON.parse(message.utf8Data);
                    if (
                        data.content !== undefined &&
                        data.code !== undefined &&
                        data.code == 101
                    ) {
                        // 101: donation, 107: bit, ...
                        doSomething(data);
                    }
                }
            } catch (e) {
                console.error("Error from Toonat message: " + e.toString());
            }
        });
    });

    toonAtClient.connect("wss://ws.toon.at/" + payload);
}

setTimeout(function () {
    connect_toonat();
}, 1000);
