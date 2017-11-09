var socket = io();
var userId = "";
socket.emit('init', {message: 'New socket request'});

function login(id) {
  if (userId != "") {
    socket.emit('logout', {playerId: userId});
    document.getElementById("loggedin").innerHTML = "logged out";
    userId = "";
  }
  socket.emit('login', {playerId: id}, function(rs) {
    if (rs) {
      document.getElementById("loggedin").innerHTML = "logged in as " + id;
      userId = id;
      if (mInterval == null) { connect(); }
    } else {
      document.getElementById("loggedin").innerHTML = "login failed";
    }
  });
}
