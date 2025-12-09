let defaultSheet, walkSheet, runSheet, slowSheet;
let defaultFrameCount = 11;
let defaultFrameWidth = 391 / 11;
let defaultFrameHeight = 39;
let walkFrameCount = 12;
let walkFrameWidth = 499 / 12;
let walkFrameHeight = 38;
let runFrameCount = 22;
let runFrameWidth = 961 / 23;
let runFrameHeight = 37;
let slowFrameCount = 15;
let slowFrameWidth = 625 / 15;
let slowFrameHeight = 36;

let currentFrame = 0;
let charX;
let moveSpeed = 8;
let runSpeed = 16;
let currentSpeed = moveSpeed;
let isRunning = false;
let isWalking = false;
let isFlipped = false;

let sonicScale = 2.0;

// Chun-Li
let chunliDefaultSheet, chunliStartSheet, chunliHitSheet;
let chunliX, chunliY;
let chunliFrame = 0;
let chunliFacing = 1;
let chunliState = 'idle';

const CHUNLI = {
  idle:  { c: 8,  w: 87,  h: 190 },
  start: { c: 18, w: Math.round(2443/18), h: 171 },
  hit:   { c: 10, w: 1615/10, h: 176 }
};

// 對話
let dialogueState = 0;
let dialogueTimer = 0;
let greetTimer = 0;
let showChunliDialogue = false;
let showSonicDialogue = false;
let inputActive = false;
let dialogueText = '';
let playerName = '';

function preload() {
  defaultSheet = loadImage('sonic/default.png');
  walkSheet = loadImage('sonic/walk.png');
  runSheet = loadImage('sonic/run.png');
  slowSheet = loadImage('sonic/slow.png');

  chunliDefaultSheet = loadImage('chunli/idle_8.png');
  chunliStartSheet   = loadImage('chunli/start_18.png');
  chunliHitSheet     = loadImage('chunli/hit_10.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(15);
  charX = width / 2;
  chunliX = width * 0.75;
}

function draw() {
  background('#006000');
  chunliY = height / 2;

  /* ===== 距離 ===== */
  let dx = charX - chunliX;
  let dist = abs(dx);
  chunliFacing = dx >= 0 ? 1 : -1;

  /* ===== Chun-Li 狀態 ===== */
  if (dist < 60) {
    chunliState = 'hit';
  } else if (dist < 180) {
    chunliState = 'start';
  } else {
    chunliState = 'idle';
    dialogueState = 0;
    showChunliDialogue = false;
    showSonicDialogue = false;
    inputActive = false;
  }

  /* ===== 對話 ===== */
  if (chunliState === 'start' && dialogueState === 0 && !isWalking && !isRunning) {
    dialogueState = 1;
    showChunliDialogue = true;
    dialogueText = '你是誰？';
    dialogueTimer = frameCount;
  }

  if (dialogueState === 1 && frameCount - dialogueTimer > 30) {
    dialogueState = 2;
    showChunliDialogue = false;
    showSonicDialogue = true;
    inputActive = true;
  }

  if (dialogueState === 3 && frameCount - greetTimer > 60) {
    dialogueState = 0;
    showChunliDialogue = false;
  }

  /* ===== Chun-Li 畫面 ===== */
  let c = CHUNLI[chunliState];
  let cSheet = chunliState === 'hit'
    ? chunliHitSheet
    : chunliState === 'start'
      ? chunliStartSheet
      : chunliDefaultSheet;

  let cx = chunliX - c.w / 2;
  let cy = chunliY - c.h / 2;

  push();
  if (chunliFacing === -1) {
    translate(cx + c.w, cy);
    scale(-1, 1);
    image(cSheet, 0, 0, c.w, c.h,
      chunliFrame * c.w, 0, c.w, c.h);
  } else {
    image(cSheet, cx, cy, c.w, c.h,
      chunliFrame * c.w, 0, c.w, c.h);
  }
  pop();

  chunliFrame = (chunliFrame + 1) % c.c;

  /* ===== Sonic 移動 ===== */
  let dir = 0;
  if (keyIsDown(LEFT_ARROW)) {
    dir = -1; isFlipped = true; isWalking = true;
  } else if (keyIsDown(RIGHT_ARROW)) {
    dir = 1; isFlipped = false; isWalking = true;
  } else {
    isWalking = false;
  }

  currentSpeed = isRunning ? runSpeed : moveSpeed;
  charX += dir * currentSpeed;
  charX = constrain(charX, 0, width);

  /* ===== Sonic 動畫選擇 ===== */
  let sSheet, sFW, sFH, sCount;

  if (isRunning && dir !== 0) {
    sSheet = runSheet;
    sFW = runFrameWidth;
    sFH = runFrameHeight;
    sCount = runFrameCount;
  } else if (isWalking) {
    sSheet = walkSheet;
    sFW = walkFrameWidth;
    sFH = walkFrameHeight;
    sCount = walkFrameCount;
  } else {
    sSheet = defaultSheet;
    sFW = defaultFrameWidth;
    sFH = defaultFrameHeight;
    sCount = defaultFrameCount;
  }

  let sFrame = currentFrame % sCount;
  currentFrame = (currentFrame + 1) % sCount;

  /* ===== 畫 Sonic ===== */
  let drawW = sFW * sonicScale;
  let drawH = sFH * sonicScale;

  push();
  translate(charX, height / 2 - drawH / 2);
  if (isFlipped) scale(-1, 1);
  image(
    sSheet,
    isFlipped ? -drawW : 0, 0,
    drawW, drawH,
    sFrame * sFW, 0,
    sFW, sFH
  );
  pop();

  /* ===== 對話框 ===== */
  if (showChunliDialogue) {
    fill(255);
    rect(chunliX - 80, chunliY - 180, 160, 50, 10);
    fill(0);
    textAlign(CENTER, CENTER);
    text(dialogueText, chunliX, chunliY - 155);
  }

  if (showSonicDialogue) {
    fill(255);
    rect(charX - 80, height/2 - 100, 160, 50, 10);
    fill(0);
    text(playerName || '輸入姓名...', charX, height/2 - 75);
  }
}

function keyPressed() {
  if (key === 'Shift') isRunning = true;
  if (keyCode === ENTER && inputActive && playerName.trim()) {
    dialogueState = 3;
    showChunliDialogue = true;
    dialogueText = `你好，${playerName}`;
    showSonicDialogue = false;
    inputActive = false;
    greetTimer = frameCount;
  }
}

function keyReleased() {
  if (key === 'Shift') isRunning = false;
}

function keyTyped() {
  if (inputActive && key !== 'Enter') playerName += key;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  chunliX = width * 0.75;
}
