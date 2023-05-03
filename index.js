// const http = require('http');
const express = require("express");
const socket = require("socket.io");
const cors = require("cors");
var mysql = require("mysql");
const app = express();
var http = require("http");
var url = require("url");
var WebSocketServer = require("websocket").server;
// const server = http.createServer(app);
// const io = socketio(server);
require("dotenv").config();
app.use(cors());
app.use(express.json());

var con = mysql.createConnection({
  host: "51.81.160.157",
  user: "kxs9016_kxs9016",
  password: "kxs9016@mavs",
  database: "kxs9016_resicomm",
});

con.connect(function (err) {
  if (err) throw err;
  console.log("Connected!");
});

app.post("/hello", (req, res) => {
  console.log(req);
  res.send("Welcome!");
});

// const server = app.listen(process.env.PORT, () =>
//   console.log(`Server started on ${process.env.PORT}`)
// );

// const io = socket(server, {
//   cors: {
//     origin: ["http://localhost:3000", "https://kxs9016.uta.cloud"],
//     credentials: true,
//   },
// });
var server = http.createServer(function (request, response) {
  function getPostParams(request, callback) {
    var qs = require("querystring");
    if (request.method == "POST") {
      var body = "";
      request.on("data", function (data) {
        body += data;
        if (body.length > 1e6) request.connection.destroy();
      });
      request.on("end", function () {
        var POST = qs.parse(body);
        callback(POST);
      });
    }
  }
  // in-server request from PHP
  if (request.method === "POST") {
    getPostParams(request, function (POST) {
      messageClients(POST.data);
      response.writeHead(200);
      response.end();
    });
    return;
  }
});
server.listen(8080);

var websocketServer = new WebSocketServer({
  httpServer: server,
});
websocketServer.on("request", websocketRequest);
// websockets storage
global.clients = {}; // store the connections
var connectionId = 0; // incremental unique ID for each connection (this does not decrement on close)
function websocketRequest(request) {
  // start the connection
  console.log("Received Connection Request! ");
  var user_id = request.resourceURL.query.user_id;
  var connection = request.accept(null, request.origin);
  console.log(new Date() + " Connection accepted from user id: " + user_id);
  clients[user_id] = connection;
  // if (clients.hasOwnProperty(user_id)) {
  //   console.log("Connection Already Exists! Aborting!");
  //   var connection = clients[user_id];
  //   // return;
  // } else {
  // var connection = request.accept(null, request.origin);
  // console.log(new Date() + " Connection accepted from user id: " + user_id);
  // clients[user_id] = connection;
  // }
  // connectionId++;
  // save the connection for future reference
  // clients[connectionId] = connection;
  connection.on("message", function (message) {
    if (message.type === "utf8") {
      console.log("Received Message: " + message.utf8Data);
      // connection.send(message.utf8Data);
     
     
      for (key in clients) {
        if (message.utf8Data == "ping") {
          clients[key].sendUTF('pong');
  
        } else {
          clients[key].sendUTF(message.utf8Data);
        }
        // clients[key].sendUTF(message.utf8Data)
        console.log("Sent message to user id: " + key);
      }
    } else if (message.type === "binary") {
      console.log(
        "Received Binary Message of " + message.binaryData.length + " bytes"
      );
      connection.sendBytes(message.binaryData);
    }
  });
  connection.on("close", function (reasonCode, description) {
    console.log("disconnected " + JSON.stringify(connection))
    console.log(
      new Date() + " Peer " + connection.remoteAddress + " disconnected."
    );
  });
}
// sends message to all the clients
function messageClients(message) {
  for (var i in clients) {
    clients[i].sendUTF(message);
  }
}

global.onlineUsers = new Map();
// io.on("connection", (socket) => {
//   global.chatSocket = socket;
//   socket.on("add-user", (userId) => {
//     onlineUsers.set(userId, socket.id);
//   });

//   socket.on("send-msg", (data) => {
//     const sendUserSocket = onlineUsers.get(data.to);
//     if (sendUserSocket) {
//       socket.to(sendUserSocket).emit("msg-recieve", data.msg);
//     }
//   });
// });
