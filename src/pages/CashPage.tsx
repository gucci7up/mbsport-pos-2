import React, { useEffect, useMemo, useState } from 'react'

type MovementType = 'VENTA' | 'PREMIO' | 'ANULACION'

interface CashMovement {
  id: number
  ticket: number
  date: string
  time: string
  type: MovementType
  agency: string
  user: string
  amount: number
}

interface HourBucket {
  hour: string
  sales: number
}

interface AgencySalesRow {
  agency: string
  sales: number
}

const KNOWN_AGENCIES = ['AGENCIA DEMO', 'AGENCIA CENTRO', 'AGENCIA NORTE', 'AGENCIA ESTE', 'AGENCIA SUR'] as const

const MOCK_MOVEMENTS: CashMovement[] = [
  { id: 1, ticket: 881151615613, date: '2026-06-10', time: '08:10:12', type: 'VENTA', agency: 'AGENCIA DEMO', user: 'admin', amount: 500 },
  { id: 2, ticket: 881151615614, date: '2026-06-10', time: '08:42:08', type: 'VENTA', agency: 'AGENCIA DEMO', user: 'admin', amount: 300 },
  { id: 3, ticket: 881151615615, date: '2026-06-10', time: '09:05:55', type: 'PREMIO', agency: 'AGENCIA DEMO', user: 'admin', amount: 980 },
  { id: 4, ticket: 881151615616, date: '2026-06-10', time: '09:24:30', type: 'VENTA', agency: 'AGENCIA DEMO', user: 'operador1', amount: 450 },
  { id: 5, ticket: 881151615617, date: '2026-06-10', time: '09:47:20', type: 'ANULACION', agency: 'AGENCIA DEMO', user: 'operador2', amount: 600 },
  { id: 6, ticket: 881151615618, date: '2026-06-10', time: '10:15:11', type: 'VENTA', agency: 'AGENCIA CENTRO', user: 'admin', amount: 200 },
  { id: 7, ticket: 881151615619, date: '2026-06-10', time: '10:33:04', type: 'VENTA', agency: 'AGENCIA CENTRO', user: 'operador1', amount: 350 },
  { id: 8, ticket: 881151615620, date: '2026-06-10', time: '11:03:18', type: 'PREMIO', agency: 'AGENCIA CENTRO', user: 'operador2', amount: 1600 },
  { id: 9, ticket: 881151615621, date: '2026-06-10', time: '11:35:40', type: 'VENTA', agency: 'AGENCIA NORTE', user: 'admin', amount: 400 },
  { id: 10, ticket: 881151615622, date: '2026-06-10', time: '12:01:06', type: 'VENTA', agency: 'AGENCIA NORTE', user: 'operador1', amount: 220 },
  { id: 11, ticket: 881151615623, date: '2026-06-10', time: '12:16:19', type: 'ANULACION', agency: 'AGENCIA NORTE', user: 'operador2', amount: 500 },
  { id: 12, ticket: 881151615624, date: '2026-06-10', time: '12:42:44', type: 'VENTA', agency: 'AGENCIA DEMO', user: 'admin', amount: 560 },
  { id: 13, ticket: 881151615625, date: '2026-06-10', time: '13:08:07', type: 'VENTA', agency: 'AGENCIA CENTRO', user: 'admin', amount: 610 },
  { id: 14, ticket: 881151615626, date: '2026-06-10', time: '13:25:13', type: 'PREMIO', agency: 'AGENCIA NORTE', user: 'admin', amount: 1250 },
  { id: 15, ticket: 881151615627, date: '2026-06-10', time: '14:10:54', type: 'VENTA', agency: 'AGENCIA DEMO', user: 'operador1', amount: 720 },
  { id: 16, ticket: 881151615628, date: '2026-06-10', time: '14:36:41', type: 'VENTA', agency: 'AGENCIA DEMO', user: 'admin', amount: 410 },
  { id: 17, ticket: 881151615629, date: '2026-06-10', time: '15:02:11', type: 'VENTA', agency: 'AGENCIA CENTRO', user: 'operador2', amount: 390 },
  { id: 18, ticket: 881151615630, date: '2026-06-10', time: '15:20:55', type: 'PREMIO', agency: 'AGENCIA DEMO', user: 'admin', amount: 730 },
  { id: 19, ticket: 881151615631, date: '2026-06-09', time: '18:05:10', type: 'VENTA', agency: 'AGENCIA DEMO', user: 'admin', amount: 460 },
  { id: 20, ticket: 881151615632, date: '2026-06-09', time: '18:32:46', type: 'VENTA', agency: 'AGENCIA CENTRO', user: 'operador1', amount: 580 },
  { id: 21, ticket: 881151615633, date: '2026-06-09', time: '18:51:22', type: 'PREMIO', agency: 'AGENCIA DEMO', user: 'admin', amount: 910 },
  { id: 22, ticket: 881151615634, date: '2026-06-09', time: '19:15:03', type: 'ANULACION', agency: 'AGENCIA NORTE', user: 'operador2', amount: 340 },
]

