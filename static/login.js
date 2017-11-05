var socket = io();
var userId = "";
socket.emit('init', {message: 'New socket request'});

function login(id) {
  if (userId != "") {
    socket.emit('logout', {playerId: userId});
  }
  socket.emit('login', {playerId: id});
  document.getElementById("loggedin").innerHTML = id;
  userId = id;
  connect();
}
