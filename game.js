window.CLONE_WARS_GAME = true;

const DEFAULTS = { title: 'Flap Clone', fix: 'none', canvasWidth: 360, canvasHeight: 640, gravity: 1400, flapStrength: 420, birdSize: 34, pipeWidth: 64, pipeGap: 150, pipeSpacing: 260, pipeSpeed: 150, groundHeight: 80, modes: { easy: { pipeGap: 190, pipeSpeed: 110 }, normal: { pipeGap: 150, pipeSpeed: 150 } } };
const CONFIG = Object.assign({}, DEFAULTS, window.GAME_CONFIG || {});
const ART_NAMES = ['drawBackground', 'drawGround', 'drawBird', 'drawPipe'];
const SOUND_NAMES = ['flap', 'score', 'crash'];
const missing = [];
if (!window.GAME_CONFIG) missing.push('settings');
else for (const key of Object.keys(DEFAULTS)) { if (!(key in window.GAME_CONFIG)) missing.push(key); }
if (!window.SPRITES) missing.push('art');
else for (const name of ART_NAMES) { if (typeof window.SPRITES[name] !== 'function') missing.push(name); }
if (!window.SOUNDS) missing.push('sound');
else for (const name of SOUND_NAMES) { if (typeof window.SOUNDS[name] !== 'function') missing.push(name); }
document.getElementById('missing-label').textContent = missing.length ? 'placeholder: ' + missing.join(', ') + ' missing' : '';

function placeholderBackground(ctx, width, height, time) { ctx.save(); ctx.fillStyle = '#8ed8ff'; ctx.fillRect(0, 0, width, height); ctx.restore(); }
function placeholderGround(ctx, width, height, groundHeight, offset) { ctx.save(); ctx.fillStyle = '#70b34c'; ctx.fillRect(0, height - groundHeight, width, groundHeight); ctx.restore(); }
function placeholderBird(ctx, x, y, size, velocity) { ctx.save(); ctx.fillStyle = '#f5cf42'; ctx.fillRect(x - size / 2, y - size / 2, size, size); ctx.restore(); }
function placeholderPipe(ctx, x, gapTop, gapBottom, pipeWidth, height) { ctx.save(); ctx.fillStyle = '#4e9b54'; ctx.fillRect(x, 0, pipeWidth, gapTop); ctx.fillRect(x, gapBottom, pipeWidth, height - gapBottom); ctx.restore(); }
const drawBackground = (window.SPRITES && typeof window.SPRITES.drawBackground === 'function') ? window.SPRITES.drawBackground : placeholderBackground;
const drawGround = (window.SPRITES && typeof window.SPRITES.drawGround === 'function') ? window.SPRITES.drawGround : placeholderGround;
const drawBird = (window.SPRITES && typeof window.SPRITES.drawBird === 'function') ? window.SPRITES.drawBird : placeholderBird;
const drawPipe = (window.SPRITES && typeof window.SPRITES.drawPipe === 'function') ? window.SPRITES.drawPipe : placeholderPipe;
let muted = false;
function play(name) {
  if (muted) return;
  const sound = window.SOUNDS && window.SOUNDS[name];
  if (typeof sound === 'function') { try { sound(); } catch (error) {} }
}

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = CONFIG.canvasWidth;
canvas.height = CONFIG.canvasHeight;
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayText = document.getElementById('overlay-text');
const fixButtons = document.getElementById('fix-buttons');
const sr = document.getElementById('sr');

let state = 'ready', y = CONFIG.canvasHeight / 2, velocity = 0, pipes = [], pipesMade = 0, groundOffset = 0, lastGapTop = 205, score = 0, bestScore = 0, secondsSinceCrash = 0, checkpoint = 0, currentMode = 'normal', lastTime = 0, tapCount = 0, hatBirds = [];
try { bestScore = parseInt(localStorage.getItem('cloneWarsBest'), 10) || 0; } catch (error) {}

function showReady() { overlay.hidden = false; overlayTitle.textContent = CONFIG.title; overlayText.textContent = 'Press Space, click or tap to start.\nPress M to turn sound ' + (muted ? 'on.' : 'off.'); }
function showGameOver() { overlay.hidden = false; overlayTitle.textContent = 'Game over'; const lines = ['Score ' + score + '   ·   Best ' + bestScore, 'Press Space, click or tap to play again.', 'Press M to turn sound ' + (muted ? 'on.' : 'off.')]; if (checkpoint > 0) lines.push('Next game starts at checkpoint ' + checkpoint + '.'); overlayText.textContent = lines.join('\n'); }
function startGame() { state = 'playing'; y = (CONFIG.canvasHeight - CONFIG.groundHeight) / 2; velocity = -CONFIG.flapStrength; pipes = []; pipesMade = 0; groundOffset = 0; lastGapTop = (CONFIG.canvasHeight - CONFIG.groundHeight - CONFIG.pipeGap) / 2; score = checkpoint; secondsSinceCrash = 0; tapCount = 0; hatBirds = []; overlay.hidden = true; play('flap'); }
function press() { if (state === 'ready') startGame(); else if (state === 'playing') { velocity = -CONFIG.flapStrength; tapCount += 1; if (tapCount % 3 === 0) hatBirds.push({ hat: hatBirds.length % 4, y: y }); play('flap'); } else if (state === 'gameover' && secondsSinceCrash >= 0.4) startGame(); }
window.addEventListener('keydown', (event) => { if (event.target && event.target.closest && event.target.closest('button')) return; if (event.code === 'Space' || event.code === 'Enter') { event.preventDefault(); press(); } else if (event.code === 'KeyM') { muted = !muted; if (state === 'ready') showReady(); if (state === 'gameover') showGameOver(); } });
window.addEventListener('pointerdown', (event) => { if (event.target && event.target.closest && event.target.closest('button')) return; press(); });

