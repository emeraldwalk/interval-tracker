import { mod } from './math'

export interface TimeEntry {
  label: string,
  time: number,
  type: 'start' | 'stop',
}

export interface TimeEntryGroup {
  items: [TimeEntry, TimeEntry | undefined][],
  label: string,
}

export interface State {
  buttonDisplayType: ButtonDisplayType,
  entries: TimeEntry[],
  label: string,
}

/**
 * Add a new time entry with given label
 */
export function addTimeEntry(
  state: State,
): State {
  return {
    ...state,
    entries: [
      {
        label: state.label,
        time: Date.now(),
        type: state.entries[0]?.type === 'start'
          ? 'stop'
          : 'start',
      },
      ...state.entries,
    ]
  }
}

export type ButtonDisplayType =
  | 'Elapsed'
  | '20 minutes'
  | '1 hour'

/**
 * Display text for primary button
 */
export function buttonDisplayText(
  { buttonDisplayType, entries: [lastEntry, ...rest], label }: State,
  elapsedSeconds: number,
): [string, string] {

  if (!lastEntry) {
    return ['Start', '\xa0']
  }

  const categoryEntries = [lastEntry, ...rest]
    .filter(e => e.label === label)
    .reverse()

  if (categoryEntries.length === 0) {
    return ['Start', '\xa0']
  }

  let total = 0
  let startTime = 0
  ; categoryEntries.forEach(entry => {
    if (entry.type === 'start') {
      startTime = entry.time
    }
    else {
      total += entry.time - startTime
    }
  })

  elapsedSeconds += Math.floor(total / 1000)

  const value = buttonDisplayType === 'Elapsed'
    ? elapsedSeconds
    : buttonDisplayType === '20 minutes'
      ? countdownValue(20 * 60, elapsedSeconds)
      : countdownValue(60 * 60, elapsedSeconds)

  return [
    lastEntry.type === 'start' ? 'Stop' : 'Resume',
    displayTime(value * 1000)
  ]
}

/**
 * Calculate elapsed time in seconds since
 * last entry
 */
export function calculateElapsedSeconds(
  lastEntry: TimeEntry | undefined,
): number | null {
  if (!lastEntry || lastEntry.type === 'stop') {
    return null
  }

  return Math.floor(
    (Date.now() - lastEntry?.time) / 1000
  )
}

export function calculateGroupElapsedSeconds(
  group: TimeEntryGroup,
): number {
  return group.items.reduce((total, [start, end]) => {
    return total + (end ? end.time : Date.now()) - start.time
  }, 0)
}

/**
 * Calculate current countdown value based on
 * a start and elapsed number of seconds.
 */
export function countdownValue(
  startSeconds: number,
  elapsedSeconds: number,
): number {
  if (elapsedSeconds === 0) {
    return startSeconds
  }

  return mod(
    startSeconds - elapsedSeconds,
    startSeconds
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
 * Group entries by contiguous label.
 */
export function* contiguousLabelSummary(
  { entries }: State,
): Generator<TimeEntryGroup> {
  let group: TimeEntryGroup = {
    items: [],
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
    else if (group.items.length) {
      group.items[group.items.length - 1][1] = entries[i]
    }
  }

  if (group.items.length) {
    yield group
  }
}

/**
 * Group entries by distinct labels
 */
export function distinctLabelSummary(
  { entries }: State,
): TimeEntryGroup[] {
  const map = entries.reduceRight((memo, cur) => {
    memo[cur.label] = memo[cur.label] || []
    if (cur.type === 'start') {
      memo[cur.label].push([cur, undefined])
    }
    else if (memo[cur.label].length) {
      memo[cur.label][memo[cur.label].length - 1][1] = cur
    }
    return memo
  }, {} as Record<string, [TimeEntry, TimeEntry | undefined][]>)

  return Object.keys(map).map(label => ({
    label,
    items: map[label],
  }))
}