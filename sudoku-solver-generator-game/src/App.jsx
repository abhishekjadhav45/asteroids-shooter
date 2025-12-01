import { useState, useEffect } from 'react'
import { generatePuzzle, solveSudoku, copyBoard, getHint, isBoardComplete, isBoardValid } from './sudokuAlgorithms'
import './App.css'

function App() {
  const [puzzle, setPuzzle] = useState(null)
  const [board, setBoard] = useState(null)
  const [solution, setSolution] = useState(null)
  const [selected, setSelected] = useState(null)
  const [difficulty, setDifficulty] = useState('medium')
  const [gameStarted, setGameStarted] = useState(false)
  const [won, setWon] = useState(false)
  const [hints, setHints] = useState(3)

  // Initialize game
  useEffect(() => {
    startNewGame()
  }, [])

  const startNewGame = () => {
    const newPuzzle = generatePuzzle(difficulty)
    const solutionBoard = copyBoard(newPuzzle)
    solveSudoku(solutionBoard)
    
    setPuzzle(newPuzzle)
    setBoard(copyBoard(newPuzzle))
    setSolution(solutionBoard)
    setSelected(null)
    setGameStarted(true)
    setWon(false)
    setHints(3)
  }

  const handleCellClick = (row, col) => {
    if (puzzle[row][col] !== 0) return // Can't edit initial numbers
    setSelected([row, col])
  }

  const handleNumberClick = (num) => {
    if (!selected) return
    
    const [row, col] = selected
    const newBoard = board.map(r => [...r])
    newBoard[row][col] = num
    setBoard(newBoard)

    // Check if puzzle is complete
    if (isBoardComplete(newBoard) && isBoardValid(newBoard)) {
      setWon(true)
    }
  }

  const handleClear = () => {
    if (!selected) return
    
    const [row, col] = selected
    if (puzzle[row][col] === 0) {
      const newBoard = board.map(r => [...r])
      newBoard[row][col] = 0
      setBoard(newBoard)
    }
  }

  const handleHint = () => {
    if (hints <= 0 || !selected) return
    
    const [row, col] = selected
    const newBoard = board.map(r => [...r])
    newBoard[row][col] = solution[row][col]
    setBoard(newBoard)
    setHints(hints - 1)

    if (isBoardComplete(newBoard) && isBoardValid(newBoard)) {
      setWon(true)
    }
  }

  const handleReset = () => {
    setBoard(copyBoard(puzzle))
    setSelected(null)
    setWon(false)
    setHints(3)
  }

  if (!board) return <div className="empty-state">Loading...</div>

  return (
    <div className="app">
      <div className="container">
        <div className="header">
          <h1>🧩 Sudoku Solver</h1>
          <p className="subtitle">Fill the grid with numbers 1-9</p>
        </div>

        {won && (
          <div className="win-message">
            🎉 Congratulations! You solved it!
          </div>
        )}

        <div className="controls">
          <div className="control-group">
            <label>Difficulty:</label>
            <select 
              value={difficulty} 
              onChange={(e) => {
                setDifficulty(e.target.value)
              }}
              disabled={gameStarted && !won}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <button className="btn btn-primary" onClick={startNewGame}>
            New Game
          </button>
          <button className="btn btn-secondary" onClick={handleReset} disabled={!gameStarted}>
            Reset
          </button>
        </div>

        <div className="stats">
          <div className="stat-item">
            <span className="stat-label">Hints Left</span>
            <span className="stat-value">{hints}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Status</span>
            <span className="stat-value">{won ? '✓ Won' : 'Playing'}</span>
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div className="sudoku-grid">
            {board.map((row, rowIdx) => (
              <div key={rowIdx} className="sudoku-row">
                {row.map((cell, colIdx) => (
                  <div
                    key={`${rowIdx}-${colIdx}`}
                    className={`sudoku-cell 
                      ${puzzle[rowIdx][colIdx] !== 0 ? 'initial' : ''}
                      ${selected && selected[0] === rowIdx && selected[1] === colIdx ? 'selected' : ''}
                      ${colIdx % 3 === 2 ? 'border-right' : ''}
                      ${rowIdx % 3 === 2 ? 'border-bottom' : ''}
                    `}
                    onClick={() => handleCellClick(rowIdx, colIdx)}
                  >
                    {cell !== 0 ? cell : ''}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="number-pad">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button
              key={num}
              className="number-btn"
              onClick={() => handleNumberClick(num)}
              disabled={!selected}
            >
              {num}
            </button>
          ))}
          <button
            className="number-btn clear-btn"
            onClick={handleClear}
            disabled={!selected}
          >
            Clear
          </button>
          <button
            className="number-btn btn-info"
            onClick={handleHint}
            disabled={!selected || hints <= 0}
            style={{ gridColumn: 'span 2' }}
          >
            💡 Hint ({hints})
          </button>
        </div>

        <div className="footer">
          <p>Built with React + Vite</p>
          <p className="tech-stack">Backtracking Algorithm • Constraint Propagation • MRV Heuristic</p>
        </div>
      </div>
    </div>
  )
}

export default App
