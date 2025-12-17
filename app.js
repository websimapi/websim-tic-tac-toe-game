const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const restartBtn = document.getElementById('restartBtn');
const modeBtn = document.getElementById('modeBtn');
const overlay = document.getElementById('overlay');
const resultText = document.getElementById('resultText');
const playAgainBtn = document.getElementById('playAgainBtn');
const closeBtn = document.getElementById('closeBtn');

let board = Array(9).fill(null);
let current = 'X';
let running = true;
let singlePlayer = false;

// Winning lines
const LINES = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

// Build board cells
function createBoard(){
  boardEl.innerHTML = '';
  for(let i=0;i<9;i++){
    const cell = document.createElement('button');
    cell.className = 'cell';
    cell.setAttribute('data-i', i);
    cell.setAttribute('role','gridcell');
    cell.setAttribute('aria-label', `Cell ${i+1}`);
    cell.addEventListener('click', onCellClick);
    boardEl.appendChild(cell);
  }
}

// Update visuals
function render(){
  for(let i=0;i<9;i++){
    const el = boardEl.children[i];
    el.textContent = board[i] || '';
    el.classList.toggle('x', board[i]==='X');
    el.classList.toggle('o', board[i]==='O');
    el.disabled = !!board[i] || !running;
  }
  if(running){
    statusEl.textContent = `Player ${current}'s turn`;
  }
}

// Handle click
function onCellClick(e){
  const i = Number(e.currentTarget.dataset.i);
  if(!running || board[i]) return;
  makeMove(i, current);
  if(running && singlePlayer && current === 'O'){ // AI moves when it's O
    setTimeout(aiMove, 220);
  }
}

function makeMove(i, player){
  board[i] = player;
  checkState();
  current = current === 'X' ? 'O' : 'X';
  render();
}

// Check for win/draw
function checkState(){
  for(const line of LINES){
    const [a,b,c] = line;
    if(board[a] && board[a] === board[b] && board[a] === board[c]){
      endGame(`${board[a]} wins`, line);
      return;
    }
  }
  if(board.every(Boolean)){
    endGame('Draw');
  }
}

function endGame(message, winLine){
  running = false;
  render();
  if(winLine){
    // highlight winning cells subtly
    winLine.forEach(i => boardEl.children[i].style.boxShadow = '0 6px 18px rgba(31,143,107,0.08)');
  }
  resultText.textContent = message;
  overlay.classList.remove('hidden');
}

// Restart
function restart(){
  board = Array(9).fill(null);
  current = 'X';
  running = true;
  // clear highlights
  for(let c of boardEl.children) c.style.boxShadow = '';
  overlay.classList.add('hidden');
  render();
}

// Toggle mode
function toggleMode(){
  singlePlayer = !singlePlayer;
  modeBtn.textContent = singlePlayer ? 'Mode: 1P' : 'Mode: 2P';
  restart();
}

// Simple AI (minimax-lite): choose winning move, block, else center, else random corner/side
function aiMove(){
  if(!running) return;
  const me = 'O', opp = 'X';
  // try win
  for(let i of emptyCells()){
    const copy = board.slice(); copy[i]=me;
    if(isWin(copy, me)){ makeMove(i, me); return; }
  }
  // block
  for(let i of emptyCells()){
    const copy = board.slice(); copy[i]=opp;
    if(isWin(copy, opp)){ makeMove(i, me); return; }
  }
  // center
  if(board[4]===null){ makeMove(4, me); return; }
  // corners
  const corners = [0,2,6,8].filter(i=>board[i]===null);
  if(corners.length){ makeMove(randomChoice(corners), me); return; }
  // sides
  const sides = [1,3,5,7].filter(i=>board[i]===null);
  if(sides.length){ makeMove(randomChoice(sides), me); return; }
}

function emptyCells(){ return board.map((v,i)=>v===null?i:null).filter(v=>v!==null); }
function isWin(b, player){
  return LINES.some(([a,b1,c])=> b[a]===player && b[b1]===player && b[c]===player);
}
function randomChoice(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

// Event wiring
restartBtn.addEventListener('click', restart);
modeBtn.addEventListener('click', toggleMode);
playAgainBtn.addEventListener('click', ()=>{ restart(); overlay.classList.add('hidden'); });
closeBtn.addEventListener('click', ()=> overlay.classList.add('hidden'));

// Keyboard accessibility: number keys 1-9 map to cells
window.addEventListener('keydown', (e)=>{
  if(!running) return;
  if(e.key >= '1' && e.key <= '9'){
    const idx = Number(e.key)-1;
    const target = boardEl.children[idx];
    if(target) target.click();
  }
  if(e.key === 'r' || e.key === 'R') restart();
  if(e.key === 'm' || e.key === 'M') toggleMode();
});

// Initialize
createBoard();
render();

