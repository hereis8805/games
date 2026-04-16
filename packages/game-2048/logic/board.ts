export type Board = number[][];
export type Direction = 'up' | 'down' | 'left' | 'right';

const SIZE = 4;

export function initBoard(): Board {
  const board = emptyBoard();
  return addRandomTile(addRandomTile(board));
}

function emptyBoard(): Board {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
}

// 빈 칸 좌표 목록 반환
function emptyTiles(board: Board): [number, number][] {
  const cells: [number, number][] = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] === 0) cells.push([r, c]);
    }
  }
  return cells;
}

// 빈 칸 중 하나에 2(90%) 또는 4(10%) 배치
export function addRandomTile(board: Board): Board {
  const empty = emptyTiles(board);
  if (empty.length === 0) return board;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  const value = Math.random() < 0.9 ? 2 : 4;
  const next = board.map(row => [...row]);
  next[r][c] = value;
  return next;
}

// 한 행을 왼쪽으로 밀고 병합 → [새 행, 획득 점수]
function mergeRow(row: number[]): [number[], number] {
  const tiles = row.filter(v => v !== 0);
  let score = 0;
  const merged: number[] = [];
  let i = 0;
  while (i < tiles.length) {
    if (i + 1 < tiles.length && tiles[i] === tiles[i + 1]) {
      const val = tiles[i] * 2;
      merged.push(val);
      score += val;
      i += 2;
    } else {
      merged.push(tiles[i]);
      i++;
    }
  }
  while (merged.length < SIZE) merged.push(0);
  return [merged, score];
}

// 보드를 90도 시계 방향으로 회전
function rotateClockwise(board: Board): Board {
  return Array.from({ length: SIZE }, (_, r) =>
    Array.from({ length: SIZE }, (__, c) => board[SIZE - 1 - c][r])
  );
}

// 방향별 변환: 항상 "왼쪽 이동"으로 처리하기 위해 회전
function rotationsFor(dir: Direction): number {
  return { left: 0, up: 3, right: 2, down: 1 }[dir];
}

function rotateN(board: Board, n: number): Board {
  let b = board;
  for (let i = 0; i < n; i++) b = rotateClockwise(b);
  return b;
}

// 이동 결과: [새 보드, 획득 점수, 보드 변화 여부]
export function slideBoard(board: Board, dir: Direction): [Board, number, boolean] {
  const rot = rotationsFor(dir);
  const rotated = rotateN(board, rot);

  let totalScore = 0;
  const moved = rotated.map(row => {
    const [newRow, score] = mergeRow(row);
    totalScore += score;
    return newRow;
  });

  const unrotated = rotateN(moved, (4 - rot) % 4);
  const changed = !boardsEqual(board, unrotated);
  return [unrotated, totalScore, changed];
}

function boardsEqual(a: Board, b: Board): boolean {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (a[r][c] !== b[r][c]) return false;
    }
  }
  return true;
}

export function hasWon(board: Board): boolean {
  return board.some(row => row.some(v => v === 2048));
}

export function isGameOver(board: Board): boolean {
  if (emptyTiles(board).length > 0) return false;
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const v = board[r][c];
      if (c + 1 < SIZE && board[r][c + 1] === v) return false;
      if (r + 1 < SIZE && board[r + 1][c] === v) return false;
    }
  }
  return true;
}
