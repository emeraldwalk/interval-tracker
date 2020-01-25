import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  addTimeEntry,
  calculateElapsedSeconds,
  buttonDisplayText,
  State
} from '../state';

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
  // track requestAnimationFrame so we can cancel it on unmount
  const animationFrameHandleRef = useRef<
    ReturnType<typeof requestAnimationFrame>
  >()

  const [elapsed, setElapsed] = useState()
  const [label, setLabel] = useState('')

  const stateRef = useRef<State>({
    isRunning: false,
    entries: [],
  })

  /**
   * Animation loop sets elapsed seconds so that we get
   * a re-render whenever it changes
   */
  function animate(time: number) {
    setElapsed(
      calculateElapsedSeconds(stateRef.current),
    )

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
      stateRef.current = addTimeEntry(
        stateRef.current,
        label,
      )
    },
    [label],
  )

  const [{ type } = { type: 'stop' }] = stateRef.current.entries

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
      >{buttonDisplayText(stateRef.current, elapsed)}
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