import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  addTimeEntry,
  ButtonDisplayType,
  calculateElapsedSeconds,
  calculateGroupElapsedSeconds,
  displayTime,
  buttonDisplayText,
  distinctLabelSummary,
  State,
  TimeEntry,
} from '../util/state';
import { showNotification } from '../util/notifications';

const buttonDisplayTypes: ButtonDisplayType[] = [
  'Elapsed',
  '20 minutes',
  '1 hour'
]

const persistedState = localStorage.getItem('state')
const initialState: State = persistedState
  ? JSON.parse(persistedState)
  : {
    buttonDisplayType: 'Elapsed',
    label: '',
    entries: [],
  }

function persistState(
  state: State,
): void {
  localStorage.setItem('state', JSON.stringify(state))
}

export interface AppProps {
}

const App: React.FC<AppProps> = () => {
  // track requestAnimationFrame so we can cancel it on unmount
  const animationFrameHandleRef = useRef<
    ReturnType<typeof requestAnimationFrame>
  >()

  const [state, setState] = useState<State>(initialState)
  const lastEntryRef = useRef<TimeEntry | undefined>(state.entries[0])

  const [elapsed, setElapsed] = useState(
    calculateElapsedSeconds(lastEntryRef.current)
  )

  /**
   * Animation loop sets elapsed seconds so that we get
   * a re-render whenever it changes
   */
  function animate(time: number) {
    setElapsed(
      calculateElapsedSeconds(lastEntryRef.current),
    )

    animationFrameHandleRef.current = requestAnimationFrame(animate)
  }

  useEffect(
    () => {
      // initial call
      animationFrameHandleRef.current = requestAnimationFrame(animate)
        ; () => cancelAnimationFrame(animationFrameHandleRef.current!)
    },
    []
  )

  const onClick = useCallback(
    () => {
      const newState = addTimeEntry(
        state,
      )
      setState(newState)
      lastEntryRef.current = newState.entries[0]
      persistState(newState)
    },
    [state],
  )

  const [{ type } = { type: 'stop' }] = state.entries

  const buttonText = buttonDisplayText(
    state,
    elapsed || 0,
  )

  if (
    type === 'start' &&
    state.buttonDisplayType !== 'Elapsed' &&
    buttonText[1] === '00:00:00'
  ) {
    showNotification('00:00:00')
  }

  return (
    <div className="c_app">
      <nav>
        {
          buttonDisplayTypes.map(type => (
            <span
              className={type === state.buttonDisplayType ? 'c_app__display-type active' : 'c_app__display-type'}
              key={type}
              onClick={() => {
                const newState = {
                  ...state,
                  buttonDisplayType: type,
                }

                setState(newState)
                persistState(newState)
              }
              }
            >{type}</span>
          ))
        }
      </nav>
      <input
        className="c_app__group-name"
        onChange={({ currentTarget: { value } }) => {
          let { entries } = state

          if (lastEntryRef.current?.type === 'start') {
            lastEntryRef.current = {
              ...lastEntryRef.current,
              label: value,
            }

            entries = [
              lastEntryRef.current,
              ...entries.slice(1),
            ]
          }

          const newState: State = {
            ...state,
            entries,
            label: value,
          }

          setState(newState)
          persistState(newState)
        }}
        placeholder="Category"
        value={state.label}
      />

      <button
        className={`c_app__cmd ${type}`}
        disabled={state.label === ''}
        onClick={onClick}
      >{buttonText.map(
        (text, i) => <span key={i}>{text}</span>
      )}
      </button>

      <ul className="c_app__summary">
        {
          distinctLabelSummary(
            state,
          ).map(({ items, label }, i) => [
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

      <button
        className="c_app__clear-all"
        onClick={() => {
          localStorage.clear()
          location.reload()
        }}
      >Clear All
      </button>
    </div>
  );
};

export default App