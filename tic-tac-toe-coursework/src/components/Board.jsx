import { useState } from 'react';
import Cell from './Cell';
import { useStats } from '../contexts/StatsContext';

// Создаёт пустое поле размером size×size
function createBoard(size) {
  return Array.from({ length: size }, () => Array(size).fill(null));
}

// Проверяет победителя или ничью после каждого хода.
// Возвращает { winner: 'X'|'O'|'draw', line: number[] } или null
function checkWinner(board, size) {
  // Проверка строк
  for (let r = 0; r < size; r++) {
    const first = board[r][0];
    if (first && board[r].every(cell => cell === first)) {
      return { winner: first, line: board[r].map((_, c) => r * size + c) };
    }
  }

  // Проверка столбцов
  for (let c = 0; c < size; c++) {
    const first = board[0][c];
    if (first && board.every(row => row[c] === first)) {
      return { winner: first, line: board.map((_, r) => r * size + c) };
    }
  }

  // Главная диагональ
  const d1 = board[0][0];
  if (d1 && board.every((row, i) => row[i] === d1)) {
    return { winner: d1, line: board.map((_, i) => i * size + i) };
  }

  // Побочная диагональ
  const d2 = board[0][size - 1];
  if (d2 && board.every((row, i) => row[size - 1 - i] === d2)) {
    return { winner: d2, line: board.map((_, i) => i * size + (size - 1 - i)) };
  }

  // Ничья — поле заполнено, победителя нет
  if (board.every(row => row.every(cell => cell !== null))) {
    return { winner: 'draw', line: [] };
  }

  return null;
}

export default function Board() {
  const [size, setSize] = useState(3);
  const [board, setBoard] = useState(() => createBoard(3));
  const [isXTurn, setIsXTurn] = useState(true);
  const [result, setResult] = useState(null);

  const { updateStats } = useStats();

  function handleClick(row, col) {
    if (result || board[row][col]) return;

    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = isXTurn ? 'X' : 'O';

    const gameResult = checkWinner(newBoard, size);
    setBoard(newBoard);

    if (gameResult) {
      setResult(gameResult);
      updateStats(gameResult.winner);
    } else {
      setIsXTurn(!isXTurn);
    }
  }

  function newGame() {
    setBoard(createBoard(size));
    setIsXTurn(true);
    setResult(null);
  }

  function changeSize(newSize) {
    setSize(newSize);
    setBoard(createBoard(newSize));
    setIsXTurn(true);
    setResult(null);
  }

  const winningSet = new Set(result?.line ?? []);
  const currentPlayer = isXTurn ? 'X' : 'O';

  let statusText;
  let statusClass;
  if (result) {
    if (result.winner === 'draw') {
      statusText = 'Ничья! 🤝';
      statusClass = 'status-draw';
    } else {
      statusText = `Победил ${result.winner}! 🎉`;
      statusClass = 'status-win';
    }
  } else {
    statusText = `Ход игрока: ${currentPlayer}`;
    statusClass = `status-${currentPlayer.toLowerCase()}`;
  }

  return (
    <div className="board-page">
      {/* Выбор размера поля */}
      <div className="size-selector">
        {[3, 4, 5].map(s => (
          <button
            key={s}
            className={`size-btn ${size === s ? 'active' : ''}`}
            onClick={() => changeSize(s)}
          >
            {s}×{s}
          </button>
        ))}
      </div>

      {/* Статус игры */}
      <div className={`status-bar ${statusClass}`}>{statusText}</div>

      {/* Игровое поле */}
      <div className="board" style={{ '--board-size': size }}>
        {board.map((row, r) =>
          row.map((cell, c) => (
            <Cell
              key={`${r}-${c}`}
              value={cell}
              onClick={() => handleClick(r, c)}
              isWinning={winningSet.has(r * size + c)}
              disabled={!!result}
            />
          ))
        )}
      </div>

      <button className="btn-primary" onClick={newGame}>
        Новая игра
      </button>
    </div>
  );
}
