import { useState } from 'react'
import './App.css'

const ROWS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
]

function App() {
  const [sign, setSign] = useState('X')
  const [cellValue, setCellValue] = useState(Array(9).fill(''))

  const handleClick = ({ index }) => {
    const updatedCellValue = [...cellValue]
    updatedCellValue[index] = sign

    setCellValue(updatedCellValue)
    let updatedSign = sign

    if (sign === 'X') {
      updatedSign = 'O'
    } else updatedSign = 'X'

    setSign(updatedSign)
  }

  const Cell = ({ index }) => (
    <td
      style={{
        border: '1px solid black',
        textAlign: 'center',
        width: '20px',
        height: '20px',
      }}
      onClick={() => handleClick({ index })}
    >
      {cellValue[index] || ''}
    </td>
  )

  return (
    <div>
      <table style={{ width: '100px', height: '100px' }}>
        {ROWS.map((row, i) => (
          <tr key={`row-${i}`}>
            {row.map((rowIndex) => (
              <Cell index={rowIndex} />
            ))}
          </tr>
        ))}
      </table>
    </div>
  )
}

export default App
