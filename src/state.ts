export interface TimeEntry {
  label: string,
  time: number,
  type: 'start' | 'stop',
}

export interface State {
  isRunning: boolean,
  entries: TimeEntry[],
}

export function calculateElapsedSeconds(
  { entries: [firstEntry] }: State
): number | null {
  if (!firstEntry) {
    return null
  }

  return Math.floor(
    (Date.now() - firstEntry?.time) / 1000
  )
}

export function displayTime(
  ms: number,
): string {
  return new Date(ms).toISOString().substr(11, 8)
}

export function isRunning(
  state: State,
): boolean {
  return state.entries[0]?.type === 'start'
}

export function getDisplayText(
  { entries: [firstEntry] }: State,
  elapsedSeconds: number,
): string {

  if (!firstEntry || firstEntry.type === 'stop') {
    return 'Start'
  }

  return displayTime(elapsedSeconds * 1000)
}

export function toggle(
  state: State,
  label: string,
): State {
  console.log({ label })
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