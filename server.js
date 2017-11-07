// Dependencies
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
var app = express();
var server = http.Server(app);
var io = socketIO(server);
app.set('port', 8080);
app.use('/static', express.static(__dirname + '/static'));
app.use('/StyleSheets/css', express.static(__dirname + '/StyleSheets/css'));

// Routing
app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, 'index.html'));
});

// Starts the server.
server.listen(8080, function() {
  console.log('Starting server on port 8080');
});

// Random Color Generator
function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// Add the WebSocket handlers
var players = {}; // All created characters
var onlineUsers = {}; // All online clients
io.on('connection', function(socket) {
  // initiation handler
  socket.on('init', function(data) {
    console.log(data.message);
  });

  // login handler
  socket.on('login', function(data, fn) {
    console.log(socket.id + " wants to login as: " + data.playerId);
    if (players[data.playerId] == null) { // character doesn't exist yet
      players[data.playerId] = {
        x: 300,
        y: 300,
        color: getRandomColor(),
        status: 'idle',
        clickX: 0,
        clickY: 0,
        online: true
      };
      onlineUsers[socket.id] = data.playerId;
      fn(true);
      console.log("Player " + data.playerId + " has logged in");
    } else { // character already exist
      if (players[data.playerId].online) { // character already online
        fn(false);
        console.log("Player " + data.playerId + " already logged in");
      } else { // character offline
        onlineUsers[socket.id] = data.playerId;
        players[data.playerId].online = true; // put character under client control
        fn(true);
        console.log("Player " + data.playerId + " has logged in");
      }
    }
  });

  // movement handler
  socket.on('movement', function(data) {
    var player = players[data.id] || {};
    if (data.left) { player.x -= 5; } // left
    if (data.up) { player.y -= 5; } // up
    if (data.right) { player.x += 5; } // right
    if (data.down) { player.y += 5; } // down
  });

  // attack handler
  socket.on('attack', function(player, pos) {
    if (players[player].status == 'idle') {
      players[player].status = 'attack';
      players[player].clickX = pos.x;
      players[player].clickY = pos.y;
      setTimeout(function() { players[player].status = 'idle';}, 500);
    }
  });

  // shoot handler
  socket.on('shoot', function(player, pos) {
    if (players[player].status == 'idle') {
      players[player].status = 'shoot';
      players[player].clickX = pos.x;
      players[player].clickY = pos.y;
      setTimeout(function() { players[player].status = 'idle';}, 200);
    }
  });

  // logout handler
  socket.on('logout', function(data) {
    players[onlineUsers[socket.id]].online = false; // log character off
    console.log(socket.id + " as player: " + onlineUsers[socket.id] + " has logged out");
    delete onlineUsers[socket.id];
  });

  // disconnect handler
  socket.on('disconnect', function() {
    if (onlineUsers[socket.id] != null) { // check if a character is under client control
      players[onlineUsers[socket.id]].online = false; // log character off
      console.log(socket.id + " as player: " + onlineUsers[socket.id] + " has disconnected");
      delete onlineUsers[socket.id];
    }
  });
});

// Send state of game to all clients
setInterval(function() {
  io.sockets.emit('state', players);
}, 1000 / 60);
