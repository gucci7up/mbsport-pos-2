import React, { useEffect, useMemo, useState } from 'react'

type RaceResultStatus = 'OFICIAL' | 'REVISADO' | 'PENDIENTE'

type DogColorKey = 1 | 2 | 3 | 4 | 5 | 6

interface RaceResult {
  id: number
  date: string
  raceNumber: number
  time: string
  firstPlace: number
  secondPlace: number
  thirdPlace: number
  exacta: string
  trifecta: string
  status: RaceResultStatus
}

const MOCK_RESULTS: RaceResult[] = [
  { id: 1, date: '2026-06-09', raceNumber: 397, time: '12:05:00', firstPlace: 1, secondPlace: 3, thirdPlace: 5, exacta: '1-3', trifecta: '1-3-5', status: 'OFICIAL' },
  { id: 2, date: '2026-06-09', raceNumber: 396, time: '11:52:10', firstPlace: 2, secondPlace: 4, thirdPlace: 6, exacta: '2-4', trifecta: '2-4-6', status: 'OFICIAL' },
  { id: 3, date: '2026-06-09', raceNumber: 395, time: '11:47:33', firstPlace: 5, secondPlace: 1, thirdPlace: 2, exacta: '5-1', trifecta: '5-1-2', status: 'REVISADO' },
  { id: 4, date: '2026-06-09', raceNumber: 394, time: '11:41:22', firstPlace: 3, secondPlace: 6, thirdPlace: 4, exacta: '3-6', trifecta: '3-6-4', status: 'OFICIAL' },
  { id: 5, date: '2026-06-08', raceNumber: 393, time: '18:36:05', firstPlace: 6, secondPlace: 2, thirdPlace: 1, exacta: '6-2', trifecta: '6-2-1', status: 'PENDIENTE' },
  { id: 6, date: '2026-06-08', raceNumber: 392, time: '18:29:18', firstPlace: 4, secondPlace: 5, thirdPlace: 3, exacta: '4-5', trifecta: '4-5-3', status: 'REVISADO' },
  { id: 7, date: '2026-06-08', raceNumber: 391, time: '18:21:44', firstPlace: 1, secondPlace: 6, thirdPlace: 2, exacta: '1-6', trifecta: '1-6-2', status: 'OFICIAL' },
  { id: 8, date: '2026-06-07', raceNumber: 390, time: '17:58:40', firstPlace: 2, secondPlace: 3, thirdPlace: 4, exacta: '2-3', trifecta: '2-3-4', status: 'OFICIAL' },
  { id: 9, date: '2026-06-07', raceNumber: 389, time: '17:45:12', firstPlace: 5, secondPlace: 4, thirdPlace: 1, exacta: '5-4', trifecta: '5-4-1', status: 'REVISADO' },
  { id: 10, date: '2026-06-07', raceNumber: 388, time: '17:30:31', firstPlace: 3, secondPlace: 1, thirdPlace: 6, exacta: '3-1', trifecta: '3-1-6', status: 'OFICIAL' },
  { id: 11, date: '2026-06-06', raceNumber: 387, time: '16:59:04', firstPlace: 4, secondPlace: 2, thirdPlace: 5, exacta: '4-2', trifecta: '4-2-5', status: 'PENDIENTE' },
  { id: 12, date: '2026-06-06', raceNumber: 386, time: '16:40:48', firstPlace: 6, secondPlace: 5, thirdPlace: 2, exacta: '6-5', trifecta: '6-5-2', status: 'OFICIAL' },
]

const DOG_COLORS: Record<DogColorKey, string> = {
  1: '#ff0000',
  2: '#005eff',
  3: '#ffffff',
  4: '#111111',
  5: '#e8760a',
  6: 'stripes',
}

const DOG_TEXT_COLORS: Record<DogColorKey, string> = {
  1: '#ffffff',
  2: '#ffffff',
  3: '#111111',
  4: '#ffffff',
  5: '#ffffff',
  6: '#ff0000',
}

const statusStyle = (status: RaceResultStatus) => {
  if (status === 'OFICIAL') {
    return { color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)', background: 'rgba(10,35,18,0.9)' }
  }
  if (status === 'REVISADO') {
    return { color: '#f5c518', border: '1px solid rgba(245,197,24,0.28)', background: 'rgba(38,30,5,0.88)' }
  }
  return { color: '#ef4444', border: '1px solid rgba(239,68,68,0.28)', background: 'rgba(44,11,11,0.88)' }
}