if (CONFIG.fix === 'easy-mode') { for (const mode of ['easy', 'normal']) { const button = document.createElement('button'); button.type = 'button'; button.textContent = mode === 'easy' ? 'Easy' : 'Normal'; button.setAttribute('aria-pressed', String(mode === currentMode)); button.addEventListener('click', (event) => { currentMode = mode; for (const other of fixButtons.querySelectorAll('button')) { other.setAttribute('aria-pressed', String(other === event.currentTarget)); } event.currentTarget.blur(); }); fixButtons.appendChild(button); } }

function addPipe(pipeGap) { const gap = pipeGap + (CONFIG.fix === 'gentle-start' && pipesMade < 3 ? 70 : 0); const lowest = CONFIG.canvasHeight - CONFIG.groundHeight - 60 - gap; const gapTop = Math.max(60, Math.min(lowest, lastGapTop + (Math.random() * 360 - 180))); const gapBottom = gapTop + gap; lastGapTop = gapTop; pipes.push({ x: CONFIG.canvasWidth, gapTop: gapTop, gapBottom: gapBottom, scored: false }); pipesMade += 1; }
function crash() { state = 'gameover'; secondsSinceCrash = 0; play('crash'); if (score > bestScore) bestScore = score; try { localStorage.setItem('cloneWarsBest', String(bestScore)); } catch (error) {} checkpoint = CONFIG.fix === 'checkpoints' ? Math.floor(score / 10) * 10 : 0; sr.textContent = 'Game over. Score ' + score + '. Best ' + bestScore + '.'; showGameOver(); }
function drawHat(x, y, size, hat) { const colors = ['#ef476f', '#06d6a0', '#118ab2', '#f4a261']; ctx.save(); ctx.fillStyle = colors[hat % colors.length]; ctx.strokeStyle = '#263238'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - size * 0.32, y - size * 0.28); ctx.lineTo(x + size * 0.32, y - size * 0.28); ctx.lineTo(x + size * 0.2, y - size * 0.62); ctx.lineTo(x - size * 0.18, y - size * 0.62); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.ellipse(x, y - size * 0.26, size * 0.45, size * 0.12, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.restore(); }
function frame(time) { const seconds = lastTime ? Math.min(0.05, (time - lastTime) / 1000) : 0; lastTime = time; const birdX = CONFIG.canvasWidth / 4; const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches; if (state === 'playing') { const mode = CONFIG.fix === 'easy-mode' ? CONFIG.modes[currentMode] : CONFIG; const pipeGap = mode.pipeGap; const pipeSpeed = mode.pipeSpeed * (CONFIG.fix === 'gentle-start' && score < 3 ? 0.75 : 1); velocity += CONFIG.gravity * seconds; y += velocity * seconds; groundOffset += pipeSpeed * seconds; for (let index = 0; index < hatBirds.length; index += 1) { const companion = hatBirds[index]; const row = Math.ceil((index - 1) / 2); const paradeOffset = index < 2 ? 0 : (index % 2 === 0 ? -34 : 34) * row; companion.y += (y + paradeOffset - companion.y) * Math.min(1, seconds * 8); } if (pipes.length === 0) addPipe(pipeGap); else if (pipes[pipes.length - 1].x <= CONFIG.canvasWidth - CONFIG.pipeSpacing) addPipe(pipeGap); for (const pipe of pipes) { pipe.x -= pipeSpeed * seconds; if (!pipe.scored && pipe.x + CONFIG.pipeWidth < birdX) { pipe.scored = true; score += 1; play('score'); } } pipes = pipes.filter((pipe) => pipe.x + CONFIG.pipeWidth > 0); const half = CONFIG.birdSize / 2; if (y + half >= CONFIG.canvasHeight - CONFIG.groundHeight || y - half <= 0 || pipes.some((pipe) => birdX + half > pipe.x && birdX - half < pipe.x + CONFIG.pipeWidth && (y - half < pipe.gapTop || y + half > pipe.gapBottom))) crash(); } else if (state === 'gameover') secondsSinceCrash += seconds; ctx.clearRect(0, 0, canvas.width, canvas.height); drawBackground(ctx, CONFIG.canvasWidth, CONFIG.canvasHeight, reduceMotion ? 0 : time / 1000); for (const pipe of pipes) drawPipe(ctx, pipe.x, pipe.gapTop, pipe.gapBottom, CONFIG.pipeWidth, CONFIG.canvasHeight - CONFIG.groundHeight); drawGround(ctx, CONFIG.canvasWidth, CONFIG.canvasHeight, CONFIG.groundHeight, groundOffset); drawBird(ctx, birdX, y, CONFIG.birdSize, velocity); for (let index = 0; index < hatBirds.length; index += 1) { const companion = hatBirds[index]; const companionX = Math.max(18, birdX - 24 * (index + 1)); drawBird(ctx, companionX, companion.y, CONFIG.birdSize, velocity); drawHat(companionX, companion.y, CONFIG.birdSize, companion.hat); } if (state === 'playing') { ctx.save(); ctx.font = 'bold 42px sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 5; ctx.strokeStyle = '#263238'; ctx.fillStyle = '#fff'; ctx.strokeText(String(score), CONFIG.canvasWidth / 2, 58); ctx.fillText(String(score), CONFIG.canvasWidth / 2, 58); ctx.restore(); } requestAnimationFrame(frame); }

showReady();
requestAnimationFrame(frame);
