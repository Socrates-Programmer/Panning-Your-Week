import React, { useState } from 'react'
import { HourType, getWeekDates } from '../store'

const dayNames = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo']

function TimeColumn({ hourFormat }: { hourFormat: '24' | '12' }) {
  const hours = Array.from({ length: 24 }, (_, i) => i)
  
  const formatHour = (h: number) => {
    if (hourFormat === '24') {
      return `${h.toString().padStart(2, '0')}:00`
    } else {
      const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h
      const ampm = h < 12 ? 'AM' : 'PM'
      return `${hour12.toString().padStart(2, '0')}:00 ${ampm}`
    }
  }
  
  return (
    <div className="w-20 pr-4">
      {/* spacer to align with day header */}
      <div className="h-12" />
      {hours.map(h => (
        <div key={h} className="h-12 text-xs text-gray-500 flex items-center justify-end pr-2">
          {formatHour(h)}
        </div>
      ))}
    </div>
  )
}

function hexToRgba(hex: string, alpha = 0.15) {
  const h = hex.replace('#','')
  const bigint = parseInt(h.length === 3 ? h.split('').map(c=>c+c).join('') : h, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export default function Planner({
  types,
  assignments,
  onToggleCell,
  selectedTypeId,
  currentWeekKey,
  hourFormat,
}: {
  types: HourType[]
  assignments: Record<string, number>
  onToggleCell: (dayIndex: number, hour: number) => void
  selectedTypeId: number | null
  currentWeekKey: string
  hourFormat: '24' | '12'
}) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<{ day: number; hour: number } | null>(null)
  const [dragCells, setDragCells] = useState<Set<string>>(new Set())
  const [dragDirection, setDragDirection] = useState<'horizontal' | 'vertical' | null>(null)

  const weekDates = getWeekDates(currentWeekKey)
  
  const formatDayHeader = (date: Date, dayName: string) => {
    const day = date.getDate()
    const month = date.toLocaleDateString('es-ES', { month: 'short' })
    return (
      <div>
        <div className="font-medium">{dayName}</div>
        <div className="text-xs text-gray-500">{day} {month}</div>
      </div>
    )
  }

  const handleMouseDown = (dayIdx: number, hour: number) => {
    setIsDragging(true)
    setDragStart({ day: dayIdx, hour })
    setDragCells(new Set([`${dayIdx}-${hour}`]))
  }

  const handleMouseEnter = (dayIdx: number, hour: number) => {
    if (!isDragging || !dragStart) return
    
    const startDay = dragStart.day
    const startHour = dragStart.hour
    
    // Detectar dirección: diferencia en días vs diferencia en horas
    const dayDiff = Math.abs(dayIdx - startDay)
    const hourDiff = Math.abs(hour - startHour)
    
    // Si aún no se ha determinado la dirección, establecerla
    let currentDirection = dragDirection
    if (!dragDirection) {
      if (dayDiff > 0 && hourDiff === 0) {
        currentDirection = 'horizontal'
        setDragDirection('horizontal')
      } else if (hourDiff > 0 && dayDiff === 0) {
        currentDirection = 'vertical'
        setDragDirection('vertical')
      } else if (dayDiff > 0 || hourDiff > 0) {
        // Si se mueve en ambas direcciones, determinar cuál es más significativa
        currentDirection = dayDiff > hourDiff ? 'horizontal' : 'vertical'
        setDragDirection(currentDirection)
      }
      return
    }
    
    const newDragCells = new Set<string>()
    
    // Solo permitir movimiento en la dirección determinada
    if (currentDirection === 'horizontal' && hour === startHour) {
      // Drag horizontal: misma hora, múltiples días
      const minDay = Math.min(startDay, dayIdx)
      const maxDay = Math.max(startDay, dayIdx)
      for (let d = minDay; d <= maxDay; d++) {
        newDragCells.add(`${d}-${startHour}`)
      }
    } else if (currentDirection === 'vertical' && dayIdx === startDay) {
      // Drag vertical: mismo día, múltiples horas
      const minHour = Math.min(startHour, hour)
      const maxHour = Math.max(startHour, hour)
      for (let h = minHour; h <= maxHour; h++) {
        newDragCells.add(`${startDay}-${h}`)
      }
    }
    // Si no cumple con la dirección, no agregar celdas
    
    setDragCells(newDragCells)
  }

  const handleMouseUp = () => {
    if (isDragging && dragCells.size > 0) {
      // Aplicar el tipo seleccionado a todas las celdas en dragCells SOLO aquí, al soltar
      dragCells.forEach(cellKey => {
        const [dayStr, hourStr] = cellKey.split('-')
        onToggleCell(parseInt(dayStr), parseInt(hourStr))
      })
    }
    
    setIsDragging(false)
    setDragStart(null)
    setDragCells(new Set())
    setDragDirection(null)
  }

  return (
    <div className="mt-6 bg-white rounded-lg border border-gray-100 p-4" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      <div className="overflow-x-auto">
        <div className="flex">
          <TimeColumn hourFormat={hourFormat} />
          <div className="flex-1">
            <div className="grid grid-cols-7 gap-0 border-l border-gray-100">
              {dayNames.map((dayName, dayIdx) => (
                <div key={dayName} className="border-r border-gray-100">
                  <div className="h-12 flex items-center justify-center text-sm text-gray-600 bg-gray-50 border-b border-gray-100">
                    {formatDayHeader(weekDates[dayIdx], dayName)}
                  </div>
                  <div>
                    {Array.from({ length: 24 }, (_, i) => {
                      const key = `${dayIdx}-${i}`
                      const assignedTypeId = assignments[key]
                      const assigned = types.find(t => t.id === assignedTypeId)
                      const isSelected = assignedTypeId === selectedTypeId
                      const isDraggingOver = dragCells.has(key)
                      const bg = isDraggingOver 
                        ? hexToRgba(types.find(t => t.id === selectedTypeId)?.color || '#ccc', 0.3)
                        : assigned ? hexToRgba(assigned.color, 0.18) : undefined
                      return (
                        <div
                          key={i}
                          onMouseDown={() => handleMouseDown(dayIdx, i)}
                          onMouseEnter={() => handleMouseEnter(dayIdx, i)}
                          className={`h-12 border-b border-dashed border-gray-100 cursor-pointer relative ${isDraggingOver ? 'opacity-75' : ''}`}
                          style={{ backgroundColor: bg }}
                          title={assigned ? assigned.name : ''}
                        >
                          <div className="h-full flex items-center px-2">
                            {assigned ? (
                              <span
                                className="text-xs font-medium text-white px-2 py-0.5 rounded-md overflow-hidden whitespace-nowrap text-ellipsis inline-flex items-center space-x-1"
                                style={{ backgroundColor: assigned.color }}
                              >
                                <span className="text-xs">{assigned.name}</span>
                                {assigned.isLocked && <span className="ml-1 text-[10px]">🔒</span>}
                              </span>
                            ) : (
                              // when no assignment, optionally show a thin marker for selected type
                              isSelected && selectedTypeId && (
                                <div className="w-full h-full" />
                              )
                            )}
                          </div>
                          {/* optional small left marker when selected and no assigned */}
                          {isSelected && !assigned && (
                            <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: types.find(t => t.id === selectedTypeId)?.color }} />
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
