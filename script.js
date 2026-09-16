const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const playerScoreElement = document.getElementById('player-score');
const computerScoreElement = document.getElementById('computer-score');
const messageElement = document.getElementById('message');
const restartButton = document.getElementById('restart-button');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const PADDLE_WIDTH = 14;
const PADDLE_HEIGHT = 92;
const PADDLE_SPEED = 7;
const BALL_SIZE = 12;
const WINNING_SCORE = 7;

const player = { x: 28, y: HEIGHT / 2 - PADDLE_HEIGHT / 2, score: 0 };
const computer = { x: WIDTH - 42, y: HEIGHT / 2 - PADDLE_HEIGHT / 2, score: 0 };
const ball = { x: WIDTH / 2, y: HEIGHT / 2, vx: 5, vy: 2.5 };
const keys = new Set();
let gameOver = false;
let animationFrame;

function resetBall(direction = 1) {
  ball.x = WIDTH / 2;
  ball.y = HEIGHT / 2;
  const angle = (Math.random() * 0.9 - 0.45);
  ball.vx = 5 * direction;
  ball.vy = 5 * angle;
}

function resetGame() {
  player.score = 0;
  computer.score = 0;
  player.y = computer.y = HEIGHT / 2 - PADDLE_HEIGHT / 2;
  gameOver = false;
  messageElement.hidden = true;
  updateScore();
  resetBall(Math.random() > 0.5 ? 1 : -1);
}

function updateScore() {
  playerScoreElement.textContent = player.score;
  computerScoreElement.textContent = computer.score;
}

function movePlayer() {
  if (keys.has('ArrowUp')) player.y -= PADDLE_SPEED;
  if (keys.has('ArrowDown')) player.y += PADDLE_SPEED;
  player.y = Math.max(0, Math.min(HEIGHT - PADDLE_HEIGHT, player.y));
}

function moveComputer() {
  // The computer follows the ball with a small speed limit for a winnable game.
  const target = ball.y - PADDLE_HEIGHT / 2;
  const difference = target - computer.y;
  computer.y += Math.sign(difference) * Math.min(Math.abs(difference), 4.2);
  computer.y = Math.max(0, Math.min(HEIGHT - PADDLE_HEIGHT, computer.y));
}

function intersects(paddle) {
  return ball.x - BALL_SIZE / 2 < paddle.x + PADDLE_WIDTH &&
    ball.x + BALL_SIZE / 2 > paddle.x &&
    ball.y - BALL_SIZE / 2 < paddle.y + PADDLE_HEIGHT &&
    ball.y + BALL_SIZE / 2 > paddle.y;
}

function bounceFromPaddle(paddle, direction) {
  const relativeHit = (ball.y - (paddle.y + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2);
  ball.vx = Math.abs(ball.vx) * direction;
  ball.vy = relativeHit * 6;
  // Prevent the ball from becoming stuck at a shallow angle.
  if (Math.abs(ball.vy) < 1) ball.vy = ball.vy < 0 ? -1 : 1;
}

function update() {
  if (gameOver) return;
  movePlayer();
  moveComputer();
  ball.x += ball.vx;
  ball.y += ball.vy;

  if (ball.y - BALL_SIZE / 2 <= 0 || ball.y + BALL_SIZE / 2 >= HEIGHT) {
    ball.vy *= -1;
    ball.y = Math.max(BALL_SIZE / 2, Math.min(HEIGHT - BALL_SIZE / 2, ball.y));
  }
  if (intersects(player) && ball.vx < 0) {
    ball.x = player.x + PADDLE_WIDTH + BALL_SIZE / 2;
    bounceFromPaddle(player, 1);
  }
  if (intersects(computer) && ball.vx > 0) {
    ball.x = computer.x - BALL_SIZE / 2;
    bounceFromPaddle(computer, -1);
  }
  if (ball.x < -BALL_SIZE) {
    computer.score++;
    finishPoint('computer');
  } else if (ball.x > WIDTH + BALL_SIZE) {
    player.score++;
    finishPoint('player');
  }
}

function finishPoint(winner) {
  updateScore();
  if (player.score >= WINNING_SCORE || computer.score >= WINNING_SCORE) {
    gameOver = true;
    messageElement.textContent = `${winner === 'player' ? 'You win!' : 'Computer wins!'} Press restart`;
    messageElement.hidden = false;
  } else {
    resetBall(winner === 'player' ? 1 : -1);
  }
}

function draw() {
  ctx.fillStyle = '#081525';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.strokeStyle = '#28405b';
  ctx.setLineDash([10, 14]);
  ctx.beginPath();
  ctx.moveTo(WIDTH / 2, 0);
  ctx.lineTo(WIDTH / 2, HEIGHT);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#f0f6ff';
  ctx.fillRect(player.x, player.y, PADDLE_WIDTH, PADDLE_HEIGHT);
  ctx.fillRect(computer.x, computer.y, PADDLE_WIDTH, PADDLE_HEIGHT);
  ctx.fillStyle = '#5de2c2';
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, BALL_SIZE / 2, 0, Math.PI * 2);
  ctx.fill();
}

function loop() {
  update();
  draw();
  animationFrame = requestAnimationFrame(loop);
}

canvas.addEventListener('mousemove', (event) => {
  const bounds = canvas.getBoundingClientRect();
  player.y = ((event.clientY - bounds.top) / bounds.height) * HEIGHT - PADDLE_HEIGHT / 2;
  player.y = Math.max(0, Math.min(HEIGHT - PADDLE_HEIGHT, player.y));
});
window.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
    event.preventDefault();
    keys.add(event.key);
  }
});
window.addEventListener('keyup', (event) => keys.delete(event.key));
restartButton.addEventListener('click', resetGame);

resetGame();
loop();
