import React, { useState } from 'react'
import { HourType, getWeekDates, getWeekStartDate } from '../store'
import { exportToPDF } from '../utils/exportPdf'

function TypeButton({
  children,
  active = false,
  color,
}: {
  children: React.ReactNode
  active?: boolean
  color?: string
}) {
  return (
    <button
      className={`px-4 py-3 rounded-lg mr-3 border flex items-center space-x-3 ${
        active ? 'bg-sky-500 text-white border-transparent' : 'bg-white text-gray-700 border-gray-200'
      }`}
    >
      {color && <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />}
      <span>{children}</span>
    </button>
  )
}

export default function Header({
  types,
  selectedTypeId,
  onSelectType,
  onAddType,
  onDeleteType,
  onToggleLock,
  currentWeekKey,
  onChangeWeek,
  onClearAllWeek,
  onClearNonLockedWeek,
  hourFormat,
  onToggleHourFormat,
}: {
  types: HourType[]
  selectedTypeId: number | null
  onSelectType: (id: number | null) => void
  onAddType: (name: string, color: string) => void
  onDeleteType: (id: number) => void
  onToggleLock: (id: number) => void
  currentWeekKey: string
  onChangeWeek: (direction: 'next' | 'prev' | 'current') => void
  onClearAllWeek: () => void
  onClearNonLockedWeek: () => void
  hourFormat: '24' | '12'
  onToggleHourFormat: () => void
}) {
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState('#06b6d4')

  function submitNew(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    onAddType(newName.trim(), newColor)
    setNewName('')
    setNewColor('#06b6d4')
    setShowAdd(false)
  }

  const weekDates = getWeekDates(currentWeekKey)
  const weekStart = getWeekStartDate(currentWeekKey)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
  }

  const formatWeekRange = () => {
    return `${formatDate(weekStart)} - ${formatDate(weekEnd)}`
  }

  return (
    <div className="mb-6 no-print">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold">Planning Your Week</h1>
          <p className="text-sm text-gray-500">Organiza tu semana de manera simple</p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-white border rounded-lg px-3 py-2">
            <button
              onClick={() => onChangeWeek('prev')}
              className="px-2 py-1 hover:bg-gray-100 rounded"
              title="Semana anterior"
            >
              ‹
            </button>
            <button
              onClick={() => onChangeWeek('current')}
              className="px-3 py-1 text-sm font-medium hover:bg-gray-100 rounded"
              title="Ir a la semana actual"
            >
              {formatWeekRange()}
            </button>
            <button
              onClick={() => onChangeWeek('next')}
              className="px-2 py-1 hover:bg-gray-100 rounded"
              title="Semana siguiente"
            >
              ›
            </button>
          </div>
          <button
            onClick={onToggleHourFormat}
            className="px-3 py-2 border rounded bg-blue-50 text-blue-700 text-sm hover:bg-blue-100"
            title="Cambiar formato de hora"
          >
            🕐 {hourFormat}H
          </button>
          <button
            onClick={onClearAllWeek}
            className="px-3 py-2 border rounded bg-red-50 text-red-700 text-sm hover:bg-red-100"
            title="Limpiar toda la semana"
          >
            🗑️ Limpiar todo
          </button>
          <button
            onClick={onClearNonLockedWeek}
            className="px-3 py-2 border rounded bg-orange-50 text-orange-700 text-sm hover:bg-orange-100"
            title="Limpiar solo horas no fijas"
          >
            🗑️ Limpiar no fijas
          </button>
          <button
            onClick={exportToPDF}
            className="px-3 py-2 border rounded bg-green-50 text-green-700 text-sm hover:bg-green-100"
            title="Descargar horario como PDF"
          >
            📥 Descargar PDF
          </button>
          <button onClick={() => setShowAdd(s => !s)} className="px-3 py-2 border rounded bg-white text-sm">
            + Agregar tipo
          </button>
        </div>
      </div>

      <div className="mt-6 bg-white p-4 rounded-lg border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center">
            <div className="mr-6 text-sm font-medium text-gray-600">Selecciona el tipo de hora</div>
            <div className="flex items-center space-x-2">
              {types.map(t => (
                <div key={t.id} className="relative">
                  <div onClick={() => onSelectType(t.id)}>
                    <TypeButton active={t.id === selectedTypeId} color={t.color}>
                      {t.name}
                    </TypeButton>
                  </div>
                  {!t.isBuiltin && !t.isLocked && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (!confirm(`¿Eliminar el tipo "${t.name}"? Esto quitará las asignaciones con ese tipo.`)) return
                        onDeleteType(t.id)
                      }}
                      title="Eliminar tipo"
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white border text-xs flex items-center justify-center"
                    >
                      ×
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onToggleLock(t.id)
                    }}
                    title={t.isLocked ? 'Desbloquear tipo' : 'Bloquear tipo'}
                    className={`absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-white border text-xs flex items-center justify-center ${t.isLocked ? 'text-red-600' : 'text-gray-600'}`}
                  >
                    {t.isLocked ? '🔒' : '🔓'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {showAdd && (
            <form onSubmit={submitNew} className="mt-4 md:mt-0 flex items-center space-x-2">
              <input
                className="px-3 py-2 border rounded"
                placeholder="Nombre del tipo"
                value={newName}
                onChange={e => setNewName(e.target.value)}
              />
              <input type="color" value={newColor} onChange={e => setNewColor(e.target.value)} />
              <button type="submit" className="px-3 py-2 bg-sky-500 text-white rounded">
                Guardar
              </button>
              <button type="button" onClick={() => setShowAdd(false)} className="px-3 py-2 border rounded">
                Cancelar
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