const currency = (value: number) => `RD$ ${value.toLocaleString('es-DO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

const formatDateLabel = (date: string) =>
  new Date(`${date}T00:00:00`).toLocaleDateString('es-DO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

const typeStyle = (type: MovementType) => {
  if (type === 'VENTA') return { color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)', background: 'rgba(10,35,18,0.9)' }
  if (type === 'PREMIO') return { color: '#ef4444', border: '1px solid rgba(239,68,68,0.28)', background: 'rgba(44,11,11,0.88)' }
  return { color: '#f5c518', border: '1px solid rgba(245,197,24,0.28)', background: 'rgba(38,30,5,0.88)' }
}

const buildSearchableText = (movement: CashMovement) =>
  [movement.date, movement.time, movement.ticket, movement.type, movement.agency, movement.user, movement.amount]
    .join(' ')
    .toLowerCase()

const downloadTextFile = (content: string, filename: string, mime: string) => {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

const printHtml = (title: string, htmlBody: string) => {
  const w = window.open('', '_blank', 'noopener,noreferrer,width=900,height=700')
  if (!w) return
  w.document.open()
  w.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <meta charset="utf-8" />
        <style>
          body { font-family: "Roboto Mono", monospace; background: #fff; color: #000; margin: 16px; }
          h1 { font-family: "Barlow Condensed", sans-serif; letter-spacing: 0.08em; font-weight: 900; font-size: 18px; margin: 0 0 10px; }
          .muted { color: #444; font-size: 12px; margin-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th, td { border-bottom: 1px solid #ddd; padding: 8px 6px; text-align: left; vertical-align: top; }
          th { font-family: "Barlow Condensed", sans-serif; text-transform: uppercase; letter-spacing: 0.08em; font-size: 12px; }
          .right { text-align: right; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        ${htmlBody}
        <script>
          window.onload = () => { window.focus(); window.print(); setTimeout(() => window.close(), 50); }
        </script>
      </body>
    </html>
  `)
  w.document.close()
}

const summarizeMovements = (rows: CashMovement[]) => {
  const sales = rows.filter(r => r.type === 'VENTA').reduce((acc, r) => acc + r.amount, 0)
  const prizes = rows.filter(r => r.type === 'PREMIO').reduce((acc, r) => acc + r.amount, 0)
  const cancellations = rows.filter(r => r.type === 'ANULACION').reduce((acc, r) => acc + r.amount, 0)
  const ticketsEmitted = rows.filter(r => r.type === 'VENTA').length
  const ticketsWinners = rows.filter(r => r.type === 'PREMIO').length
  const ticketsVoided = rows.filter(r => r.type === 'ANULACION').length
  const grossProfit = sales - prizes
  const netProfit = sales - prizes - cancellations
  return { sales, prizes, cancellations, ticketsEmitted, ticketsWinners, ticketsVoided, grossProfit, netProfit }
}

