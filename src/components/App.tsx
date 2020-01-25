import React, { useCallback, useEffect, useRef, useState } from 'react'
import { calculateElapsedSeconds, getDisplayText, State, toggle } from '../state';

function* reverse<T>(
  array: T[],
) {
  for (let i = array.length - 1; i >= 0; --i) {
    yield array[i]
  }
}

export interface AppProps {
}

const App: React.FC<AppProps> = () => {
  const [elapsed, setElapsed] = useState()

  const stateRef = useRef<State>({
    isRunning: false,
    entries: [],
  })

  // const [displayText, setDisplayText] = useState(
  //   () => getDisplayText(
  //     stateRef.current,
  //   )
  // )

  const [label, setLabel] = useState('')

  const animationFrameHandleRef = useRef<ReturnType<typeof requestAnimationFrame>>()
  const timeRef = useRef<number>()

  function animate(time: number) {
    setElapsed(
      calculateElapsedSeconds(stateRef.current),
    )

    timeRef.current = time
    animationFrameHandleRef.current = requestAnimationFrame(animate)
  }

  useEffect(
    () => {
      // initial call
      animationFrameHandleRef.current = requestAnimationFrame(animate)
      ;() => cancelAnimationFrame(animationFrameHandleRef.current!)
    },
    []
  )

  const onClick = useCallback(
    () => {
      stateRef.current = toggle(
        stateRef.current,
        label,
      )
    },
    [label],
  )

  const { type = 'stop' } = stateRef.current.entries[0] || {}

  return (
    <div className="c_app">
      <input
        onChange={({ currentTarget: { value }}) => {
          setLabel(value)
        }}
        readOnly={type === 'start'}
        value={label}
      />

      <button
        className={`c_app__cmd ${type}`}
        onClick={onClick}
      >{getDisplayText(stateRef.current, elapsed)}
      </button>

      <ul>
        {
          Array.from(reverse(
            stateRef.current.entries
          )).map(({ label, time, type }) => (
          <li key={time}>{label}: {type} {new Date(time).toLocaleTimeString()}</li>
          ))
        }
      </ul>
    </div>
  );
};

export default App