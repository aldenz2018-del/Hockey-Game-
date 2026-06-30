const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const W = canvas.width;
const H = canvas.height;

function drawRink() {
  ctx.fillStyle = "#1b3b6f";
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;

  // Center line
  ctx.beginPath();
  ctx.moveTo(W / 2, 0);
  ctx.lineTo(W / 2, H);
  ctx.stroke();

  // Center circle
  ctx.beginPath();
  ctx.arc(W / 2, H / 2, 50, 0, Math.PI * 2);
  ctx.stroke();

  // Goals
  ctx.fillStyle = "#ff4444";
  ctx.fillRect(0, H / 2 - 40, 10, 80);
  ctx.fillRect(W - 10, H / 2 - 40, 10, 80);
}
const puck = {
  x: W / 2,
  y: H / 2,
  radius: 8,
  vx: 4,
  vy: 2,
  friction: 0.99,
  bounce: 0.9,
  maxSpeed: 12
};

function updatePuck() {
  puck.x += puck.vx;
  puck.y += puck.vy;

  puck.vx *= puck.friction;
  puck.vy *= puck.friction;

  const speed = Math.sqrt(puck.vx**2 + puck.vy**2);
  if (speed > puck.maxSpeed) {
    const scale = puck.maxSpeed / speed;
    puck.vx *= scale;
    puck.vy *= scale;
  }

  // Wall collisions
  if (puck.x - puck.radius < 0 || puck.x + puck.radius > W) {
    puck.vx = -puck.vx * puck.bounce;
  }
  if (puck.y - puck.radius < 0 || puck.y + puck.radius > H) {
    puck.vy = -puck.vy * puck.bounce;
  }
}

function drawPuck() {
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(puck.x, puck.y, puck.radius, 0, Math.PI * 2);
  ctx.fill();
}
const player = {
  x: W / 4,
  y: H / 2,
  radius: 15,
  speed: 5
};

function drawPlayer() {
  ctx.fillStyle = "#00ff88";
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
  ctx.fill();
}

// Keyboard movement (PC testing)
const keys = {};
window.addEventListener("keydown", e => keys[e.key] = true);
window.addEventListener("keyup", e => keys[e.key] = false);

function updatePlayerKeyboard() {
  if (keys["w"] || keys["ArrowUp"]) player.y -= player.speed;
  if (keys["s"] || keys["ArrowDown"]) player.y += player.speed;
  if (keys["a"] || keys["ArrowLeft"]) player.x -= player.speed;
  if (keys["d"] || keys["ArrowRight"]) player.x += player.speed;
}
let touchActive = false;
let touchX = player.x;
let touchY = player.y;

function getCanvasPos(touch) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (touch.clientX - rect.left) * (canvas.width / rect.width),
    y: (touch.clientY - rect.top) * (canvas.height / rect.height)
  };
}

canvas.addEventListener("touchstart", e => {
  e.preventDefault();
  touchActive = true;
  const pos = getCanvasPos(e.touches[0]);
  touchX = pos.x;
  touchY = pos.y;
});

canvas.addEventListener("touchmove", e => {
  e.preventDefault();
  if (!touchActive) return;
  const pos = getCanvasPos(e.touches[0]);
  touchX = pos.x;
  touchY = pos.y;
});

canvas.addEventListener("touchend", e => {
  e.preventDefault();
  touchActive = false;
});

function updatePlayerTouch() {
  if (!touchActive) return;

  const dx = touchX - player.x;
  const dy = touchY - player.y;
  const dist = Math.sqrt(dx*dx + dy*dy);

  if (dist > 1) {
    const step = Math.min(player.speed, dist);
    player.x += (dx / dist) * step;
    player.y += (dy / dist) * step;
  }
}
let score = 0;

function checkGoals() {
  // Right goal
  if (puck.x + puck.radius >= W - 10 &&
      puck.y > H / 2 - 40 &&
      puck.y < H / 2 + 40) {
    score++;
    resetPuck();
  }

  // Left goal
  if (puck.x - puck.radius <= 10 &&
      puck.y > H / 2 - 40 &&
      puck.y < H / 2 + 40) {
    score--;
    resetPuck();
  }
}

function resetPuck() {
  puck.x = W / 2;
  puck.y = H / 2;
  puck.vx = (Math.random() * 4 + 2) * (Math.random() < 0.5 ? -1 : 1);
  puck.vy = (Math.random() * 4 + 2) * (Math.random() < 0.5 ? -1 : 1);
}
function gameLoop() {
  ctx.clearRect(0, 0, W, H);

  drawRink();
  updatePuck();
  drawPuck();

  updatePlayerKeyboard();
  updatePlayerTouch();
  drawPlayer();

  checkGoals();

  requestAnimationFrame(gameLoop);
}

gameLoop();
