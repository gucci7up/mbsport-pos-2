import React, { useEffect, useMemo, useState } from 'react'

type TicketStatus = 'VENDIDO' | 'GANADOR' | 'PAGADO' | 'ANULADO'

interface SaleTicket {
  id: number
  date: string
  time: string
  agency: string
  user: string
  plays: string[]
  amount: number
  prize: number
  status: TicketStatus
}

const MOCK_TICKETS: SaleTicket[] = [
  { id: 881151615613, date: '2026-06-10', time: '12:08:14', agency: 'AGENCIA DEMO', user: 'admin', plays: ['1-3', '1-3-5', '2-4'], amount: 500, prize: 0, status: 'VENDIDO' },
  { id: 881151615614, date: '2026-06-10', time: '12:06:02', agency: 'AGENCIA DEMO', user: 'admin', plays: ['3-6', '5-1-2'], amount: 300, prize: 1250, status: 'GANADOR' },
  { id: 881151615615, date: '2026-06-10', time: '12:04:37', agency: 'AGENCIA DEMO', user: 'admin', plays: ['2-4', '1-6'], amount: 250, prize: 980, status: 'PAGADO' },
  { id: 881151615616, date: '2026-06-10', time: '12:03:05', agency: 'AGENCIA DEMO', user: 'operador1', plays: ['4', '4-2', '4-2-5'], amount: 450, prize: 0, status: 'VENDIDO' },
  { id: 881151615617, date: '2026-06-10', time: '11:59:41', agency: 'AGENCIA DEMO', user: 'operador2', plays: ['6-2', '6-2-1'], amount: 600, prize: 0, status: 'ANULADO' },
  { id: 881151615618, date: '2026-06-10', time: '11:57:20', agency: 'AGENCIA CENTRO', user: 'admin', plays: ['1', '1-3'], amount: 200, prize: 0, status: 'VENDIDO' },
  { id: 881151615619, date: '2026-06-09', time: '18:30:55', agency: 'AGENCIA CENTRO', user: 'operador1', plays: ['2-4', '2-4-6'], amount: 350, prize: 0, status: 'VENDIDO' },
  { id: 881151615620, date: '2026-06-09', time: '18:26:11', agency: 'AGENCIA CENTRO', user: 'operador2', plays: ['5-1', '5-1-2'], amount: 300, prize: 1600, status: 'GANADOR' },
  { id: 881151615621, date: '2026-06-09', time: '18:21:40', agency: 'AGENCIA NORTE', user: 'admin', plays: ['3-1', '3-1-6'], amount: 400, prize: 1400, status: 'PAGADO' },
  { id: 881151615622, date: '2026-06-08', time: '17:59:02', agency: 'AGENCIA NORTE', user: 'operador1', plays: ['6', '6-5'], amount: 220, prize: 0, status: 'VENDIDO' },
  { id: 881151615623, date: '2026-06-08', time: '17:55:48', agency: 'AGENCIA NORTE', user: 'operador2', plays: ['4-5', '4-5-3'], amount: 500, prize: 0, status: 'ANULADO' },
]

const currency = (value: number) => `RD$ ${value.toLocaleString('es-DO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

const statusStyle = (status: TicketStatus) => {
  if (status === 'GANADOR') return { color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)', background: 'rgba(10,35,18,0.9)' }
  if (status === 'PAGADO') return { color: '#3b82f6', border: '1px solid rgba(59,130,246,0.3)', background: 'rgba(10,18,35,0.92)' }
  if (status === 'ANULADO') return { color: '#ef4444', border: '1px solid rgba(239,68,68,0.28)', background: 'rgba(44,11,11,0.88)' }
  return { color: '#f5c518', border: '1px solid rgba(245,197,24,0.28)', background: 'rgba(38,30,5,0.88)' }
}

const formatDateLabel = (date: string) =>
  new Date(`${date}T00:00:00`).toLocaleDateString('es-DO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

const buildSearchableText = (ticket: SaleTicket) =>
  [ticket.id, ticket.date, ticket.time, ticket.agency, ticket.user, ticket.plays.join(' '), ticket.amount, ticket.prize, ticket.status]
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

const SalesPage: React.FC = () => {
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
    status: 'TODOS' as 'TODOS' | TicketStatus,
    search: '',
  })
  const [applied, setApplied] = useState(draft)
  const [selectedTicketId, setSelectedTicketId] = useState<number>(MOCK_TICKETS[0]?.id ?? 0)
  const [lastRefresh, setLastRefresh] = useState(() => new Date())

  const agencies = useMemo(() => Array.from(new Set(MOCK_TICKETS.map(t => t.agency))).sort(), [])
  const users = useMemo(() => Array.from(new Set(MOCK_TICKETS.map(t => t.user))).sort(), [])

  const filteredTickets = useMemo(() => {
    const from = applied.from ? new Date(`${applied.from}T00:00:00`).getTime() : null
    const to = applied.to ? new Date(`${applied.to}T23:59:59`).getTime() : null
    const searchLower = applied.search.trim().toLowerCase()

    return MOCK_TICKETS
      .filter(t => {
        const ts = new Date(`${t.date}T${t.time}`).getTime()
        const matchesFrom = from ? ts >= from : true
        const matchesTo = to ? ts <= to : true
        const matchesAgency = applied.agency !== 'TODAS' ? t.agency === applied.agency : true
        const matchesUser = applied.user !== 'TODOS' ? t.user === applied.user : true
        const matchesStatus = applied.status !== 'TODOS' ? t.status === applied.status : true
        const matchesSearch = searchLower ? buildSearchableText(t).includes(searchLower) : true
        return matchesFrom && matchesTo && matchesAgency && matchesUser && matchesStatus && matchesSearch
      })
      .slice()
      .sort((a, b) => {
        if (a.date !== b.date) return a.date < b.date ? 1 : -1
        if (a.time !== b.time) return a.time < b.time ? 1 : -1
        return b.id - a.id
      })
  }, [applied])

  useEffect(() => {
    if (filteredTickets.length === 0) {
      setSelectedTicketId(0)
      return
    }
    const stillExists = filteredTickets.some(t => t.id === selectedTicketId)
    if (!stillExists) setSelectedTicketId(filteredTickets[0].id)
  }, [filteredTickets, selectedTicketId])

  const selectedTicket = useMemo(
    () => filteredTickets.find(t => t.id === selectedTicketId) ?? filteredTickets[0] ?? null,
    [filteredTickets, selectedTicketId],
  )

  const dayTickets = useMemo(() => MOCK_TICKETS.filter(t => t.date === todayISO), [todayISO])

  const summaryDay = useMemo(() => {
    const sales = dayTickets.reduce((acc, t) => (t.status === 'ANULADO' ? acc : acc + t.amount), 0)
    const paid = dayTickets.reduce((acc, t) => (t.status === 'PAGADO' ? acc + t.prize : acc), 0)
    const emitted = dayTickets.length
    const winners = dayTickets.filter(t => t.status === 'GANADOR' || t.status === 'PAGADO').length
    const voided = dayTickets.filter(t => t.status === 'ANULADO').length
    const balance = sales - paid
    return { sales, paid, emitted, winners, voided, balance }
  }, [dayTickets])

  const summaryFiltered = useMemo(() => {
    const sales = filteredTickets.reduce((acc, t) => (t.status === 'ANULADO' ? acc : acc + t.amount), 0)
    const paid = filteredTickets.reduce((acc, t) => (t.status === 'PAGADO' ? acc + t.prize : acc), 0)
    const emitted = filteredTickets.length
    const winners = filteredTickets.filter(t => t.status === 'GANADOR' || t.status === 'PAGADO').length
    const voided = filteredTickets.filter(t => t.status === 'ANULADO').length
    const balance = sales - paid
    return { sales, paid, emitted, winners, voided, balance }
  }, [filteredTickets])

  const exportExcel = () => {
    const header = ['Ticket', 'Fecha', 'Hora', 'Agencia', 'Usuario', 'Jugadas', 'Monto', 'Premio', 'Estado']
    const rows = filteredTickets.map(t => [
      String(t.id),
      t.date,
      t.time,
      t.agency,
      t.user,
      String(t.plays.length),
      String(t.amount),
      String(t.prize),
      t.status,
    ])

    const csv = [header, ...rows]
      .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    downloadTextFile(csv, `ventas_${applied.from || 'desde'}_${applied.to || 'hasta'}.csv`, 'text/csv;charset=utf-8;')
  }

  const exportPdf = () => {
    const rowsHtml = filteredTickets
      .slice(0, 500)
      .map(t => `
        <tr>
          <td>${t.id}</td>
          <td>${formatDateLabel(t.date)}</td>
          <td>${t.time}</td>
          <td>${t.agency}</td>
          <td>${t.user}</td>
          <td class="right">${t.plays.length}</td>
          <td class="right">${currency(t.amount)}</td>
          <td class="right">${currency(t.prize)}</td>
          <td>${t.status}</td>
        </tr>
      `)
      .join('')

    const body = `
      <h1>VENTAS Y TICKETS</h1>
      <div class="muted">Rango: ${applied.from || '—'} a ${applied.to || '—'} · Registros: ${filteredTickets.length} · Generado: ${new Date().toLocaleString('es-DO')}</div>
      <table>
        <thead>
          <tr>
            <th>Ticket</th><th>Fecha</th><th>Hora</th><th>Agencia</th><th>Usuario</th><th class="right">Jugadas</th><th class="right">Monto</th><th class="right">Premio</th><th>Estado</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    `

    printHtml('Ventas - Exportar PDF', body)
  }

  const reprintTicket = () => {
    if (!selectedTicket) return
    const playsHtml = selectedTicket.plays.map(p => `<div style="display:flex; justify-content:space-between;"><span>${p}</span><span></span></div>`).join('')
    const body = `
      <h1>MBSPORT · REIMPRESION</h1>
      <div class="muted">Ticket #${selectedTicket.id} · ${formatDateLabel(selectedTicket.date)} ${selectedTicket.time}</div>
      <table style="margin-bottom: 10px;">
        <tbody>
          <tr><th>Agencia</th><td>${selectedTicket.agency}</td></tr>
          <tr><th>Usuario</th><td>${selectedTicket.user}</td></tr>
          <tr><th>Monto</th><td class="right">${currency(selectedTicket.amount)}</td></tr>
          <tr><th>Premio</th><td class="right">${currency(selectedTicket.prize)}</td></tr>
          <tr><th>Estado</th><td>${selectedTicket.status}</td></tr>
        </tbody>
      </table>
      <div style="font-family: 'Barlow Condensed', sans-serif; font-weight: 900; letter-spacing: 0.08em; margin-bottom: 6px;">JUGADAS</div>
      <div style="font-size: 12px; border-top: 1px dashed #444; padding-top: 8px;">${playsHtml}</div>
    `
    printHtml(`Ticket ${selectedTicket.id}`, body)
  }

  return (
    <div className="sales-shell">
      <div className="sales-filters pos-panel-surface rounded-lg p-3">
        <div className="sales-filter-group">
          <span className="results-filter-label">Fecha Desde</span>
          <input
            type="date"
            value={draft.from}
            onChange={e => setDraft(s => ({ ...s, from: e.target.value }))}
            className="results-filter-control"
          />
        </div>

        <div className="sales-filter-group">
          <span className="results-filter-label">Fecha Hasta</span>
          <input
            type="date"
            value={draft.to}
            onChange={e => setDraft(s => ({ ...s, to: e.target.value }))}
            className="results-filter-control"
          />
        </div>

        <div className="sales-filter-group">
          <span className="results-filter-label">Agencia</span>
          <select
            value={draft.agency}
            onChange={e => setDraft(s => ({ ...s, agency: e.target.value }))}
            className="results-filter-control"
          >
            <option value="TODAS">TODAS</option>
            {agencies.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>

        <div className="sales-filter-group">
          <span className="results-filter-label">Usuario</span>
          <select
            value={draft.user}
            onChange={e => setDraft(s => ({ ...s, user: e.target.value }))}
            className="results-filter-control"
          >
            <option value="TODOS">TODOS</option>
            {users.map(u => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>

        <div className="sales-filter-group">
          <span className="results-filter-label">Estado</span>
          <select
            value={draft.status}
            onChange={e => setDraft(s => ({ ...s, status: e.target.value as any }))}
            className="results-filter-control"
          >
            <option value="TODOS">TODOS</option>
            <option value="VENDIDO">VENDIDO</option>
            <option value="GANADOR">GANADOR</option>
            <option value="PAGADO">PAGADO</option>
            <option value="ANULADO">ANULADO</option>
          </select>
        </div>

        <div className="sales-filter-group sales-search">
          <span className="results-filter-label">Buscar Ticket</span>
          <input
            type="text"
            value={draft.search}
            onChange={e => setDraft(s => ({ ...s, search: e.target.value }))}
            placeholder="Número, agencia, usuario..."
            className="results-filter-control"
          />
        </div>

        <div className="sales-filter-actions">
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
              const reset = { from: todayISO, to: todayISO, agency: 'TODAS', user: 'TODOS', status: 'TODOS' as const, search: '' }
              setDraft(reset)
              setApplied(reset)
              setLastRefresh(new Date())
            }}
          >
            ACTUALIZAR
          </button>
        </div>
      </div>

      <div className="sales-summary-grid">
        <div className="sales-summary-card">
          <span className="sales-summary-label">VENTAS DEL DÍA</span>
          <span className="sales-summary-value">{currency(summaryDay.sales)}</span>
        </div>
        <div className="sales-summary-card">
          <span className="sales-summary-label">TICKETS EMITIDOS</span>
          <span className="sales-summary-value">{summaryDay.emitted.toLocaleString('es-DO')}</span>
        </div>
        <div className="sales-summary-card">
          <span className="sales-summary-label">PREMIOS PAGADOS</span>
          <span className="sales-summary-value">{currency(summaryDay.paid)}</span>
        </div>
        <div className="sales-summary-card">
          <span className="sales-summary-label">TICKETS GANADORES</span>
          <span className="sales-summary-value">{summaryDay.winners.toLocaleString('es-DO')}</span>
        </div>
        <div className="sales-summary-card">
          <span className="sales-summary-label">TICKETS ANULADOS</span>
          <span className="sales-summary-value">{summaryDay.voided.toLocaleString('es-DO')}</span>
        </div>
        <div className="sales-summary-card">
          <span className="sales-summary-label">BALANCE GENERAL</span>
          <span className="sales-summary-value">{currency(summaryDay.balance)}</span>
        </div>
      </div>

      <div className="sales-main-grid">
        <div className="sales-table-panel pos-panel-surface rounded-lg overflow-hidden">
          <div className="results-panel-header">
            <span className="results-panel-title">VENTAS Y TICKETS</span>
            <span className="results-panel-meta">{filteredTickets.length} registros · {lastRefresh.toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          </div>

          <div className="sales-table-head">
            {['Ticket', 'Fecha', 'Hora', 'Agencia', 'Usuario', 'Jugadas', 'Monto', 'Premio', 'Estado'].map(col => (
              <span key={col}>{col}</span>
            ))}
          </div>

          <div className="sales-table-body">
            {filteredTickets.length === 0 ? (
              <div className="results-empty-state">SIN REGISTROS PARA LOS FILTROS ACTUALES</div>
            ) : (
              filteredTickets.map(t => (
                <button
                  key={t.id}
                  type="button"
                  className={`sales-row ${t.id === selectedTicketId ? 'selected' : ''}`}
                  onClick={() => setSelectedTicketId(t.id)}
                >
                  <span className="sales-cell sales-ticket">{t.id}</span>
                  <span className="sales-cell">{formatDateLabel(t.date)}</span>
                  <span className="sales-cell">{t.time}</span>
                  <span className="sales-cell sales-agency">{t.agency}</span>
                  <span className="sales-cell">{t.user}</span>
                  <span className="sales-cell sales-num">{t.plays.length}</span>
                  <span className="sales-cell sales-num">{currency(t.amount)}</span>
                  <span className="sales-cell sales-num">{currency(t.prize)}</span>
                  <span className="sales-cell">
                    <span className="results-status-badge" style={statusStyle(t.status)}>{t.status}</span>
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="sales-right-panel pos-panel-surface rounded-lg overflow-hidden">
          <div className="results-panel-header">
            <span className="results-panel-title">DETALLE DEL TICKET</span>
            <span className="results-panel-meta">{selectedTicket ? `#${selectedTicket.id}` : '—'}</span>
          </div>

          <div className="sales-right-body">
            {!selectedTicket ? (
              <div className="results-empty-state">SELECCIONE UN TICKET PARA VER DETALLE</div>
            ) : (
              <>
                <div className="sales-detail-grid">
                  <div className="sales-detail-item">
                    <span className="results-detail-label">Número Ticket</span>
                    <span className="results-detail-value">{selectedTicket.id}</span>
                  </div>
                  <div className="sales-detail-item">
                    <span className="results-detail-label">Estado</span>
                    <span className="results-status-badge" style={statusStyle(selectedTicket.status)}>{selectedTicket.status}</span>
                  </div>
                  <div className="sales-detail-item">
                    <span className="results-detail-label">Monto Apostado</span>
                    <span className="results-detail-value" style={{ color: '#f5c518' }}>{currency(selectedTicket.amount)}</span>
                  </div>
                  <div className="sales-detail-item">
                    <span className="results-detail-label">Premio Ganado</span>
                    <span className="results-detail-value" style={{ color: selectedTicket.prize > 0 ? '#22c55e' : '#777' }}>{currency(selectedTicket.prize)}</span>
                  </div>
                </div>

                <div className="sales-plays-panel">
                  <div className="sales-plays-header">
                    <span className="sales-plays-title">JUGADAS</span>
                    <span className="results-panel-meta">{selectedTicket.plays.length} regs.</span>
                  </div>
                  <div className="sales-plays-table-head">
                    <span>JUGADAS</span>
                  </div>
                  <div className="sales-plays-body">
                    {selectedTicket.plays.map((p, idx) => (
                      <div key={`${p}-${idx}`} className="sales-play-row">
                        <span className="sales-play-value">{p}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="sales-actions-grid">
                  <button
                    type="button"
                    className="special-btn rounded-lg flex items-center justify-center"
                    style={{ minHeight: '42px', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, letterSpacing: '0.12em' }}
                    onClick={reprintTicket}
                  >
                    REIMPRIMIR
                  </button>
                  <button
                    type="button"
                    className="special-btn rounded-lg flex items-center justify-center"
                    style={{ minHeight: '42px', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, letterSpacing: '0.12em' }}
                    onClick={exportPdf}
                  >
                    EXPORTAR PDF
                  </button>
                  <button
                    type="button"
                    className="special-btn rounded-lg flex items-center justify-center"
                    style={{ minHeight: '42px', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, letterSpacing: '0.12em' }}
                    onClick={exportExcel}
                  >
                    EXPORTAR EXCEL
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="sales-bottom-summary pos-panel-surface rounded-lg">
        <div className="sales-bottom-item">
          <span className="sales-bottom-label">Ventas Totales</span>
          <span className="sales-bottom-value">{currency(summaryFiltered.sales)}</span>
        </div>
        <div className="sales-bottom-item">
          <span className="sales-bottom-label">Premios Pagados</span>
          <span className="sales-bottom-value">{currency(summaryFiltered.paid)}</span>
        </div>
        <div className="sales-bottom-item">
          <span className="sales-bottom-label">Tickets Emitidos</span>
          <span className="sales-bottom-value">{summaryFiltered.emitted.toLocaleString('es-DO')}</span>
        </div>
        <div className="sales-bottom-item">
          <span className="sales-bottom-label">Tickets Ganadores</span>
          <span className="sales-bottom-value">{summaryFiltered.winners.toLocaleString('es-DO')}</span>
        </div>
        <div className="sales-bottom-item">
          <span className="sales-bottom-label">Tickets Anulados</span>
          <span className="sales-bottom-value">{summaryFiltered.voided.toLocaleString('es-DO')}</span>
        </div>
        <div className="sales-bottom-item">
          <span className="sales-bottom-label">Balance Neto</span>
          <span className="sales-bottom-value">{currency(summaryFiltered.balance)}</span>
        </div>
      </div>
    </div>
  )
}

export default SalesPage