const formatDateLabel = (date: string) =>
  new Date(`${date}T00:00:00`).toLocaleDateString('es-DO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

const buildSearchableText = (result: RaceResult) =>
  [
    result.raceNumber,
    result.time,
    result.firstPlace,
    result.secondPlace,
    result.thirdPlace,
    result.exacta,
    result.trifecta,
    result.status,
  ]
    .join(' ')
    .toLowerCase()

const DogChip: React.FC<{ dog: number; size?: 'sm' | 'md' }> = ({ dog, size = 'sm' }) => {
  const n = Math.min(6, Math.max(1, dog)) as DogColorKey
  const bg = DOG_COLORS[n]
  const textColor = DOG_TEXT_COLORS[n]
  const isStripes = bg === 'stripes'

  return (
    <span
      className={`results-dog-chip ${size}`}
      style={{
        background: isStripes
          ? 'repeating-linear-gradient(0deg, #111 0px, #111 7px, #fff 7px, #fff 14px)'
          : bg,
        color: textColor,
      }}
    >
      {n}
    </span>
  )
}

const PlayBadge: React.FC<{ label: 'EXACTA' | 'TRIFECTA'; value: string }> = ({ label, value }) => (
  <span className={`results-play-badge ${label === 'EXACTA' ? 'exacta' : 'trifecta'}`}>
    <span className="results-play-label">{label}</span>
    <span className="results-play-value">{value}</span>
  </span>
)

const ResultsPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState('2026-06-09')
  const [raceFilter, setRaceFilter] = useState('')
  const [search, setSearch] = useState('')
  const [selectedRaceId, setSelectedRaceId] = useState<number>(MOCK_RESULTS[0].id)
  const [page, setPage] = useState(1)
  const pageSize = 8

  const filteredResults = useMemo(() => {
    return MOCK_RESULTS
      .filter(result => {
      const matchesDate = selectedDate ? result.date === selectedDate : true
      const matchesRace = raceFilter ? String(result.raceNumber).includes(raceFilter.trim()) : true
      const matchesSearch = search ? buildSearchableText(result).includes(search.trim().toLowerCase()) : true
      return matchesDate && matchesRace && matchesSearch
    })
      .slice()
      .sort((a, b) => {
        if (a.date !== b.date) return a.date < b.date ? 1 : -1
        if (a.raceNumber !== b.raceNumber) return b.raceNumber - a.raceNumber
        return a.time < b.time ? 1 : -1
      })
  }, [raceFilter, search, selectedDate])

  const totalPages = useMemo(() => Math.max(1, Math.ceil(filteredResults.length / pageSize)), [filteredResults.length])

  useEffect(() => {
    setPage(1)
  }, [selectedDate, raceFilter, search])

  useEffect(() => {
    setPage(p => Math.min(Math.max(1, p), totalPages))
  }, [totalPages])

  const pagedResults = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredResults.slice(start, start + pageSize)
  }, [filteredResults, page, pageSize])

  useEffect(() => {
    if (pagedResults.length === 0) {
      setSelectedRaceId(0)
      return
    }

    const stillExists = pagedResults.some(result => result.id === selectedRaceId)
    if (!stillExists) {
      setSelectedRaceId(pagedResults[0].id)
    }
  }, [pagedResults, selectedRaceId])

  const selectedRace = filteredResults.find(result => result.id === selectedRaceId) ?? pagedResults[0] ?? null

  return (
    <div className="results-shell">
      <div className="results-filters pos-panel-surface rounded-lg p-3">
        <div className="results-filter-group">
          <span className="results-filter-label">Fecha</span>
          <input
            type="date"
            value={selectedDate}
            onChange={event => setSelectedDate(event.target.value)}
            className="results-filter-control"
          />
        </div>

        <div className="results-filter-group">
          <span className="results-filter-label">Carrera</span>
          <input
            type="text"
            inputMode="numeric"
            value={raceFilter}
            onChange={event => setRaceFilter(event.target.value)}
            placeholder="Ej. 397"
            className="results-filter-control"
          />
        </div>

        <div className="results-filter-group">
          <span className="results-filter-label">Busqueda</span>
          <input
            type="text"
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Exacta, trifecta, estado..."
            className="results-filter-control"
          />
        </div>
      </div>

      <div className="results-main-grid">
        <div className="results-table-panel pos-panel-surface rounded-lg overflow-hidden">
          <div className="results-panel-header">
            <span className="results-panel-title">CONSULTA HISTORICA</span>
            <div className="results-header-right">
              <span className="results-panel-meta">{filteredResults.length} carreras</span>
              <div className="results-pagination">
                <button
                  type="button"
                  className="results-page-btn"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  ‹
                </button>
                <span className="results-page-indicator">
                  {page}/{totalPages}
                </span>
                <button
                  type="button"
                  className="results-page-btn"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  ›
                </button>
              </div>
            </div>
          </div>

          <div className="results-table-head">
            {['Carrera', 'Hora', 'Primer Lugar', 'Segundo Lugar', 'Tercer Lugar', 'Exacta', 'Trifecta', 'Estado'].map(column => (
              <span key={column}>{column}</span>
            ))}
          </div>

          <div className="results-table-body">
            {filteredResults.length === 0 ? (
              <div className="results-empty-state">SIN RESULTADOS PARA LOS FILTROS ACTUALES</div>
            ) : (
              pagedResults.map(result => {
                const isSelected = result.id === selectedRace?.id
                const statusStyles = statusStyle(result.status)

                return (
                  <button
                    type="button"
                    key={result.id}
                    className={`results-row ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedRaceId(result.id)}
                  >
                    <span className="results-race-number">{result.raceNumber}</span>
                    <span>{result.time}</span>
                    <span><DogChip dog={result.firstPlace} /></span>
                    <span><DogChip dog={result.secondPlace} /></span>
                    <span><DogChip dog={result.thirdPlace} /></span>
                    <span><PlayBadge label="EXACTA" value={result.exacta} /></span>
                    <span><PlayBadge label="TRIFECTA" value={result.trifecta} /></span>
                    <span>
                      <span className="results-status-badge" style={statusStyles}>
                        {result.status}
                      </span>
                    </span>
                  </button>
                )
              })
            )}
          </div>
        </div>

        <div className="results-detail-panel pos-panel-surface rounded-lg overflow-hidden">
          <div className="results-panel-header">
            <span className="results-panel-title">DETALLE DE CARRERA</span>
            <span className="results-panel-meta">{selectedRace ? formatDateLabel(selectedRace.date) : '--/--/----'}</span>
          </div>

          <div className="results-detail-body">
            {selectedRace ? (
              <>
                <div className="results-podium">
                  <div className="results-podium-item">
                    <span className="results-podium-medal">🥇</span>
                    <span className="results-podium-label">PRIMER LUGAR</span>
                    <DogChip dog={selectedRace.firstPlace} size="md" />
                  </div>
                  <div className="results-podium-item">
                    <span className="results-podium-medal">🥈</span>
                    <span className="results-podium-label">SEGUNDO LUGAR</span>
                    <DogChip dog={selectedRace.secondPlace} size="md" />
                  </div>
                  <div className="results-podium-item">
                    <span className="results-podium-medal">🥉</span>
                    <span className="results-podium-label">TERCER LUGAR</span>
                    <DogChip dog={selectedRace.thirdPlace} size="md" />
                  </div>
                </div>

                <div className="results-detail-scroll">
                  <div className="results-detail-grid">
                    <div className="results-detail-item">
                      <span className="results-detail-label">Numero de carrera</span>
                      <span className="results-detail-value">{selectedRace.raceNumber}</span>
                    </div>
                    <div className="results-detail-item">
                      <span className="results-detail-label">Hora</span>
                      <span className="results-detail-value">{selectedRace.time}</span>
                    </div>
                    <div className="results-detail-item">
                      <span className="results-detail-label">Exacta</span>
                      <span className="results-detail-value">
                        <PlayBadge label="EXACTA" value={selectedRace.exacta} />
                      </span>
                    </div>
                    <div className="results-detail-item">
                      <span className="results-detail-label">Trifecta</span>
                      <span className="results-detail-value">
                        <PlayBadge label="TRIFECTA" value={selectedRace.trifecta} />
                      </span>
                    </div>
                    <div className="results-detail-item">
                      <span className="results-detail-label">Estado</span>
                      <span className="results-status-badge" style={statusStyle(selectedRace.status)}>
                        {selectedRace.status}
                      </span>
                    </div>
                  </div>

                  <div className="results-actions-grid">
                    <button type="button" className="results-action-btn">VER REPETICION</button>
                    <button type="button" className="results-action-btn">IMPRIMIR RESULTADO</button>
                    <button type="button" className="results-action-btn">EXPORTAR PDF</button>
                    <button type="button" className="results-action-btn primary">ACTUALIZAR</button>
                  </div>
                </div>
              </>
            ) : (
              <div className="results-empty-state">SELECCIONE UNA CARRERA PARA VER EL DETALLE</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResultsPage
