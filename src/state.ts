export interface TimeEntry {
  label: string,
  time: number,
  type: 'start' | 'stop',
}

export interface State {
  isRunning: boolean,
  entries: TimeEntry[],
}

/**
 * Display text for primary button
 */
export function buttonDisplayText(
  { entries: [lastEntry] }: State,
  elapsedSeconds: number,
): string {

  if (!lastEntry || lastEntry.type === 'stop') {
    return 'Start'
  }

  return displayTime(elapsedSeconds * 1000)
}

/**
 * Calculate elapsed time in seconds since
 * last entry
 */
export function calculateElapsedSeconds(
  { entries: [lastEntry] }: State
): number | null {
  if (!lastEntry) {
    return null
  }

  return Math.floor(
    (Date.now() - lastEntry?.time) / 1000
  )
}

/**
 * Display milliseconds as time in seconds
 * 00:00:00
 * @param ms
 */
export function displayTime(
  ms: number,
): string {
  return new Date(ms).toISOString().substr(11, 8)
}

/**
 * Is the timer running
 */
export function isRunning(
  { entries: [lastEntry] }: State,
): boolean {
  return lastEntry?.type === 'start'
}

/**
 * Add a new time entry with given label
 */
export function addTimeEntry(
  state: State,
  label: string,
): State {
  return {
    ...state,
    entries: [
      {
        label,
        time: Date.now(),
        type: state.entries[0]?.type === 'start'
          ? 'stop'
          : 'start',
      },
      ...state.entries,
    ]
  }
}