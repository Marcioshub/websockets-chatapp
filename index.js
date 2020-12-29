require("dotenv").config();
require("colors");
const webSocketServerPort = process.env.PORT || 5000;
const webSocketServer = require("websocket").server;
const http = require("http");
const { v4: uuidv4 } = require("uuid");
const express = require("express");
const cron = require("node-cron");
const path = require("path");
const app = express();
var clients = {};

app.use(express.static(path.join(__dirname, "/client/build")));

const server = http.createServer(app);
server.listen(webSocketServerPort, () =>
  console.log(`listening on port ${process.env.PORT}`)
);

const wsServer = new webSocketServer({
  httpServer: server,
});

// delete clients every night at 12 am
async function cleanUp() {
  try {
    clients = {};
  } catch (err) {
    console.log(err.message);
    return;
  }
}

const task = cron.schedule("0 0 * * *", () => {
  cleanUp();
});
task.start();

wsServer.on("request", function (request) {
  var userId = uuidv4();
  // console.log(
  //   new Date() + " Recieved a new connection from origin " + request.origin
  // );

  const connection = request.accept(null, request.origin);
  clients[userId] = connection;

  // console.log(
  //   "connected:" + userId + " in " + Object.getOwnPropertyNames(clients)
  // );

  connection.on("message", function (message) {
    if (message.type === "utf8") {
      // console.log("Recevied message");
      //console.log("Recevied message:", message.utf8Data);

      // boradcast message to all connected clients
      for (key in clients) {
        clients[key].sendUTF(message.utf8Data);
        //console.log("sent message to:", clients[key]);
      }
    }
  });

  connection.on("close", function (reasonCode, description) {
    console.log(
      new Date() + " Peer " + connection.remoteAddress + " disconnected.".red
    );
  });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "/client/build", "index.html"));
});
