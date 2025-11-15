export type HourType = { id: number; name: string; color: string; isBuiltin?: boolean; isLocked?: boolean }

// Default types
const DEFAULT_TYPES: HourType[] = [
  { id: 1, name: 'Horas de Trabajo', color: '#0ea5e9', isBuiltin: true, isLocked: false },
  { id: 2, name: 'Horas Libres', color: '#10b981', isBuiltin: true, isLocked: false },
  { id: 3, name: 'Horas Muertas', color: '#9ca3af', isBuiltin: true, isLocked: false },
]

// LocalStorage keys
const STORAGE_KEY_TYPES = 'planning-week-types'
const STORAGE_KEY_ASSIGNMENTS = 'planning-week-assignments'
const STORAGE_KEY_CURRENT_WEEK = 'planning-week-current-week'

// Week management functions
export function getWeekKey(date: Date = new Date()): string {
  // Get Monday of the week (week starts on Monday)
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
  const monday = new Date(d.setDate(diff))
  monday.setHours(0, 0, 0, 0)
  return monday.toISOString().split('T')[0] // Format: YYYY-MM-DD
}

export function getWeekStartDate(weekKey: string): Date {
  return new Date(weekKey + 'T00:00:00')
}

export function getWeekDates(weekKey: string): Date[] {
  const start = getWeekStartDate(weekKey)
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(start)
    date.setDate(start.getDate() + i)
    return date
  })
}

export function getNextWeekKey(weekKey: string): string {
  const date = getWeekStartDate(weekKey)
  date.setDate(date.getDate() + 7)
  return getWeekKey(date)
}

export function getPreviousWeekKey(weekKey: string): string {
  const date = getWeekStartDate(weekKey)
  date.setDate(date.getDate() - 7)
  return getWeekKey(date)
}

// Check if a week is in the past (before today's week)
export function isPastWeek(weekKey: string): boolean {
  const currentWeek = getWeekKey()
  return weekKey < currentWeek
}

// Load from localStorage or use defaults
function loadTypes(): HourType[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_TYPES)
    if (stored) {
      const parsed = JSON.parse(stored)
      // Ensure default types are present with their saved state, merge with any custom types
      const defaultIds = new Set(DEFAULT_TYPES.map(t => t.id))
      const storedDefaults = parsed.filter((t: HourType) => defaultIds.has(t.id))
      const customTypes = parsed.filter((t: HourType) => !defaultIds.has(t.id))
      
      // Merge: use stored defaults (with their saved isLocked state) or fallback to fresh defaults
      const mergedDefaults = DEFAULT_TYPES.map(defaultType => {
        const stored = storedDefaults.find((t: HourType) => t.id === defaultType.id)
        return stored || defaultType
      })
      
      return [...mergedDefaults, ...customTypes]
    }
  } catch (e) {
    console.error('Error loading types from localStorage:', e)
  }
  return [...DEFAULT_TYPES]
}

function loadAssignments(): Record<string, Record<string, number>> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_ASSIGNMENTS)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error('Error loading assignments from localStorage:', e)
  }
  return {}
}

function loadCurrentWeek(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_CURRENT_WEEK)
    if (stored) {
      return stored
    }
  } catch (e) {
    console.error('Error loading current week from localStorage:', e)
  }
  return getWeekKey()
}

// Simple in-memory store (singleton) with localStorage persistence
const _store: {
  types: HourType[]
  assignments: Record<string, Record<string, number>> // weekKey -> { "day-hour": typeId }
  currentWeek: string
} = {
  types: loadTypes(),
  assignments: loadAssignments(),
  currentWeek: loadCurrentWeek(),
}

// Export stable references so other modules can import the variable and it will stay up-to-date.
export const savedTypes = _store.types
export const savedHours = _store.assignments
export const savedCurrentWeek = _store.currentWeek

export function updateTypes(next: HourType[]) {
  // mutate array in-place to keep reference stability
  _store.types.splice(0, _store.types.length, ...next)
  // Save to localStorage
  try {
    localStorage.setItem(STORAGE_KEY_TYPES, JSON.stringify(next))
  } catch (e) {
    console.error('Error saving types to localStorage:', e)
  }
}

export function updateAssignments(weekKey: string, next: Record<string, number>) {
  // Update assignments for specific week
  _store.assignments[weekKey] = { ...next }
  // Save to localStorage
  try {
    localStorage.setItem(STORAGE_KEY_ASSIGNMENTS, JSON.stringify(_store.assignments))
  } catch (e) {
    console.error('Error saving assignments to localStorage:', e)
  }
}

export function getAssignmentsForWeek(weekKey: string): Record<string, number> {
  return _store.assignments[weekKey] || {}
}

export function setCurrentWeek(weekKey: string) {
  _store.currentWeek = weekKey
  try {
    localStorage.setItem(STORAGE_KEY_CURRENT_WEEK, weekKey)
  } catch (e) {
    console.error('Error saving current week to localStorage:', e)
  }
}

export function getCurrentWeek(): string {
  return _store.currentWeek
}

// When moving to a new week, replicate locked assignments only to current and future weeks
export function cleanNonLockedAssignments(weekKey: string, types: HourType[]) {
  // If this is a past week, don't add any locked assignments
  if (isPastWeek(weekKey)) {
    const currentAssignments = getAssignmentsForWeek(weekKey)
    return currentAssignments
  }
  
  const lockedTypeIds = new Set(types.filter(t => t.isLocked).map(t => t.id))
  
  // Get all locked assignments from current and future weeks only (not past weeks)
  const allLockedAssignments: Record<string, number> = {}
  for (const [week, assignments] of Object.entries(_store.assignments)) {
    // Skip past weeks
    if (isPastWeek(week)) continue
    for (const [key, typeId] of Object.entries(assignments)) {
      if (lockedTypeIds.has(typeId)) {
        allLockedAssignments[key] = typeId
      }
    }
  }
  
  // Get current assignments for this week
  const currentAssignments = getAssignmentsForWeek(weekKey)
  
  // Merge: locked assignments from current/future weeks + existing assignments for this week
  const merged: Record<string, number> = { ...allLockedAssignments, ...currentAssignments }
  
  updateAssignments(weekKey, merged)
  return merged
}

export default _store

// Clear all assignments for a week
export function clearAllAssignmentsForWeek(weekKey: string) {
  updateAssignments(weekKey, {})
}

// Clear only non-locked assignments for a week
export function clearNonLockedAssignmentsForWeek(weekKey: string, types: HourType[]) {
  const lockedTypeIds = new Set(types.filter(t => t.isLocked).map(t => t.id))
  const currentAssignments = getAssignmentsForWeek(weekKey)
  
  const filtered: Record<string, number> = {}
  for (const [key, typeId] of Object.entries(currentAssignments)) {
    if (lockedTypeIds.has(typeId)) {
      filtered[key] = typeId
    }
  }
  
  updateAssignments(weekKey, filtered)
}
