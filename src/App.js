import { useEffect, useState } from 'react'
import './App.css'

const INITIAL_CELL_VALUE = Array(9).fill(null)

const CELLS = [...Array(9).keys()]

const WIN_PATTERN = {
  HORIZONTAL: [
    [CELLS[0], CELLS[1], CELLS[2]],
    [CELLS[3], CELLS[4], CELLS[5]],
    [CELLS[6], CELLS[7], CELLS[8]],
  ],
  VERTICAL: [
    [CELLS[0], CELLS[3], CELLS[6]],
    [CELLS[1], CELLS[4], CELLS[7]],
    [CELLS[2], CELLS[5], CELLS[8]],
  ],
  DIAGONAL: [
    [CELLS[0], CELLS[4], CELLS[8]],
    [CELLS[2], CELLS[4], CELLS[6]],
  ],
}

const WIN_PATTERN_LIST = [
  ...WIN_PATTERN.HORIZONTAL,
  ...WIN_PATTERN.VERTICAL,
  ...WIN_PATTERN.DIAGONAL,
]

const SIGN = {
  X: 'X',
  O: 'O',
}

const xKey = 'xWin'
const oKey = 'oWin'
const tiedKey = 'tied'

function Cell({ index, value, winner, matchPatternIndex, handleClick }) {
  const isMatchCell = matchPatternIndex.includes(index)
  if (!value)
    return (
      <div
        onClick={() => {
          if (!!winner) return
          handleClick({ index })
        }}
        className="cell"
      />
    )
  return (
    <div
      className="cell"
      style={{
        border: isMatchCell ? '6px solid #fedd00' : 'none',
        cursor: value ? 'default' : 'pointer',
        color: value === SIGN.X ? 'red' : 'blue',
      }}
      onClick={() => {
        if (!!winner) return
        handleClick({ index })
      }}
    >
      {value === SIGN.X ? (
        <i class="fas fa-times fa-4x" />
      ) : (
        <i class="far fa-circle fa-4x" />
      )}
    </div>
  )
}

function Score({ score, isVsComputer, setScore, setIsVsComputer }) {
  useEffect(() => {
    const xWin = sessionStorage.getItem(xKey) || 0
    const oWin = sessionStorage.getItem(oKey) || 0
    const tied = sessionStorage.getItem(tiedKey) || 0

    setScore({
      X: Number(xWin),
      O: Number(oWin),
      tied: Number(tied),
    })
  }, [setScore])

  return (
    <div style={{ display: 'flex', gridGap: '2rem', marginTop: '1rem' }}>
      <div>
        <div>PLAYER1(X)</div>
        <div style={{ textAlign: 'center' }}>{score.X}</div>
      </div>
      <div>
        <div>TIE</div>
        <div style={{ textAlign: 'center' }}>{score.tied}</div>
      </div>
      <div>
        <div>PLAYER2(O)</div>
        <div style={{ textAlign: 'center' }}>{score.O}</div>
      </div>
      <div
        style={{ cursor: 'pointer' }}
        onClick={() => setIsVsComputer(!isVsComputer)}
      >
        {isVsComputer ? '1P Computer' : '2P'}
      </div>
    </div>
  )
}

function App() {
  const [sign, setSign] = useState(SIGN.X)
  const [winner, setWinner] = useState('')
  const [cellValue, setCellValue] = useState(INITIAL_CELL_VALUE)
  const [matchPatternIndex, setMatchPatternIndex] = useState([])
  const [isVsComputer, setIsVsComputer] = useState(false)

  const [score, setScore] = useState({
    X: 0,
    O: 0,
    tied: 0,
  })

  const handleUpdateScore = (newWinner, updatedCellValue) => {
    const isTied = updatedCellValue.every((el) => !!el) && !newWinner
    let updatedScore = {}

    if (isTied) {
      const newScore = score.tied + 1
      updatedScore = { ...score, tied: newScore }
      sessionStorage.setItem(tiedKey, newScore)
    } else {
      const newScore = score[newWinner] + 1
      updatedScore = { ...score, [newWinner]: newScore }
      sessionStorage.setItem(newWinner === SIGN.X ? xKey : oKey, newScore)
    }

    setScore(updatedScore)
  }

  const handleCheckPattern = (updatedCellValue) => {
    let newWinner = ''

    WIN_PATTERN_LIST.forEach((pattern) => {
      const firstIndex = pattern[0]
      const secondIndex = pattern[1]
      const thirdIndex = pattern[2]

      const firstCellValue = updatedCellValue[firstIndex]
      const secondCellVallue = updatedCellValue[secondIndex]
      const thirdCellValue = updatedCellValue[thirdIndex]

      const fullPattern = firstCellValue || secondCellVallue || thirdCellValue

      if (!fullPattern) return

      const isAllCellUniform =
        firstCellValue === secondCellVallue &&
        secondCellVallue === thirdCellValue

      if (isAllCellUniform) {
        newWinner = updatedCellValue[firstIndex]
        setWinner(newWinner)
        setMatchPatternIndex(pattern)
      }
    })

    const isEndGame = updatedCellValue.every((el) => !!el) || !!newWinner

    if (isEndGame) {
      handleUpdateScore(newWinner, updatedCellValue)
      return
    }

    if (isVsComputer) {
      setCellValue(updatedCellValue)
    }
  }

  const randomizeComputerStep = (updatedCellValue, index) => {
    const computerStep = [...updatedCellValue]

    //check horizontal pattern
    //TODO: check bug
    const possibleWinPatternList = WIN_PATTERN_LIST.filter((elArray) =>
      elArray.includes(index)
    ) //[[x,x,x], [x,x,x]]

    for (let i = 0; i < possibleWinPatternList.length; i++) {
      const possibillityPattern = possibleWinPatternList[i] //[x,x,x]

      const anyEmptyCell = possibillityPattern.some((el) => el === null)

      if (anyEmptyCell) return

      let countOfXValue = 0
      let computerTargetIndex

      possibillityPattern.forEach((cellIndex) => {
        if (updatedCellValue[cellIndex] === SIGN.X) {
          countOfXValue = countOfXValue + 1
        } else {
          computerTargetIndex = cellIndex
        }
      })

      //block X
      if (countOfXValue === 2) {
        computerStep[computerTargetIndex] = SIGN.O
        break
      }
      //auto fill random empty cell
      else {
        if (i === possibleWinPatternList.length - 1) {
          const emptyCellIndex = updatedCellValue.indexOf(null)
          computerStep[emptyCellIndex] = SIGN.O
          break
        }
      }
    }
    setSign(SIGN.X)

    //TODO: check bug
    handleCheckPattern(computerStep)
  }

  const handleClick = ({ index }) => {
    const updatedCellValue = [...cellValue]
    const isCellEmpty = !updatedCellValue[index]

    if (!isCellEmpty) return

    updatedCellValue[index] = sign
    setCellValue(updatedCellValue)

    const invertedSign = sign === SIGN.X ? SIGN.O : SIGN.X
    setSign(invertedSign)

    if (isVsComputer) {
      randomizeComputerStep(updatedCellValue, index)
    }
    handleCheckPattern(updatedCellValue)
  }

  const handleReset = () => {
    setCellValue(INITIAL_CELL_VALUE)
    setWinner('')
    setMatchPatternIndex([])
    setSign(SIGN.X)
  }

  const anyEmptyCell = cellValue.some((el) => el === null)
  const isEndGame = !anyEmptyCell || !!winner

  useEffect(() => {
    if (isEndGame) {
      setTimeout(() => {
        handleReset()
        alert(`${winner ? `🏆 The winner is ${winner}` : 'The game is Tied'}`)
      }, 1000)
    }
  }, [isEndGame])

  return (
    <div>
      <div className="container">
        {CELLS.map((cell) => (
          <Cell
            key={`cell-${cell}`}
            index={cell}
            value={cellValue[cell]}
            winner={winner}
            matchPatternIndex={matchPatternIndex}
            handleClick={handleClick}
          />
        ))}
      </div>

      <Score
        score={score}
        isVsComputer={isVsComputer}
        setScore={setScore}
        setIsVsComputer={setIsVsComputer}
      />

      {!winner && anyEmptyCell && (
        <div style={{ marginTop: '0.5rem' }}>{`Now is ${sign} turn`}</div>
      )}
    </div>
  )
}

export default App
