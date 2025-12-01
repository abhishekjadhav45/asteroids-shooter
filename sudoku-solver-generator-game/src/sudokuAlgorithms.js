/**
 * SUDOKU ALGORITHMS - DSA Implementation
 * 
 * This file contains all core algorithms for Sudoku:
 * 1. Backtracking Algorithm (main solving technique)
 * 2. Constraint Propagation (optimization)
 * 3. Puzzle Generation with difficulty levels
 * 4. Matrix Traversal and Graph-based constraints
 * 
 * Perfect for technical interviews - demonstrates:
 * - Recursion and backtracking
 * - Time complexity optimization (pruning)
 * - Constraint satisfaction problems (CSP)
 * - Matrix operations
 */

// ============================================
// CONSTRAINT CHECKING - O(1) operations
// ============================================

/**
 * Check if placing a number in a cell is valid
 * Uses graph-based constraint checking:
 * - Row constraint: No duplicate in same row
 * - Column constraint: No duplicate in same column  
 * - Box constraint: No duplicate in 3x3 subgrid
 * 
 * Time Complexity: O(1) - constant checks (9 cells max)
 * Space Complexity: O(1)
 */
export const isValid = (board, row, col, num) => {
  // Check row constraint - horizontal traversal
  for (let x = 0; x < 9; x++) {
    if (board[row][x] === num) return false;
  }
  
  // Check column constraint - vertical traversal
  for (let x = 0; x < 9; x++) {
    if (board[x][col] === num) return false;
  }
  
  // Check 3x3 box constraint - subgrid traversal
  // Calculate top-left corner of the 3x3 box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[boxRow + i][boxCol + j] === num) return false;
    }
  }
  
  return true; // All constraints satisfied
};

/**
 * Get all possible valid numbers for a cell
 * Used for constraint propagation and pruning
 * 
 * Time Complexity: O(9) - check 9 possible numbers
 */
export const getPossibleNumbers = (board, row, col) => {
  const possible = [];
  for (let num = 1; num <= 9; num++) {
    if (isValid(board, row, col, num)) {
      possible.push(num);
    }
  }
  return possible;
};

// ============================================
// BACKTRACKING SOLVER - Core Algorithm
// ============================================

/**
 * Solve Sudoku using Backtracking Algorithm
 * 
 * ALGORITHM EXPLANATION (for interviews):
 * 1. Find empty cell (matrix traversal)
 * 2. Try numbers 1-9 (recursion tree with 9 branches)
 * 3. Check constraints (pruning invalid branches)
 * 4. Recursively solve rest of board
 * 5. Backtrack if no solution found (undo and try next number)
 * 
 * Time Complexity: O(9^(n*n)) worst case, but pruning makes it much faster
 * Space Complexity: O(n*n) for recursion stack
 * 
 * This is a classic example of:
 * - Depth-First Search (DFS)
 * - Constraint Satisfaction Problem (CSP)
 * - Recursive backtracking with pruning
 */
export const solveSudoku = (board) => {
  // Find next empty cell - matrix traversal
  const emptyCell = findEmptyCell(board);
  
  // Base case: No empty cells means puzzle is solved
  if (!emptyCell) return true;
  
  const [row, col] = emptyCell;
  
  // Try numbers 1-9 (recursion tree branches)
  for (let num = 1; num <= 9; num++) {
    // Pruning: Only try if valid (constraint checking)
    if (isValid(board, row, col, num)) {
      // Make choice (go down recursion tree)
      board[row][col] = num;
      
      // Recursive call - solve rest of board
      if (solveSudoku(board)) {
        return true; // Solution found!
      }
      
      // Backtrack: Undo choice and try next number
      board[row][col] = 0;
    }
  }
  
  // No valid number found - backtrack to previous cell
  return false;
};

/**
 * Find first empty cell in board
 * Matrix traversal: row-major order
 * 
 * Time Complexity: O(n*n) worst case
 */
const findEmptyCell = (board) => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        return [row, col];
      }
    }
  }
  return null; // No empty cells
};

// ============================================
// OPTIMIZED SOLVER - With Heuristics
// ============================================

/**
 * Solve with MRV (Minimum Remaining Values) heuristic
 * Chooses cell with fewest possibilities first
 * This is a key optimization technique in CSP
 * 
 * Time Complexity: Better than basic backtracking due to pruning
 */
export const solveSudokuOptimized = (board) => {
  // Find cell with minimum remaining values (MRV heuristic)
  const cell = findBestCell(board);
  
  if (!cell) return true; // Solved
  
  const [row, col] = cell;
  const possibleNums = getPossibleNumbers(board, row, col);
  
  // Try each possible number
  for (const num of possibleNums) {
    board[row][col] = num;
    
    if (solveSudokuOptimized(board)) {
      return true;
    }
    
    board[row][col] = 0; // Backtrack
  }
  
  return false;
};

/**
 * Find cell with minimum remaining values (MRV heuristic)
 * This reduces the branching factor in recursion tree
 */