const buildHourlySales = (rows: CashMovement[]): HourBucket[] => {
  const map = new Map<string, number>()
  rows.forEach(row => {
    if (row.type !== 'VENTA') return
    const hour = row.time.slice(0, 2)
    map.set(hour, (map.get(hour) ?? 0) + row.amount)
  })
  return Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([hour, sales]) => ({ hour, sales }))
}

const CashPage: React.FC = () => {
  const todayISO = useMemo(() => {
    const d = new Date()
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }, [])

  const [draft, setDraft] = useState({
    from: todayISO,
    to: todayISO,
    agency: 'TODAS',
    user: 'TODOS',
    type: 'TODOS' as 'TODOS' | MovementType,
    search: '',
  })
  const [applied, setApplied] = useState(draft)
  const [selectedMovementId, setSelectedMovementId] = useState<number>(MOCK_MOVEMENTS[0]?.id ?? 0)
  const [lastRefresh, setLastRefresh] = useState(() => new Date())

  const agencies = useMemo(() => Array.from(new Set(MOCK_MOVEMENTS.map(m => m.agency))).sort(), [])
  const users = useMemo(() => Array.from(new Set(MOCK_MOVEMENTS.map(m => m.user))).sort(), [])

  const filteredMovements = useMemo(() => {
    const from = applied.from ? new Date(`${applied.from}T00:00:00`).getTime() : null
    const to = applied.to ? new Date(`${applied.to}T23:59:59`).getTime() : null
    const searchLower = applied.search.trim().toLowerCase()

    return MOCK_MOVEMENTS
      .filter(m => {
        const ts = new Date(`${m.date}T${m.time}`).getTime()
        const matchesFrom = from ? ts >= from : true
        const matchesTo = to ? ts <= to : true
        const matchesAgency = applied.agency !== 'TODAS' ? m.agency === applied.agency : true
        const matchesUser = applied.user !== 'TODOS' ? m.user === applied.user : true
        const matchesType = applied.type !== 'TODOS' ? m.type === applied.type : true
        const matchesSearch = searchLower ? buildSearchableText(m).includes(searchLower) : true
        return matchesFrom && matchesTo && matchesAgency && matchesUser && matchesType && matchesSearch
      })
      .slice()
      .sort((a, b) => {
        if (a.date !== b.date) return a.date < b.date ? 1 : -1
        if (a.time !== b.time) return a.time < b.time ? 1 : -1
        return b.id - a.id
      })
  }, [applied])

  useEffect(() => {
    if (filteredMovements.length === 0) {
      setSelectedMovementId(0)
      return
    }
    if (!filteredMovements.some(m => m.id === selectedMovementId)) {
      setSelectedMovementId(filteredMovements[0].id)
    }
  }, [filteredMovements, selectedMovementId])

  const selectedMovement = useMemo(
    () => filteredMovements.find(m => m.id === selectedMovementId) ?? filteredMovements[0] ?? null,
    [filteredMovements, selectedMovementId],
  )

  const dayMovements = useMemo(() => MOCK_MOVEMENTS.filter(m => m.date === todayISO), [todayISO])
  const daySummary = useMemo(() => summarizeMovements(dayMovements), [dayMovements])
  const filteredSummary = useMemo(() => summarizeMovements(filteredMovements), [filteredMovements])
  const chartData = useMemo(() => buildHourlySales(filteredMovements), [filteredMovements])
  const chartMax = useMemo(() => Math.max(1, ...chartData.map(item => item.sales)), [chartData])
  const topAgencies = useMemo<AgencySalesRow[]>(() => {
    return KNOWN_AGENCIES
      .map(agency => ({
        agency,
        sales: filteredMovements
          .filter(row => row.type === 'VENTA' && row.agency === agency)
          .reduce((acc, row) => acc + row.amount, 0),
      }))
      .sort((a, b) => {
        if (a.sales !== b.sales) return b.sales - a.sales
        return a.agency.localeCompare(b.agency)
      })
      .slice(0, 5)
  }, [filteredMovements])
  const topAgencyMax = useMemo(() => Math.max(1, ...topAgencies.map(item => item.sales)), [topAgencies])
  const balancePct = useMemo(() => {
    if (filteredSummary.sales <= 0) return 0
    return Math.max(0, Math.min(100, Math.round((filteredSummary.netProfit / filteredSummary.sales) * 100)))
  }, [filteredSummary.netProfit, filteredSummary.sales])

  const runningBalanceRows = useMemo(() => {
    let balance = 0
    const chronological = [...filteredMovements].sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date)
      if (a.time !== b.time) return a.time.localeCompare(b.time)
      return a.id - b.id
    })

    const withBalance = chronological.map(row => {
      if (row.type === 'VENTA') balance += row.amount
      else if (row.type === 'PREMIO') balance -= row.amount
      else balance -= row.amount
      return { ...row, balance }
    })

    return withBalance.reverse()
  }, [filteredMovements])

  const exportExcel = () => {
    const header = ['Fecha', 'Hora', 'Ticket', 'Tipo', 'Agencia', 'Usuario', 'Monto', 'Balance']
    const rows = runningBalanceRows.map(row => [
      row.date,
      row.time,
      String(row.ticket),
      row.type,
      row.agency,
      row.user,
      String(row.amount),
      String(row.balance),
    ])
    const csv = [header, ...rows]
      .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    downloadTextFile(csv, `caja_${applied.from || 'desde'}_${applied.to || 'hasta'}.csv`, 'text/csv;charset=utf-8;')
  }

  const exportPdf = () => {
    const rowsHtml = runningBalanceRows.slice(0, 500).map(row => `
      <tr>
        <td>${formatDateLabel(row.date)}</td>
        <td>${row.time}</td>
        <td>${row.ticket}</td>
        <td>${row.type}</td>
        <td>${row.agency}</td>
        <td>${row.user}</td>
        <td class="right">${currency(row.amount)}</td>
        <td class="right">${currency(row.balance)}</td>
      </tr>
    `).join('')

    const body = `
      <h1>MOVIMIENTOS DE CAJA</h1>
      <div class="muted">Rango: ${applied.from || '—'} a ${applied.to || '—'} · Registros: ${runningBalanceRows.length} · Generado: ${new Date().toLocaleString('es-DO')}</div>
      <table>
        <thead>
          <tr>
            <th>Fecha</th><th>Hora</th><th>Ticket</th><th>Tipo</th><th>Agencia</th><th>Usuario</th><th class="right">Monto</th><th class="right">Balance</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    `

    printHtml('Caja - Exportar PDF', body)
  }

  const printCut = () => {
    const body = `
      <h1>CORTE DE CAJA</h1>
      <div class="muted">Agencia: ${selectedMovement?.agency ?? 'MULTIPLE'} · Usuario: ${selectedMovement?.user ?? 'MULTIPLE'} · Fecha: ${new Date().toLocaleString('es-DO')}</div>
      <table>
        <tbody>
          <tr><th>Ventas Totales</th><td class="right">${currency(filteredSummary.sales)}</td></tr>
          <tr><th>Premios Pagados</th><td class="right">${currency(filteredSummary.prizes)}</td></tr>
          <tr><th>Tickets Emitidos</th><td class="right">${filteredSummary.ticketsEmitted}</td></tr>
          <tr><th>Tickets Ganadores</th><td class="right">${filteredSummary.ticketsWinners}</td></tr>
          <tr><th>Tickets Anulados</th><td class="right">${filteredSummary.ticketsVoided}</td></tr>
          <tr><th>Balance Neto</th><td class="right">${currency(filteredSummary.netProfit)}</td></tr>
        </tbody>
      </table>
    `
    printHtml('Corte de Caja', body)
  }

  return (
    <div className="cash-shell">
      <div className="cash-summary-grid">
        <div className="cash-summary-card">
          <span className="cash-summary-label">VENTAS DEL DIA</span>
          <span className="cash-summary-value">{currency(daySummary.sales)}</span>
        </div>
        <div className="cash-summary-card">
          <span className="cash-summary-label">PREMIOS PAGADOS</span>
          <span className="cash-summary-value">{currency(daySummary.prizes)}</span>
        </div>
        <div className="cash-summary-card">
          <span className="cash-summary-label">TICKETS EMITIDOS</span>
          <span className="cash-summary-value">{daySummary.ticketsEmitted.toLocaleString('es-DO')}</span>
        </div>
        <div className="cash-summary-card">
          <span className="cash-summary-label">TICKETS GANADORES</span>
          <span className="cash-summary-value">{daySummary.ticketsWinners.toLocaleString('es-DO')}</span>
        </div>
        <div className="cash-summary-card">
          <span className="cash-summary-label">TICKETS ANULADOS</span>
          <span className="cash-summary-value">{daySummary.ticketsVoided.toLocaleString('es-DO')}</span>
        </div>
        <div className="cash-summary-card">
          <span className="cash-summary-label">BALANCE NETO</span>
          <span className="cash-summary-value">{currency(daySummary.netProfit)}</span>
        </div>
      </div>

      <div className="cash-filters pos-panel-surface rounded-lg p-3">
        <div className="cash-filter-group">
          <span className="results-filter-label">Fecha Desde</span>
          <input type="date" value={draft.from} onChange={e => setDraft(s => ({ ...s, from: e.target.value }))} className="results-filter-control" />
        </div>
        <div className="cash-filter-group">
          <span className="results-filter-label">Fecha Hasta</span>
          <input type="date" value={draft.to} onChange={e => setDraft(s => ({ ...s, to: e.target.value }))} className="results-filter-control" />
        </div>
        <div className="cash-filter-group">
          <span className="results-filter-label">Agencia</span>
          <select value={draft.agency} onChange={e => setDraft(s => ({ ...s, agency: e.target.value }))} className="results-filter-control">
            <option value="TODAS">TODAS</option>
            {agencies.map(agency => <option key={agency} value={agency}>{agency}</option>)}
          </select>
        </div>
        <div className="cash-filter-group">
          <span className="results-filter-label">Usuario</span>
          <select value={draft.user} onChange={e => setDraft(s => ({ ...s, user: e.target.value }))} className="results-filter-control">
            <option value="TODOS">TODOS</option>
            {users.map(user => <option key={user} value={user}>{user}</option>)}
          </select>
        </div>
        <div className="cash-filter-group">
          <span className="results-filter-label">Tipo Movimiento</span>
          <select value={draft.type} onChange={e => setDraft(s => ({ ...s, type: e.target.value as 'TODOS' | MovementType }))} className="results-filter-control">
            <option value="TODOS">TODOS</option>
            <option value="VENTA">VENTA</option>
            <option value="PREMIO">PREMIO</option>
            <option value="ANULACION">ANULACION</option>
          </select>
        </div>
        <div className="cash-filter-actions">
          <button
            type="button"
            className="special-btn rounded-lg flex items-center justify-center"
            style={{ height: '40px', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, letterSpacing: '0.14em' }}
            onClick={() => setApplied(draft)}
          >
            BUSCAR
          </button>
          <button
            type="button"
            className="btn-imprimir rounded-lg flex items-center justify-center"
            style={{ height: '40px', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, letterSpacing: '0.14em' }}
            onClick={() => {
              const reset = { from: todayISO, to: todayISO, agency: 'TODAS', user: 'TODOS', type: 'TODOS' as const, search: '' }
              setDraft(reset)
              setApplied(reset)
              setLastRefresh(new Date())
            }}
          >
            ACTUALIZAR
          </button>
        </div>
      </div>

      <div className="cash-main-grid">
        <div className="cash-table-panel pos-panel-surface rounded-lg overflow-hidden">
          <div className="results-panel-header">
            <span className="results-panel-title">MOVIMIENTOS DE CAJA</span>
            <span className="results-panel-meta">{runningBalanceRows.length} registros · {lastRefresh.toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          </div>

          <div className="cash-table-head">
            {['Fecha', 'Hora', 'Ticket', 'Tipo', 'Agencia', 'Usuario', 'Monto', 'Balance'].map(col => (
              <span key={col}>{col}</span>
            ))}
          </div>

          <div className="cash-table-body">
            {runningBalanceRows.length === 0 ? (
              <div className="results-empty-state">SIN MOVIMIENTOS PARA LOS FILTROS ACTUALES</div>
            ) : (
              runningBalanceRows.map(row => (
                <button
                  key={row.id}
                  type="button"
                  className={`cash-row ${row.id === selectedMovementId ? 'selected' : ''}`}
                  onClick={() => setSelectedMovementId(row.id)}
                >
                  <span className="cash-cell">{formatDateLabel(row.date)}</span>
                  <span className="cash-cell">{row.time}</span>
                  <span className="cash-cell cash-ticket">{row.ticket}</span>
                  <span className="cash-cell">
                    <span className="results-status-badge" style={typeStyle(row.type)}>{row.type}</span>
                  </span>
                  <span className="cash-cell cash-agency">{row.agency}</span>
                  <span className="cash-cell">{row.user}</span>
                  <span className="cash-cell cash-num">{currency(row.amount)}</span>
                  <span className="cash-cell cash-num" style={{ color: row.balance >= 0 ? '#22c55e' : '#ef4444' }}>{currency(row.balance)}</span>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="cash-secondary-grid">
          <div className="cash-chart-panel pos-panel-surface rounded-lg overflow-hidden">
            <div className="results-panel-header">
              <span className="results-panel-title">COMPORTAMIENTO DEL DIA</span>
              <span className="results-panel-meta">Ventas por hora</span>
            </div>
            <div className="cash-chart-body">
              {chartData.length === 0 ? (
                <div className="results-empty-state">SIN DATOS PARA EL GRAFICO</div>
              ) : (
                chartData.map(item => (
                  <div key={item.hour} className="cash-chart-row">
                    <span className="cash-chart-hour">{item.hour}:00</span>
                    <div className="cash-chart-bar-track">
                      <div
                        className="cash-chart-bar-fill"
                        style={{ width: `${Math.max(10, (item.sales / chartMax) * 100)}%` }}
                      />
                    </div>
                    <span className="cash-chart-value">{currency(item.sales)}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="cash-top-panel pos-panel-surface rounded-lg overflow-hidden">
            <div className="results-panel-header">
              <span className="results-panel-title">TOP AGENCIAS</span>
              <span className="results-panel-meta">Top 5 ventas</span>
            </div>
            <div className="cash-top-body">
              {topAgencies.map((agency, index) => (
                <div key={agency.agency} className="cash-top-row">
                  <span className="cash-top-rank">{index + 1}</span>
                  <div className="cash-top-main">
                    <div className="cash-top-line">
                      <span className="cash-top-name">{agency.agency}</span>
                      <span className="cash-top-value">{currency(agency.sales)}</span>
                    </div>
                    <div className="cash-top-bar-track">
                      <div
                        className="cash-top-bar-fill"
                        style={{ width: `${agency.sales <= 0 ? 8 : Math.max(8, (agency.sales / topAgencyMax) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="cash-right-panel pos-panel-surface rounded-lg overflow-hidden">
            <div className="results-panel-header">
              <span className="results-panel-title">RESUMEN OPERATIVO</span>
              <span className="results-panel-meta">Balance diario</span>
            </div>

            <div className="cash-right-body">
              <div className="cash-summary-detail-grid">
                <div className="cash-summary-detail-item">
                  <span className="cash-summary-detail-label">Ventas</span>
                  <span className="cash-summary-detail-value">{currency(filteredSummary.sales)}</span>
                </div>
                <div className="cash-summary-detail-item">
                  <span className="cash-summary-detail-label">Premios</span>
                  <span className="cash-summary-detail-value negative">{currency(filteredSummary.prizes)}</span>
                </div>
                <div className="cash-summary-detail-item">
                  <span className="cash-summary-detail-label">Emitidos</span>
                  <span className="cash-summary-detail-value neutral">{filteredSummary.ticketsEmitted.toLocaleString('es-DO')}</span>
                </div>
                <div className="cash-summary-detail-item">
                  <span className="cash-summary-detail-label">Ganadores</span>
                  <span className="cash-summary-detail-value positive">{filteredSummary.ticketsWinners.toLocaleString('es-DO')}</span>
                </div>
                <div className="cash-summary-detail-item">
                  <span className="cash-summary-detail-label">Anulados</span>
                  <span className="cash-summary-detail-value warning">{filteredSummary.ticketsVoided.toLocaleString('es-DO')}</span>
                </div>
                <div className="cash-summary-detail-item">
                  <span className="cash-summary-detail-label">Balance Neto</span>
                  <span className={`cash-summary-detail-value ${filteredSummary.netProfit >= 0 ? 'positive' : 'negative'}`}>{currency(filteredSummary.netProfit)}</span>
                </div>
              </div>

              <div className="cash-balance-indicator">
                <div className="cash-balance-head">
                  <span className="cash-balance-label">INDICADOR DE BALANCE</span>
                  <span className={`cash-balance-value ${filteredSummary.netProfit >= 0 ? 'positive' : 'negative'}`}>{balancePct}%</span>
                </div>
                <div className="cash-balance-track">
                  <div
                    className={`cash-balance-fill ${filteredSummary.netProfit >= 0 ? 'positive' : 'negative'}`}
                    style={{ width: `${Math.max(8, balancePct)}%` }}
                  />
                </div>
              </div>

              <div className="cash-quick-actions">
                <div className="cash-actions-grid">
                  <button
                    type="button"
                    className="special-btn rounded-lg flex items-center justify-center"
                    style={{ minHeight: '38px', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, letterSpacing: '0.12em' }}
                    onClick={printCut}
                  >
                    IMPRIMIR CORTE
                  </button>
                  <button
                    type="button"
                    className="special-btn rounded-lg flex items-center justify-center"
                    style={{ minHeight: '38px', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, letterSpacing: '0.12em' }}
                    onClick={exportPdf}
                  >
                    EXPORTAR PDF
                  </button>
                  <button
                    type="button"
                    className="special-btn rounded-lg flex items-center justify-center"
                    style={{ minHeight: '38px', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, letterSpacing: '0.12em' }}
                    onClick={exportExcel}
                  >
                    EXPORTAR EXCEL
                  </button>
                  <button
                    type="button"
                    className="btn-imprimir rounded-lg flex items-center justify-center"
                    style={{ minHeight: '38px', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, letterSpacing: '0.12em' }}
                    onClick={() => {
                      setApplied(draft)
                      setLastRefresh(new Date())
                    }}
                  >
                    ACTUALIZAR
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="cash-bottom-summary pos-panel-surface rounded-lg">
        <div className="cash-bottom-item">
          <span className="cash-bottom-label">Ventas</span>
          <span className="cash-bottom-value">{currency(filteredSummary.sales)}</span>
        </div>
        <div className="cash-bottom-item">
          <span className="cash-bottom-label">Premios</span>
          <span className="cash-bottom-value">{currency(filteredSummary.prizes)}</span>
        </div>
        <div className="cash-bottom-item">
          <span className="cash-bottom-label">Anulaciones</span>
          <span className="cash-bottom-value">{currency(filteredSummary.cancellations)}</span>
        </div>
        <div className="cash-bottom-item">
          <span className="cash-bottom-label">Ganancia Bruta</span>
          <span className="cash-bottom-value">{currency(filteredSummary.grossProfit)}</span>
        </div>
        <div className="cash-bottom-item">
          <span className="cash-bottom-label">Ganancia Neta</span>
          <span className={`cash-bottom-value ${filteredSummary.netProfit >= 0 ? 'positive' : 'negative'}`}>{currency(filteredSummary.netProfit)}</span>
        </div>
      </div>
    </div>
  )
}

export default CashPage
