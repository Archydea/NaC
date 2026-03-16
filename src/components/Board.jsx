import { useState, useEffect, useRef } from 'react';
import Cell from './Cell';
import { useStats } from '../contexts/StatsContext';

// ─── Game logic ───────────────────────────────────────────────────────────────

function createBoard(size) {
  return Array.from({ length: size }, () => Array(size).fill(null));
}

function checkWinner(board, size) {
  for (let r = 0; r < size; r++) {
    const first = board[r][0];
    if (first && board[r].every((c) => c === first))
      return { winner: first, line: board[r].map((_, c) => r * size + c) };
  }
  for (let c = 0; c < size; c++) {
    const first = board[0][c];
    if (first && board.every((row) => row[c] === first))
      return { winner: first, line: board.map((_, r) => r * size + c) };
  }
  const d1 = board[0][0];
  if (d1 && board.every((row, i) => row[i] === d1))
    return { winner: d1, line: board.map((_, i) => i * size + i) };
  const d2 = board[0][size - 1];
  if (d2 && board.every((row, i) => row[size - 1 - i] === d2))
    return { winner: d2, line: board.map((_, i) => i * size + (size - 1 - i)) };
  if (board.every((row) => row.every((c) => c !== null)))
    return { winner: 'draw', line: [] };
  return null;
}

// ─── AI logic ─────────────────────────────────────────────────────────────────

function getEmptyCells(board, size) {
  const cells = [];
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++)
      if (!board[r][c]) cells.push([r, c]);
  return cells;
}

function getRandomMove(board, size) {
  const empty = getEmptyCells(board, size);
  if (!empty.length) return null;
  return empty[Math.floor(Math.random() * empty.length)];
}

// Minimax with alpha-beta pruning — only used for 3×3
function minimax(board, size, isMaximizing, alpha, beta, depth) {
  const res = checkWinner(board, size);
  if (res) {
    if (res.winner === 'O') return 10 - depth;
    if (res.winner === 'X') return depth - 10;
    return 0;
  }
  const empty = getEmptyCells(board, size);
  if (!empty.length) return 0;

  if (isMaximizing) {
    let best = -Infinity;
    for (const [r, c] of empty) {
      board[r][c] = 'O';
      best = Math.max(best, minimax(board, size, false, alpha, beta, depth + 1));
      board[r][c] = null;
      alpha = Math.max(alpha, best);
      if (beta <= alpha) break;
    }
    return best;
  } else {
    let best = Infinity;
    for (const [r, c] of empty) {
      board[r][c] = 'X';
      best = Math.min(best, minimax(board, size, true, alpha, beta, depth + 1));
      board[r][c] = null;
      beta = Math.min(beta, best);
      if (beta <= alpha) break;
    }
    return best;
  }
}

// Heuristic move for 4×4 / 5×5 (win → block → center → corner → random)
function getHeuristicMove(board, size) {
  const empty = getEmptyCells(board, size);
  for (const [r, c] of empty) {
    board[r][c] = 'O';
    const win = checkWinner(board, size);
    board[r][c] = null;
    if (win?.winner === 'O') return [r, c];
  }
  for (const [r, c] of empty) {
    board[r][c] = 'X';
    const win = checkWinner(board, size);
    board[r][c] = null;
    if (win?.winner === 'X') return [r, c];
  }
  const mid = Math.floor(size / 2);
  if (!board[mid][mid]) return [mid, mid];
  const corners = [[0, 0], [0, size - 1], [size - 1, 0], [size - 1, size - 1]];
  const freeCorners = corners.filter(([r, c]) => !board[r][c]);
  if (freeCorners.length) return freeCorners[Math.floor(Math.random() * freeCorners.length)];
  return getRandomMove(board, size);
}

function getAIMove(board, size, difficulty) {
  if (difficulty === 'easy') return getRandomMove(board, size);
  if (size === 3) {
    let bestScore = -Infinity;
    let bestMove = null;
    const boardCopy = board.map((r) => [...r]);
    for (const [r, c] of getEmptyCells(boardCopy, size)) {
      boardCopy[r][c] = 'O';
      const score = minimax(boardCopy, size, false, -Infinity, Infinity, 0);
      boardCopy[r][c] = null;
      if (score > bestScore) { bestScore = score; bestMove = [r, c]; }
    }
    return bestMove;
  }
  return getHeuristicMove(board.map((r) => [...r]), size);
}

// ─── Sound engine (Web Audio API) ─────────────────────────────────────────────

function playClickSound(ctx) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(520, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(380, ctx.currentTime + 0.07);
  gain.gain.setValueAtTime(0.07, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.09);
}

function playWinSound(ctx) {
  [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'triangle';
    osc.frequency.value = freq;
    const t = ctx.currentTime + i * 0.11;
    gain.gain.setValueAtTime(0.13, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    osc.start(t);
    osc.stop(t + 0.22);
  });
}

