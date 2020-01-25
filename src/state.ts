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

/**
 * Display text for primary button
 */
export function buttonDisplayText(
  { entries: [lastEntry] }: State,
  elapsedSeconds: number,
): [string, string] {

  if (!lastEntry || lastEntry.type === 'stop') {
    return ['Start', '\xa0']
  }

  return ['Stop', displayTime(elapsedSeconds * 1000)]
}

/**
 * Calculate elapsed time in seconds since
 * last entry
 */
export function calculateElapsedSeconds(
  { entries: [lastEntry] }: State
): number | null {
  if (!lastEntry || lastEntry.type === 'stop') {
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

export function* summary(
  { entries }: State,
) {
  let group = {
    items: [] as [TimeEntry, TimeEntry | undefined][],
    label: '',
  }

  for (let i = entries.length - 1; i >= 0; --i) {
    if (entries[i].label !== group.label) {
      if (group.items.length) {
        yield group
      }

      group = {
        items: [],
        label: entries[i].label,
      }
    }

    if (entries[i].type === 'start') {
      group.items.push([entries[i], undefined])
    }
    else {
      group.items[group.items.length - 1][1] = entries[i]
    }
  }

  if (group.items.length) {
    yield group
  }
}