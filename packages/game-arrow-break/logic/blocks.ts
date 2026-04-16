export type Direction = 'up' | 'down' | 'left' | 'right';

export interface BlockItem {
  id: number;
  dir: Direction;
}

export const DIRECTIONS: Direction[] = ['up', 'down', 'left', 'right'];

export const DIRECTION_LABEL: Record<Direction, string> = {
  up:    '⬆',
  down:  '⬇',
  left:  '⬅',
  right: '➡',
};

let _nextId = 1;
function nextId(): number { return _nextId++; }

export function newBlock(): BlockItem {
  return {
    id: nextId(),
    dir: DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)],
  };
}

/** 큐 초기화: size개 랜덤 블럭. queue[last] = 하단 타겟 */
export function initQueue(size: number): BlockItem[] {
  return Array.from({ length: size }, newBlock);
}

/** 정답 판정: 마지막(하단) 블럭이 input과 같으면 true */
export function judgeInput(queue: BlockItem[], input: Direction): boolean {
  return queue.length > 0 && queue[queue.length - 1].dir === input;
}

/** 하단 블럭 제거 + 상단에 새 블럭 추가 */
export function popAndPush(queue: BlockItem[]): BlockItem[] {
  const next = queue.slice(0, queue.length - 1);
  next.unshift(newBlock());
  return next;
}
