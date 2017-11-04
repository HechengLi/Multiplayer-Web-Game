// Dependencies
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
var app = express();
var server = http.Server(app);
var io = socketIO(server);
app.set('port', 5000);
app.use('/static', express.static(__dirname + '/static'));

// Routing
app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, 'index.html'));
});

// Starts the server.
server.listen(5000, function() {
  console.log('Starting server on port 5000');
});

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// Add the WebSocket handlers
var players = {};
io.on('connection', function(socket) {
  socket.on('login', function(data) {
    if (players[data.playerId] == null) {
      players[data.playerId] = {
        x: 300,
        y: 300,
        color: getRandomColor(),
        port: socket.id
      };
    } else {
      players[data.playerId].port = socket.id;
    }
    console.log("Player " + data.playerId + " has logged in");
    console.log("Port " + players[data.playerId].port);
  });
  socket.on('movement', function(data) {
    var player = players[data.id] || {};
    if (data.left) {
      player.x -= 5;
    }
    if (data.up) {
      player.y -= 5;
    }
    if (data.right) {
      player.x += 5;
    }
    if (data.down) {
      player.y += 5;
    }
  });
});
setInterval(function() {
  io.sockets.emit('state', players);
}, 1000 / 60);