function playDrawSound(ctx) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(320, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.35);
  gain.gain.setValueAtTime(0.07, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.38);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.38);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Board() {
  const [size, setSize] = useState(3);
  const [board, setBoard] = useState(() => createBoard(3));
  const [isXTurn, setIsXTurn] = useState(true);
  const [result, setResult] = useState(null);
  const [gameMode, setGameMode] = useState('2p');
  const [difficulty, setDifficulty] = useState('hard');
  const [history, setHistory] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isAIThinking, setIsAIThinking] = useState(false);

  const audioCtxRef = useRef(null);
  const soundEnabledRef = useRef(soundEnabled);
  soundEnabledRef.current = soundEnabled;

  const { stats, updateStats, resetStats } = useStats();

  function getAudioCtx() {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
    return audioCtxRef.current;
  }

  function playSound(type) {
    if (!soundEnabledRef.current) return;
    try {
      const ctx = getAudioCtx();
      if (type === 'click') playClickSound(ctx);
      else if (type === 'win') playWinSound(ctx);
      else if (type === 'draw') playDrawSound(ctx);
    } catch {
      // ignore audio errors silently
    }
  }

  // AI move effect
  useEffect(() => {
    if (gameMode !== 'ai' || isXTurn || result) return;

    setIsAIThinking(true);
    let cancelled = false;
    const delay = difficulty === 'easy' ? 420 : 650;

    const timer = setTimeout(() => {
      if (cancelled) return;
      const move = getAIMove(board, size, difficulty);
      if (!move || cancelled) { setIsAIThinking(false); return; }

      const [r, c] = move;
      const newBoard = board.map((row) => [...row]);
      newBoard[r][c] = 'O';
      const gameResult = checkWinner(newBoard, size);

      setBoard(newBoard);
      setHistory((prev) => [...prev, { player: 'O', row: r, col: c, num: prev.length + 1 }]);
      setIsAIThinking(false);

      if (gameResult) {
        setResult(gameResult);
        updateStats(gameResult.winner);
        playSound(gameResult.winner === 'draw' ? 'draw' : 'win');
      } else {
        setIsXTurn(true);
      }
    }, delay);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isXTurn, gameMode, result, board, size, difficulty]);

  function handleClick(row, col) {
    if (result || board[row][col] || isAIThinking) return;
    if (gameMode === 'ai' && !isXTurn) return;

    playSound('click');

    const player = isXTurn ? 'X' : 'O';
    const newBoard = board.map((r) => [...r]);
    newBoard[row][col] = player;
    const gameResult = checkWinner(newBoard, size);

    setBoard(newBoard);
    setHistory((prev) => [...prev, { player, row, col, num: prev.length + 1 }]);

    if (gameResult) {
      setResult(gameResult);
      updateStats(gameResult.winner);
      playSound(gameResult.winner === 'draw' ? 'draw' : 'win');
    } else {
      setIsXTurn(!isXTurn);
    }
  }

  function newGame() {
    setBoard(createBoard(size));
    setIsXTurn(true);
    setResult(null);
    setHistory([]);
    setIsAIThinking(false);
  }

  function changeSize(newSize) {
    setSize(newSize);
    setBoard(createBoard(newSize));
    setIsXTurn(true);
    setResult(null);
    setHistory([]);
    setIsAIThinking(false);
  }

  function changeMode(mode) {
    setGameMode(mode);
    setBoard(createBoard(size));
    setIsXTurn(true);
    setResult(null);
    setHistory([]);
    setIsAIThinking(false);
  }

  function handleResetStats() {
    if (window.confirm('Сбросить всю статистику? Это действие нельзя отменить.')) {
      resetStats();
    }
  }

  const winningSet = new Set(result?.line ?? []);
  const currentPlayer = isXTurn ? 'X' : 'O';

  let statusText, statusClass;
  if (result) {
    if (result.winner === 'draw') {
      statusText = 'Ничья! 🤝';
      statusClass = 'status-draw';
    } else {
      const name =
        gameMode === 'ai' && result.winner === 'O'
          ? 'Компьютер'
          : `Игрок ${result.winner}`;
      statusText = `${name} победил! 🎉`;
      statusClass = 'status-win';
    }
  } else if (isAIThinking) {
    statusText = 'Компьютер думает…';
    statusClass = 'status-thinking';
  } else {
    const name =
      gameMode === 'ai' && !isXTurn ? 'Компьютер' : `Игрок ${currentPlayer}`;
    statusText = `Ход: ${name}`;
    statusClass = `status-${currentPlayer.toLowerCase()}`;
  }

  const xName = gameMode === 'ai' ? 'Вы' : 'Игрок 1';
  const oName = gameMode === 'ai' ? (isAIThinking ? '🤔 ИИ' : 'ИИ') : 'Игрок 2';

  return (
    <div className="game-layout">
      {/* ── Main game area ── */}
      <div className="game-main">
        {/* Controls */}
        <div className="controls-row">
          <div className="seg-control">
            <button
              className={`seg-btn ${gameMode === '2p' ? 'active' : ''}`}
              onClick={() => changeMode('2p')}
            >
              👥 2 игрока
            </button>
            <button
              className={`seg-btn ${gameMode === 'ai' ? 'active' : ''}`}
              onClick={() => changeMode('ai')}
            >
              🤖 vs ИИ
            </button>
          </div>

          {gameMode === 'ai' && (
            <div className="seg-control">
              <button
                className={`seg-btn ${difficulty === 'easy' ? 'active' : ''}`}
                onClick={() => setDifficulty('easy')}
              >
                Легко
              </button>
              <button
                className={`seg-btn ${difficulty === 'hard' ? 'active' : ''}`}
                onClick={() => setDifficulty('hard')}
              >
                Сложно
              </button>
            </div>
          )}

          <button
            className={`icon-btn${soundEnabled ? '' : ' muted'}`}
            onClick={() => setSoundEnabled((v) => !v)}
            title={soundEnabled ? 'Выключить звук' : 'Включить звук'}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
        </div>

        {/* Board size selector */}
        <div className="size-selector">
          {[3, 4, 5].map((s) => (
            <button
              key={s}
              className={`size-btn ${size === s ? 'active' : ''}`}
              onClick={() => changeSize(s)}
            >
              {s}×{s}
            </button>
          ))}
        </div>

        {/* Player indicators */}
        <div className="player-indicators">
          <div
            className={`player-card player-x${!result && isXTurn && !isAIThinking ? ' active' : ''}`}
          >
            <span className="player-symbol">✕</span>
            <span className="player-name">{xName}</span>
            {stats.xStreak >= 2 && (
              <span className="streak-badge">🔥 {stats.xStreak}</span>
            )}
          </div>

          <span className="vs-divider">VS</span>

          <div
            className={`player-card player-o${!result && !isXTurn ? ' active' : ''}`}
          >
            <span className="player-symbol">○</span>
            <span className="player-name">{oName}</span>
            {stats.oStreak >= 2 && (
              <span className="streak-badge">🔥 {stats.oStreak}</span>
            )}
          </div>
        </div>

        {/* Status bar */}
        <div className={`status-bar ${statusClass}`}>{statusText}</div>

        {/* Board */}
        <div
          className={`board${isAIThinking ? ' board-thinking' : ''}`}
          style={{ '--board-size': size }}
        >
          {board.map((row, r) =>
            row.map((cell, c) => (
              <Cell
                key={`${r}-${c}`}
                value={cell}
                onClick={() => handleClick(r, c)}
                isWinning={winningSet.has(r * size + c)}
                disabled={
                  !!result ||
                  isAIThinking ||
                  (gameMode === 'ai' && !isXTurn)
                }
              />
            ))
          )}
        </div>

        <button className="btn-primary" onClick={newGame}>
          Новая игра
        </button>
      </div>

      {/* ── Sidebar ── */}
      <div className="game-sidebar">
        {/* Compact stats */}
        <div className="stats-compact">
          <div className="stats-compact-head">
            <span className="stats-compact-title">Статистика</span>
            <button className="btn-reset-stats" onClick={handleResetStats}>
              Сброс
            </button>
          </div>
          <div className="stats-compact-grid">
            <div className="stat-mini">
              <span className="stat-mini-val" style={{ color: 'var(--x-color)' }}>
                {stats.xWins}
              </span>
              <span className="stat-mini-label">X</span>
            </div>
            <div className="stat-mini">
              <span className="stat-mini-val" style={{ color: 'var(--o-color)' }}>
                {stats.oWins}
              </span>
              <span className="stat-mini-label">O</span>
            </div>
            <div className="stat-mini">
              <span className="stat-mini-val">{stats.draws}</span>
              <span className="stat-mini-label">Ничьи</span>
            </div>
            <div className="stat-mini">
              <span className="stat-mini-val" style={{ color: 'var(--primary)' }}>
                {stats.totalGames}
              </span>
              <span className="stat-mini-label">Всего</span>
            </div>
          </div>
        </div>

        {/* Move history */}
        <div className="history-panel">
          <div className="history-title">История ходов</div>
          {history.length === 0 ? (
            <p className="history-empty">Ходов ещё нет</p>
          ) : (
            <ol className="history-list">
              {history.map((move) => (
                <li
                  key={move.num}
                  className={`history-item history-item-${move.player.toLowerCase()}`}
                >
                  <span className="history-num">{move.num}</span>
                  <span
                    className="history-player"
                    style={{ color: move.player === 'X' ? 'var(--x-color)' : 'var(--o-color)' }}
                  >
                    {move.player}
                  </span>
                  <span className="history-pos">
                    {String.fromCharCode(65 + move.col)}{move.row + 1}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}
