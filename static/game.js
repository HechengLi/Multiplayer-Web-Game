var canvas = document.getElementById('canvas');
canvas.width = 800;
canvas.height = 600;
canvas.oncontextmenu = function (e) {
    e.preventDefault();
};
var wrapper = (document.getElementsByClassName('wrapper'))[0];

var movement = {
  up: false,
  down: false,
  left: false,
  right: false
}

document.addEventListener('keydown', function(event) {
  switch (event.keyCode) {
    case 65: // A
      movement.left = true;
      break;
    case 87: // W
      movement.up = true;
      break;
    case 68: // D
      movement.right = true;
      break;
    case 83: // S
      movement.down = true;
      break;
  }
});

document.addEventListener('keyup', function(event) {
  switch (event.keyCode) {
    case 65: // A
      movement.left = false;
      break;
    case 87: // W
      movement.up = false;
      break;
    case 68: // D
      movement.right = false;
      break;
    case 83: // S
      movement.down = false;
      break;
  }
});

var context = canvas.getContext('2d');
socket.on('state', function(players) {
  context.clearRect(0, 0, 800, 600);
  for (var id in players) {
    var player = players[id];
    context.fillStyle = player.color;
    context.beginPath();
    context.arc(player.x, player.y, 7, 0, 2 * Math.PI);
    context.fill();
    if (player.status == 'attack') {
      context.strokeStyle = player.color
      context.lineWidth = 2;
      context.beginPath();
      context.arc(player.x, player.y, 13, 0, 2 * Math.PI);
      context.stroke();
    } else if (player.status == 'shoot') {
      context.beginPath();
      context.moveTo(player.x, player.y);
      context.lineTo(player.clickX, player.clickY);
      context.stroke();
    }
  }
});

function connect() {
  // setup movement signal
  setInterval(function() {
    movement["id"] = userId;
    socket.emit('movement', movement);
  }, 1000 / 60);

  // setup attack signal
  canvas.addEventListener('mousedown', function(event) {
    var x = event.pageX - wrapper.offsetLeft;
    var y = event.pageY - wrapper.offsetTop;
    console.log(event.which);
    switch (event.which) {
      case 1: // left click
        socket.emit('attack', userId, {x: x, y: y});
        break;
      case 3: // right click
        socket.emit('shoot', userId, {x: x, y: y});
        break;
    }
  });
}
