import React, { useState, useCallback, useEffect } from 'react'
import Header from './components/Header'
import Planner from './components/Planner'
import { 
    savedTypes, 
    savedHours,
    updateTypes, 
    updateAssignments, 
    getAssignmentsForWeek,
    getCurrentWeek,
    setCurrentWeek,
    getNextWeekKey,
    getPreviousWeekKey,
    cleanNonLockedAssignments,
    clearAllAssignmentsForWeek,
    clearNonLockedAssignmentsForWeek,
    isPastWeek,
    HourType 
} from './store'

export default function App() {
    const [types, setTypes] = useState<HourType[]>(() => [...savedTypes])

    const [selectedTypeId, setSelectedTypeId] = useState<number | null>(() => (savedTypes[0]?.id ?? null))

    const [currentWeekKey, setCurrentWeekKey] = useState<string>(() => getCurrentWeek())

    // assignments keyed by "day-hour" -> typeId for current week
    const [assignments, setAssignments] = useState<Record<string, number>>(() => 
        ({ ...getAssignmentsForWeek(currentWeekKey) })
    )

    // Hour format: 24 or 12
    const [hourFormat, setHourFormat] = useState<'24' | '12'>('12')

    // Update assignments when week changes
    useEffect(() => {
        const weekAssignments = getAssignmentsForWeek(currentWeekKey)
        setAssignments({ ...weekAssignments })
    }, [currentWeekKey])

    const addType = useCallback((name: string, color: string) => {
        setTypes(prev => {
            const nextId = prev.length ? Math.max(...prev.map(t => t.id)) + 1 : 1
            const newType: HourType = { id: nextId, name, color, isBuiltin: false }
            const next = [...prev, newType]
            // persist to store variable (in-place)
            updateTypes(next)
            return next
        })
    }, [])

            const removeType = useCallback((id: number) => {
                // Block removing types when viewing past weeks
                if (isPastWeek(currentWeekKey)) return
                
                setTypes(prev => {
                    const toDelete = prev.find(t => t.id === id)
                    // don't allow deleting builtin or locked types
                    if (!toDelete || toDelete.isBuiltin || toDelete.isLocked) return prev
                    const next = prev.filter(t => t.id !== id)
                    // if the selected type was deleted, pick a sensible fallback
                    setSelectedTypeId(current => (current === id ? (next[0]?.id ?? null) : current))
                    // persist types
                    updateTypes(next)
                    return next
                })

                setAssignments(prev => {
                    const copy = { ...prev }
                    for (const k of Object.keys(copy)) {
                        if (copy[k] === id) delete copy[k]
                    }
                    // persist assignments for current week
                    updateAssignments(currentWeekKey, copy)
                    return copy
                })
            }, [])

        const toggleAssignment = useCallback((dayIndex: number, hour: number) => {
            // Block editing in past weeks
            if (isPastWeek(currentWeekKey)) return
            
            if (selectedTypeId == null) return
            const key = `${dayIndex}-${hour}`
            setAssignments(prev => {
                const current = prev[key]
                const currentType = current ? types.find(t => t.id === current) : undefined
                // if the current assigned type is locked, do not allow editing
                if (currentType?.isLocked) return prev

                // otherwise, toggle: if assigned to selected type, unassign; else assign
                        let next: Record<string, number>
                if (current === selectedTypeId) {
                    const copy = { ...prev }
                    delete copy[key]
                    next = copy
                } else {
                    next = { ...prev, [key]: selectedTypeId }
                }
                        // persist for current week
                        updateAssignments(currentWeekKey, next)
                return next
            })
        }, [selectedTypeId, types, currentWeekKey])

        const toggleLockType = useCallback((id: number) => {
            setTypes(prev => {
                const next = prev.map(t => (t.id === id ? { ...t, isLocked: !t.isLocked } : t))
                updateTypes(next)
                
                // If locking a type, replicate its assignments to current and future weeks only
                const typeToLock = next.find(t => t.id === id)
                if (typeToLock?.isLocked) {
                  const lockedAssignmentsInCurrentWeek: Record<string, number> = {}
                  for (const [key, typeId] of Object.entries(assignments)) {
                    if (typeId === id) {
                      lockedAssignmentsInCurrentWeek[key] = typeId
                    }
                  }
                  
                  // Replicate to all existing weeks in store that are NOT in the past
                  Object.keys(savedHours).forEach(weekKey => {
                    if (!isPastWeek(weekKey)) {
                      const weekAssignments = savedHours[weekKey] || {}
                      const merged = { ...weekAssignments, ...lockedAssignmentsInCurrentWeek }
                      updateAssignments(weekKey, merged)
                    }
                  })
                  
                  // Also replicate to nearby future weeks (go forward 12 weeks)
                  let futureWeekKey = currentWeekKey
                  for (let i = 0; i < 12; i++) {
                    futureWeekKey = getNextWeekKey(futureWeekKey)
                    const weekAssignments = getAssignmentsForWeek(futureWeekKey) || {}
                    const merged = { ...weekAssignments, ...lockedAssignmentsInCurrentWeek }
                    updateAssignments(futureWeekKey, merged)
                  }
                }
                
                return next
            })
        }, [assignments, currentWeekKey])

        const changeWeek = useCallback((direction: 'next' | 'prev' | 'current') => {
            let newWeekKey: string
            if (direction === 'next') {
                newWeekKey = getNextWeekKey(currentWeekKey)
            } else if (direction === 'prev') {
                newWeekKey = getPreviousWeekKey(currentWeekKey)
            } else {
                newWeekKey = getCurrentWeek()
            }

            // Clean non-locked assignments for the new week (only keeps locked assignments)
            const cleanedAssignments = cleanNonLockedAssignments(newWeekKey, types)
            
            setCurrentWeek(newWeekKey)
            setCurrentWeekKey(newWeekKey)
            // Update local state with cleaned assignments
            setAssignments({ ...cleanedAssignments })
        }, [currentWeekKey, types])

        const handleClearAllWeek = useCallback(() => {
            // Block clearing in past weeks
            if (isPastWeek(currentWeekKey)) {
                alert('No puedes modificar semanas pasadas')
                return
            }
            if (!confirm('¿Limpiar TODA la semana? Se eliminarán todas las horas.')) return
            clearAllAssignmentsForWeek(currentWeekKey)
            setAssignments({})
        }, [currentWeekKey])

        const handleClearNonLockedWeek = useCallback(() => {
            // Block clearing in past weeks
            if (isPastWeek(currentWeekKey)) {
                alert('No puedes modificar semanas pasadas')
                return
            }
            if (!confirm('¿Limpiar solo las horas NO fijas? Las horas fijas se mantendrán.')) return
            clearNonLockedAssignmentsForWeek(currentWeekKey, types)
            const filtered: Record<string, number> = {}
            for (const [key, typeId] of Object.entries(assignments)) {
                const typeObj = types.find(t => t.id === typeId)
                if (typeObj?.isLocked) {
                    filtered[key] = typeId
                }
            }
            setAssignments(filtered)
        }, [currentWeekKey, types, assignments])

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800">
            <div className="max-w-6xl mx-auto p-6">
                <Header
                    types={types}
                    selectedTypeId={selectedTypeId}
                    onSelectType={setSelectedTypeId}
                    onAddType={addType}
                    onDeleteType={removeType}
                    onToggleLock={toggleLockType}
                    currentWeekKey={currentWeekKey}
                    onChangeWeek={changeWeek}
                    onClearAllWeek={handleClearAllWeek}
                    onClearNonLockedWeek={handleClearNonLockedWeek}
                    hourFormat={hourFormat}
                    onToggleHourFormat={() => setHourFormat(f => f === '24' ? '12' : '24')}
                />
                <div id="planner-root">
                    <Planner
                        types={types}
                        assignments={assignments}
                        onToggleCell={toggleAssignment}
                        selectedTypeId={selectedTypeId}
                        currentWeekKey={currentWeekKey}
                        hourFormat={hourFormat}
                    />
                </div>
            </div>
        </div>
    )
}
