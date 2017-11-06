var socket = io();
var userId = "";
socket.emit('init', {message: 'New socket request'});
socket.emit('test', 'asdf', function(data) {
  console.log(data);
});

function login(id) {
  if (userId != "") {
    socket.emit('logout', {playerId: userId});
  }
  socket.emit('login', {playerId: id}, function(rs) {
    if (rs) {
      document.getElementById("loggedin").innerHTML = id;
      userId = id;
      connect();
    }
  });
}