const findBestCell = (board) => {
  let minOptions = 10;
  let bestCell = null;
  
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        const options = getPossibleNumbers(board, row, col).length;
        if (options < minOptions) {
          minOptions = options;
          bestCell = [row, col];
        }
      }
    }
  }
  
  return bestCell;
};

// ============================================
// PUZZLE GENERATOR - With Difficulty Levels
// ============================================

/**
 * Generate a valid Sudoku puzzle
 * 
 * ALGORITHM:
 * 1. Start with empty board
 * 2. Fill diagonal 3x3 boxes (independent - no constraints)
 * 3. Solve rest using backtracking
 * 4. Remove numbers based on difficulty
 * 5. Ensure unique solution
 * 
 * Difficulty levels:
 * - Easy: 40-45 clues (remove 36-41 numbers)
 * - Medium: 30-35 clues (remove 46-51 numbers)
 * - Hard: 25-29 clues (remove 52-56 numbers)
 */
export const generatePuzzle = (difficulty = 'medium') => {
  // Create empty 9x9 board
  const board = Array(9).fill(null).map(() => Array(9).fill(0));
  
  // Step 1: Fill diagonal 3x3 boxes (they don't affect each other)
  fillDiagonalBoxes(board);
  
  // Step 2: Solve the rest using backtracking
  solveSudoku(board);
  
  // Step 3: Remove numbers based on difficulty
  const cellsToRemove = getDifficultyLevel(difficulty);
  removeNumbers(board, cellsToRemove);
  
  return board;
};

/**
 * Fill the three diagonal 3x3 boxes
 * These boxes are independent (no shared constraints)
 * This speeds up generation significantly
 */
const fillDiagonalBoxes = (board) => {
  for (let box = 0; box < 9; box += 3) {
    fillBox(board, box, box);
  }
};

/**
 * Fill a single 3x3 box with random valid numbers
 */
const fillBox = (board, row, col) => {
  const numbers = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  let idx = 0;
  
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      board[row + i][col + j] = numbers[idx++];
    }
  }
};

/**
 * Remove numbers from solved board to create puzzle
 * Ensures unique solution by checking solvability
 */
const removeNumbers = (board, count) => {
  let removed = 0;
  const attempts = count * 3; // Try more times to ensure we remove enough
  
  for (let i = 0; i < attempts && removed < count; i++) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);
    
    if (board[row][col] !== 0) {
      const backup = board[row][col];
      board[row][col] = 0;
      
      // Check if puzzle still has unique solution
      const testBoard = board.map(row => [...row]);
      if (hasUniqueSolution(testBoard)) {
        removed++;
      } else {
        board[row][col] = backup; // Restore if multiple solutions
      }
    }
  }
};

/**
 * Check if puzzle has unique solution
 * Counts number of solutions (should be exactly 1)
 */
const hasUniqueSolution = (board) => {
  const solutions = { count: 0 };
  countSolutions(board, solutions);
  return solutions.count === 1;
};

/**
 * Count number of solutions using backtracking
 * Stops after finding 2 solutions (optimization)
 */
const countSolutions = (board, solutions) => {
  if (solutions.count > 1) return; // Early termination
  
  const emptyCell = findEmptyCell(board);
  if (!emptyCell) {
    solutions.count++;
    return;
  }
  
  const [row, col] = emptyCell;
  
  for (let num = 1; num <= 9; num++) {
    if (isValid(board, row, col, num)) {
      board[row][col] = num;
      countSolutions(board, solutions);
      board[row][col] = 0;
    }
  }
};

/**
 * Get number of cells to remove based on difficulty
 */
const getDifficultyLevel = (difficulty) => {
  switch (difficulty) {
    case 'easy':
      return 40; // 41 clues remaining
    case 'medium':
      return 50; // 31 clues remaining
    case 'hard':
      return 55; // 26 clues remaining
    default:
      return 50;
  }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Fisher-Yates shuffle algorithm
 * Time Complexity: O(n)
 */
const shuffle = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

/**
 * Deep copy a 2D board
 */
export const copyBoard = (board) => {
  return board.map(row => [...row]);
};

/**
 * Check if board is completely filled
 */
export const isBoardComplete = (board) => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) return false;
    }
  }
  return true;
};

/**
 * Check if current board state is valid (no conflicts)
 */
export const isBoardValid = (board) => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] !== 0) {
        const num = board[row][col];
        board[row][col] = 0; // Temporarily remove to check
        if (!isValid(board, row, col, num)) {
          board[row][col] = num; // Restore
          return false;
        }
        board[row][col] = num; // Restore
      }
    }
  }
  return true;
};

/**
 * Get hint for user - finds a valid number for an empty cell
 */
export const getHint = (board, solution) => {
  const emptyCells = [];
  
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        emptyCells.push([row, col]);
      }
    }
  }
  
  if (emptyCells.length === 0) return null;
  
  // Return random empty cell with its solution
  const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  return {
    row: randomCell[0],
    col: randomCell[1],
    value: solution[randomCell[0]][randomCell[1]]
  };
};
