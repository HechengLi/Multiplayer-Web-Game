var mInterval = null;
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

// hex to rgb function
function hexToRGBA(hex, alpha) {
    var r = parseInt(hex.slice(1, 3), 16),
        g = parseInt(hex.slice(3, 5), 16),
        b = parseInt(hex.slice(5, 7), 16);
    return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
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
socket.on('state', function(players, projectiles) {
  context.clearRect(0, 0, 800, 600);
  for (var id in players) {
    var player = players[id];
    if (player.status == 'attack') {
      context.strokeStyle = player.color;
      context.lineWidth = 20;
      context.beginPath();

      var x = player.clickX - player.pClickX;
      var y = player.pClickY - player.clickY;
      var h = 0;
      var arcstart = 0;
      if ((x > 0)&&(y < 0)) {
        h = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
        arcstart = Math.acos(x/h);
      } else if ((x < 0)&&(y < 0)) {
        h = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
        arcstart = Math.acos(x/h);
      } else if ((x < 0)&&(y > 0)) {
        h = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
        arcstart = Math.PI * 2 - Math.acos(x/h);
      } else if ((x > 0)&&(y > 0)) {
        h = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
        arcstart = Math.PI * 2 - Math.acos(x/h);
      }
      for (var i = player.attackDuration; i >= 0; i-=5) {
        context.strokeStyle = hexToRGBA(player.color, 0.1);
        context.arc(player.x, player.y, 22, arcstart-1+2*i/100, arcstart-1+2*(i+5)/100);
        context.stroke();
      }
      //context.arc(player.x, player.y, 22, arcstart-1, arcstart-1+2*player.attackDuration/100);
      //context.stroke();
    }
  }
  for (var id in players) {
    var player = players[id];
    if (player.curHP > 0) {
      context.fillStyle = player.color;
    } else {
      context.fillStyle = hexToRGBA(player.color, 0.2);
    }
    context.beginPath();
    context.arc(player.x, player.y, 7, 0, 2 * Math.PI);
    context.fill();

    context.beginPath();
    context.strokeStyle = "#ff0000";
    context.moveTo(player.x-10, player.y-15);
    context.lineWidth = 5;
    context.lineTo(player.x+10, player.y-15);
    context.stroke();

    context.beginPath();
    context.strokeStyle = "#660000";
    context.moveTo(player.x+10, player.y-15);
    context.lineTo(player.x+10-20*(1-player.curHP/player.maxHP), player.y-15);
    context.stroke();
  }

  for (var projectile in projectiles) {
    context.beginPath();
    context.strokeStyle = players[projectiles[projectile].owner].color;
    context.lineWidth = 5;
    context.moveTo(projectiles[projectile].x, projectiles[projectile].y);
    context.lineTo(projectiles[projectile].x - 10*projectiles[projectile].dirX,
                   projectiles[projectile].y - 10*projectiles[projectile].dirY);
    context.stroke();
  }
});

function connect() {
  // setup movement signal
  mInterval = setInterval(function() {
    if (userId != "") {
      movement["id"] = userId;
      socket.emit('movement', movement);
    }
  }, 1000 / 60);

  // setup attack signal
  canvas.addEventListener('mousedown', function(event) {
    if (userId != "") {
      var x = event.pageX - wrapper.offsetLeft;
      var y = event.pageY - wrapper.offsetTop;
      switch (event.which) {
        case 1: // left click
          socket.emit('attack', userId, {x: x, y: y});
          break;
        case 3: // right click
          socket.emit('shoot', userId, {x: x, y: y});
          break;
      }
    }
  });
}
