import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  addTimeEntry,
  calculateElapsedSeconds,
  calculateGroupElapsedSeconds,
  displayTime,
  buttonDisplayText,
  summary,
  State,
} from '../state';

const persistedState = localStorage.getItem('state')
const [initialLabel, initialState]: [string, State] = persistedState
  ? JSON.parse(persistedState)
  : [
    '',
    {
      entries: [],
    }
  ]

function persistState(
  label: string,
  state: State,
) {
  localStorage.setItem('state', JSON.stringify([label, state]))
}

export interface AppProps {
}

const App: React.FC<AppProps> = () => {
  // track requestAnimationFrame so we can cancel it on unmount
  const animationFrameHandleRef = useRef<
    ReturnType<typeof requestAnimationFrame>
  >()

  const [elapsed, setElapsed] = useState(
    calculateElapsedSeconds(initialState)
  )
  const [label, setLabel] = useState(initialLabel)
  const stateRef = useRef<State>(initialState)

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
      persistState(label, stateRef.current)
    },
    [label],
  )

  const [{ type } = { type: 'stop' }] = stateRef.current.entries

  return (
    <div className="c_app">
      <input
        className="c_app__group-name"
        onChange={({ currentTarget: { value }}) => {
          setLabel(value)
          persistState(value, stateRef.current)
        }}
        placeholder="Category"
        readOnly={type === 'start'}
        value={label}
      />

      <button
        className={`c_app__cmd ${type}`}
        disabled={label === ''}
        onClick={onClick}
      >{
        buttonDisplayText(stateRef.current, elapsed || 0).map(
          (text, i) => <span key={i}>{text}</span>
        )
      }
      </button>

      <ul className="c_app__summary">
        {
          Array.from(summary(
            stateRef.current,
          )).map(({ items, label }, i) => [
            <li
              className="c_app__group-label"
              key={`label-${label}-${i}`}
            >
              {label.length ? label : 'Unlabeled'}
              &nbsp;(
                {
                  displayTime(
                    calculateGroupElapsedSeconds({ items, label })
                  )
                }
              )</li>,
            <ul
              className="c_app__group-items"
              key={`items-${label}-${i}`}
            >
              {
                items.map(([start, stop]) => (
                  <li key={start.time}>{
                    new Date(start.time).toLocaleTimeString()
                  } - {
                    stop && new Date(stop.time).toLocaleTimeString()
                  }</li>
                ))
              }
            </ul>
          ])
        }
      </ul>
    </div>
  );
};

export default App