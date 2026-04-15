import { useState, useEffect, useRef, useCallback } from 'react'

const FOOTBALL_TOKEN = '026558baeb234743b95ddc1e99d56fdf'

const POINT_DEDUCTIONS = [
  { team: 'Sheffield Wednesday', points: 12, fromMatchday: 11 },
  { team: 'Sheffield Wednesday', points: 6,  fromMatchday: 17 },
  { team: 'Leicester City',      points: 6,  fromMatchday: 25 },
]

const COLORS = {
  'Coventry City':'#2563EB','Middlesbrough':'#DC2626','Millwall':'#1D4ED8',
  'Ipswich Town':'#1E40AF','Hull City':'#D97706','Wrexham AFC':'#991B1B',
  'Southampton FC':'#DC2626','Derby County':'#6B7280','Watford FC':'#CA8A04',
  'Bristol City':'#7C2D12','Birmingham City':'#1E3A8A','Preston North End':'#9CA3AF',
  'Sheffield United':'#B91C1C','Stoke City':'#C2410C','Queens Park Rangers':'#1D4ED8',
  'Swansea City AFC':'#4B5563','Norwich City':'#15803D','Charlton Athletic':'#B91C1C',
  'Portsmouth FC':'#1E3A8A','Blackburn Rovers':'#0369A1','West Bromwich Albion':'#1E3A8A',
  'Leicester City':'#1D4ED8','Oxford United FC':'#B45309','Sheffield Wednesday':'#1D4ED8',
}

// Southampton gets special treatment — always highlighted in red
const SAINTS_COLOR = '#DC2626'

const SHORT = {
  'Coventry City':'Coventry','Middlesbrough':'Boro','Millwall':'Millwall',
  'Ipswich Town':'Ipswich','Hull City':'Hull','Wrexham AFC':'Wrexham',
  'Southampton FC':'Southampton','Derby County':'Derby','Watford FC':'Watford',
  'Bristol City':'Bristol C','Birmingham City':'Birmingham','Preston North End':'Preston',
  'Sheffield United':'Sheff Utd','Stoke City':'Stoke','Queens Park Rangers':'QPR',
  'Swansea City AFC':'Swansea','Norwich City':'Norwich','Charlton Athletic':'Charlton',
  'Portsmouth FC':'Portsmouth','Blackburn Rovers':'Blackburn',
  'West Bromwich Albion':'West Brom','Leicester City':'Leicester',
  'Oxford United FC':'Oxford Utd','Sheffield Wednesday':'Sheff Wed',
}

function computeTable(matches, upTo) {
  const t = {}
  const get = n => t[n] || (t[n] = { name:n, p:0, w:0, d:0, l:0, gf:0, ga:0, pts:0 })
  for (const m of matches) {
    if (m.matchday > upTo || m.status !== 'FINISHED') continue
    const hg = m.score?.fullTime?.home, ag = m.score?.fullTime?.away
    if (hg == null || ag == null) continue
    const h = get(m.homeTeam.name), a = get(m.awayTeam.name)
    h.p++; a.p++; h.gf += hg; h.ga += ag; a.gf += ag; a.ga += hg
    if (hg > ag)      { h.w++; h.pts += 3; a.l++ }
    else if (hg < ag) { a.w++; a.pts += 3; h.l++ }
    else              { h.d++; h.pts++;    a.d++; a.pts++ }
  }
  for (const d of POINT_DEDUCTIONS)
    if (upTo >= d.fromMatchday && t[d.team]) t[d.team].pts -= d.points
  return Object.values(t).sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts
    const gda = a.gf - a.ga, gdb = b.gf - b.ga
    if (gdb !== gda) return gdb - gda
    if (b.gf !== a.gf) return b.gf - a.gf
    return a.name.localeCompare(b.name)
  })
}

async function fetchViaProxy() {
  const res = await fetch('/api/football?path=/competitions/ELC/matches&season=2025')
  if (!res.ok) throw new Error(`Proxy ${res.status}`)
  return (await res.json()).matches || []
}

async function fetchDirect() {
  const res = await fetch(
    'https://api.football-data.org/v4/competitions/ELC/matches?season=2025',
    { headers: { 'X-Auth-Token': FOOTBALL_TOKEN }, mode: 'cors' }
  )
  if (!res.ok) throw new Error(`Direct ${res.status}`)
  return (await res.json()).matches || []
}

function ord(n) {
  if (!n) return ''
  const v = n % 100
  return (['th','st','nd','rd'][(v - 20) % 10] || ['th','st','nd','rd'][v] || 'th')
}

// Interpolate position between two matchdays for smooth animation
function interpolatePos(posH, name, fractionalMD) {
  const lower = Math.floor(fractionalMD)
  const upper = Math.ceil(fractionalMD)
  const frac  = fractionalMD - lower

  const posLow = posH[name]?.[lower - 1]
  const posHigh = posH[name]?.[upper - 1]

  if (posLow === undefined) return posHigh
  if (posHigh === undefined) return posLow

  // Smooth easing between positions
  const eased = frac < 0.5
    ? 2 * frac * frac
    : 1 - Math.pow(-2 * frac + 2, 2) / 2

  return posLow + (posHigh - posLow) * eased
}

// Multi-select dropdown component
function TeamSelector({ names, selected, onChange, colors }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const toggle = name => {
    if (name === 'Southampton FC') return // always on, can't remove
    onChange(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    )
  }

  const clearAll = () => onChange(['Southampton FC'])

  const displayNames = selected.filter(n => n !== 'Southampton FC')

  return (
    <div ref={ref} style={{ position: 'relative', minWidth: 220 }}>
      {/* Trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 8, width: '100%', padding: '7px 12px',
          background: '#fff', border: '1.5px solid #d1d5db', borderRadius: 7,
          cursor: 'pointer', fontSize: 13, color: '#374151', fontFamily: 'inherit',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', flex: 1 }}>
          {displayNames.length === 0
            ? <span style={{ color: '#9ca3af' }}>Highlight additional teams…</span>
            : displayNames.map(n => (
                <span key={n} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  padding: '2px 8px', borderRadius: 100,
                  background: colors[n] || '#e5e7eb',
                  color: '#fff', fontSize: 11, fontWeight: 600,
                }}>
                  {SHORT[n] || n.split(' ')[0]}
                  <span
                    onClick={e => { e.stopPropagation(); toggle(n) }}
                    style={{ cursor: 'pointer', opacity: 0.8, lineHeight: 1 }}
                  >×</span>
                </span>
              ))
          }
        </span>
        <span style={{ color: '#9ca3af', fontSize: 11, flexShrink: 0 }}>{open ? '▲' : '▼'}</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
          background: '#fff', border: '1.5px solid #d1d5db', borderRadius: 8,
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 200,
          maxHeight: 280, overflowY: 'auto',
        }}>
          {/* Clear button */}
          {displayNames.length > 0 && (
            <button
              onClick={clearAll}
              style={{
                width: '100%', padding: '8px 12px', textAlign: 'left',
                background: '#fef2f2', border: 'none', borderBottom: '1px solid #fecaca',
                color: '#dc2626', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
                fontWeight: 600,
              }}
            >
              Clear all highlights
            </button>
          )}
          {names
            .filter(n => n !== 'Southampton FC')
            .sort((a, b) => (SHORT[a] || a).localeCompare(SHORT[b] || b))
            .map(name => {
              const isSelected = selected.includes(name)
              return (
                <button key={name} onClick={() => toggle(name)} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', padding: '8px 12px', textAlign: 'left',
                  background: isSelected ? '#f9fafb' : '#fff',
                  border: 'none', borderBottom: '1px solid #f3f4f6',
                  cursor: 'pointer', fontSize: 13, color: '#374151',
                  fontFamily: 'inherit', fontWeight: isSelected ? 600 : 400,
                  transition: 'background 0.1s',
                }}>
                  <span style={{
                    width: 12, height: 12, borderRadius: '50%', flexShrink: 0,
                    background: isSelected ? (colors[name] || '#6b7280') : '#e5e7eb',
                    border: `2px solid ${colors[name] || '#d1d5db'}`,
                  }}/>
                  {SHORT[name] || name}
                  {isSelected && <span style={{ marginLeft: 'auto', color: colors[name], fontSize: 12 }}>✓</span>}
                </button>
              )
            })
          }
        </div>
      )}
    </div>
  )
}

export default function ChampionshipChart() {
  const [matches,      setMatches]      = useState([])
  const [tables,       setTables]       = useState([])
  const [maxMD,        setMaxMD]        = useState(0)
  const [fractionalMD, setFractionalMD] = useState(1)   // float for smooth animation
  const [phase,        setPhase]        = useState('loading')
  const [msg,          setMsg]          = useState('Connecting…')
  const [playing,      setPlaying]      = useState(false)
  const [speed,        setSpeed]        = useState(600)  // ms per matchday
  const [highlighted,  setHighlighted]  = useState(['Southampton FC'])
  const animRef  = useRef(null)
  const retryN   = useRef(0)
  const lastTime = useRef(null)

  // ── Data loading ────────────────────────────────────────────────────────────
  useEffect(() => {
    let dead = false
    ;(async () => {
      setPhase('loading')
      for (const [label, fn] of [['Netlify proxy', fetchViaProxy], ['Direct API', fetchDirect]]) {
        try {
          setMsg('Loading match data…')
          const ms = await fn()
          if (dead || !ms?.length) continue
          const fin = ms.filter(m => m.status === 'FINISHED')
          const max = Math.max(...fin.map(m => m.matchday))
          setMsg('Building tables…')
          await new Promise(r => setTimeout(r, 20))
          const tbls = []
          for (let md = 1; md <= max; md++) tbls.push(computeTable(ms, md))
          if (dead) return
          setMatches(ms); setTables(tbls); setMaxMD(max)
          setFractionalMD(max)
          setPhase('ready'); return
        } catch (e) { console.warn(label, e.message) }
      }
      if (!dead) { setPhase('error'); setMsg('Could not load data.') }
    })()
    return () => { dead = true }
  }, [retryN.current])

  // ── Smooth animation via requestAnimationFrame ──────────────────────────────
  const animate = useCallback((timestamp) => {
    if (!lastTime.current) lastTime.current = timestamp
    const elapsed = timestamp - lastTime.current
    lastTime.current = timestamp

    // How many matchdays to advance per second based on speed setting
    // speed = ms per matchday, so matchdays per ms = 1/speed
    const delta = elapsed / speed

    setFractionalMD(prev => {
      const next = prev + delta
      if (next >= maxMD) {
        setPlaying(false)
        return maxMD
      }
      return next
    })

    animRef.current = requestAnimationFrame(animate)
  }, [speed, maxMD])

  useEffect(() => {
    if (playing) {
      lastTime.current = null
      animRef.current = requestAnimationFrame(animate)
    } else {
      cancelAnimationFrame(animRef.current)
      lastTime.current = null
    }
    return () => cancelAnimationFrame(animRef.current)
  }, [playing, animate])

  const handlePlay = () => {
    if (fractionalMD >= maxMD && !playing) {
      setFractionalMD(1)
      setPlaying(true)
    } else {
      setPlaying(p => !p)
    }
  }

  const handleScrub = (val) => {
    setPlaying(false)
    setFractionalMD(Number(val))
  }

  // ── Chart geometry ──────────────────────────────────────────────────────────
  const W=900, H=520, PL=12, PR=150, PT=44, PB=32
  const CW=W-PL-PR, CH=H-PT-PB
  const xOf = md  => PL + ((md - 1) / Math.max(maxMD - 1, 1)) * CW
  const yOf = pos => PT + ((pos - 1) / 23) * CH

  const names    = [...new Set(tables.flatMap(t => t.map(r => r.name)))]
  const saint    = names.find(n => n.includes('Southampton')) || ''

  // Ensure Southampton is always in highlighted
  useEffect(() => {
    if (saint && !highlighted.includes(saint)) {
      setHighlighted(prev => [saint, ...prev])
    }
  }, [saint])

  // Position history: posH[name][matchdayIndex] = rank
  const posH = Object.fromEntries(
    names.map(n => [n, tables.map(t => {
      const i = t.findIndex(r => r.name === n)
      return i === -1 ? undefined : i + 1
    })])
  )

  const currentMDInt = Math.round(fractionalMD)
  const curTable     = tables[Math.min(currentMDInt, maxMD) - 1] || []
  const curPos       = n => { const i = curTable.findIndex(r => r.name === n); return i === -1 ? null : i + 1 }

  // Build SVG path for a team — drawn up to fractionalMD with interpolated end point
  const pathFor = n => {
    const segs = []
    const upTo = Math.floor(fractionalMD)

    for (let i = 0; i < upTo; i++) {
      const pos = posH[n]?.[i]
      if (pos === undefined) continue
      segs.push(`${segs.length === 0 ? 'M' : 'L'} ${xOf(i+1).toFixed(1)} ${yOf(pos).toFixed(1)}`)
    }

    // Interpolated point at the fractional position
    if (fractionalMD > upTo && upTo < maxMD) {
      const ipos = interpolatePos(posH, n, fractionalMD)
      if (ipos !== undefined) {
        segs.push(`${segs.length === 0 ? 'M' : 'L'} ${xOf(fractionalMD).toFixed(2)} ${yOf(ipos).toFixed(2)}`)
      }
    }

    return segs.join(' ')
  }

  const saintsRow = curTable.find(r => r.name === saint)
  const saintsPos = curPos(saint)
  const isHighlighted = n => highlighted.includes(n)

  // ── Loading / error states ──────────────────────────────────────────────────
  const wrapStyle = {
    width: '100%', background: '#ffffff',
    fontFamily: "'Outfit','Helvetica Neue',sans-serif", color: '#1f2937',
    padding: '24px 20px 28px',
  }

  if (phase === 'loading') return (
    <div style={{ ...wrapStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 20px' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width:28, height:28, border:'2.5px solid #e5e7eb', borderTop:'2.5px solid #dc2626', borderRadius:'50%', animation:'spin 0.85s linear infinite' }}/>
      <div style={{ color:'#374151', fontWeight:600, fontSize:14, marginTop:14 }}>Loading match data</div>
      <div style={{ color:'#9ca3af', fontSize:12, marginTop:4 }}>{msg}</div>
    </div>
  )

  if (phase === 'error') return (
    <div style={{ ...wrapStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 20px' }}>
      <div style={{ fontSize:28, marginBottom:12 }}>⚠️</div>
      <div style={{ color:'#dc2626', fontWeight:700, fontSize:14, marginBottom:6 }}>Could not load data</div>
      <div style={{ color:'#6b7280', fontSize:12, lineHeight:1.7, textAlign:'center', marginBottom:16 }}>
        Unable to reach the football data API.
      </div>
      <button onClick={() => { retryN.current++; setPhase('loading') }}
        style={{ background:'#dc2626', border:'none', borderRadius:7, color:'#fff', padding:'8px 20px', cursor:'pointer', fontWeight:700, fontSize:13 }}>
        ↺ Retry
      </button>
    </div>
  )

  // ── Chart ───────────────────────────────────────────────────────────────────
  return (
    <div style={wrapStyle}>

      {/* Top bar — status + team selector */}
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16, flexWrap:'wrap' }}>

        {/* Matchday + Southampton badge */}
        <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap', flex: 1 }}>
          <div style={{
            padding:'5px 14px', borderRadius:6, fontSize:14, fontWeight:700,
            background:'#f3f4f6', color:'#111827', letterSpacing:'0.5px',
            fontVariantNumeric: 'tabular-nums',
          }}>
            Matchday {currentMDInt}
          </div>
          {saintsRow && (
            <div style={{
              padding:'5px 12px', borderRadius:6, fontSize:12, fontWeight:600,
              background:'#fef2f2', border:'1.5px solid #fecaca', color:'#dc2626',
            }}>
              Southampton · {saintsPos}{ord(saintsPos)} · {saintsRow.pts}pts
              {saintsPos<=2?' 🔼':saintsPos<=6?' 🟡':saintsPos>=22?' 🔻':''}
            </div>
          )}
        </div>

        {/* Team selector dropdown */}
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:12, color:'#6b7280', whiteSpace:'nowrap' }}>Highlight:</span>
          <TeamSelector
            names={names}
            selected={highlighted}
            onChange={setHighlighted}
            colors={COLORS}
          />
        </div>

      </div>

      {/* SVG Chart */}
      <div style={{ border:'1px solid #e5e7eb', borderRadius:10, overflow:'hidden', background:'#fff' }}>
        <svg
          width={W} height={H}
          viewBox={`0 0 ${W} ${H}`}
          style={{ display:'block', width:'100%', height:'auto' }}
        >
          <defs>
            <filter id="highlight-glow">
              <feGaussianBlur stdDeviation="2" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          {/* Background */}
          <rect x={0} y={0} width={W} height={H} fill="#ffffff"/>

          {/* Zone fills — very subtle on white */}
          <rect x={PL} y={PT} width={CW} height={yOf(2.5)-PT} fill="rgba(220,38,38,0.04)"/>
          <rect x={PL} y={yOf(2.5)} width={CW} height={yOf(6.5)-yOf(2.5)} fill="rgba(234,179,8,0.04)"/>
          <rect x={PL} y={yOf(21.5)} width={CW} height={PT+CH-yOf(21.5)} fill="rgba(107,114,128,0.05)"/>

          {/* Zone lines */}
          {[[2.5,'rgba(220,38,38,0.2)'],[6.5,'rgba(234,179,8,0.25)'],[21.5,'rgba(107,114,128,0.2)']].map(([p,c]) => (
            <line key={p} x1={PL} y1={yOf(p)} x2={PL+CW} y2={yOf(p)} stroke={c} strokeWidth={1} strokeDasharray="4,4"/>
          ))}

          {/* Zone labels */}
          <text x={PL+4} y={PT+10}        fill="rgba(220,38,38,0.5)"   fontSize="7.5" fontFamily="Outfit" letterSpacing="1.5" fontWeight="700">AUTO PROMOTION</text>
          <text x={PL+4} y={yOf(2.5)+11}  fill="rgba(161,130,0,0.55)"  fontSize="7.5" fontFamily="Outfit" letterSpacing="1.5" fontWeight="700">PLAY-OFFS</text>
          <text x={PL+4} y={yOf(21.5)+11} fill="rgba(107,114,128,0.5)" fontSize="7.5" fontFamily="Outfit" letterSpacing="1.5" fontWeight="700">RELEGATION</text>

          {/* Matchday grid lines */}
          {Array.from({length:maxMD},(_,i)=>i+1).map(md => {
            const x  = xOf(md)
            const ic = md === currentMDInt
            const sl = md % 5 === 0 || md === 1 || md === maxMD
            return (
              <g key={md}>
                <line x1={x} y1={PT} x2={x} y2={PT+CH}
                  stroke={ic ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.04)'}
                  strokeWidth={ic ? 1.5 : 1}/>
                {sl && (
                  <text x={x} y={H-6} textAnchor="middle"
                    fill={ic ? '#374151' : '#9ca3af'}
                    fontSize={ic ? '9' : '7.5'}
                    fontFamily="Outfit"
                    fontWeight={ic ? '700' : '400'}>
                    {md}
                  </text>
                )}
              </g>
            )
          })}

          {/* Animated current matchday line */}
          <line
            x1={xOf(fractionalMD)} y1={PT}
            x2={xOf(fractionalMD)} y2={PT+CH}
            stroke="rgba(0,0,0,0.15)" strokeWidth={1.5}
          />

          {/* Y axis */}
          {[1,3,6,10,15,20,22,24].map(p => (
            <text key={p} x={PL-3} y={yOf(p)+4} textAnchor="end"
              fill="#9ca3af" fontSize="8.5" fontFamily="Outfit">{p}</text>
          ))}
          <text x={PL+CW/2} y={H-2} textAnchor="middle"
            fill="#d1d5db" fontSize="7.5" fontFamily="Outfit" letterSpacing="2">MATCHDAY</text>

          {/* ── Non-highlighted lines — drawn first, greyed out ── */}
          {names.filter(n => !isHighlighted(n)).map(name => {
            const d = pathFor(name)
            if (!d) return null
            return (
              <path key={name} d={d} fill="none"
                stroke="#d1d5db"
                strokeWidth={0.8}
                strokeOpacity={0.7}
                strokeLinecap="round" strokeLinejoin="round"
              />
            )
          })}

          {/* ── Highlighted lines — drawn on top ── */}
          {highlighted.map(name => {
            const d = pathFor(name)
            if (!d) return null
            const isSaints = name === saint
            const color = isSaints ? SAINTS_COLOR : (COLORS[name] || '#6b7280')
            return (
              <path key={name} d={d} fill="none"
                stroke={color}
                strokeWidth={isSaints ? 2.8 : 2.2}
                strokeLinecap="round" strokeLinejoin="round"
                filter={isSaints ? 'url(#highlight-glow)' : undefined}
              />
            )
          })}

          {/* ── Dots at current position for highlighted teams ── */}
          {highlighted.map(name => {
            const ipos = interpolatePos(posH, name, fractionalMD)
            if (!ipos) return null
            const cx = xOf(fractionalMD)
            const cy = yOf(ipos)
            const isSaints = name === saint
            const color = isSaints ? SAINTS_COLOR : (COLORS[name] || '#6b7280')
            return (
              <g key={name+'-dot'}>
                {isSaints && <circle cx={cx} cy={cy} r={8} fill="rgba(220,38,38,0.12)"/>}
                <circle cx={cx} cy={cy}
                  r={isSaints ? 5 : 4}
                  fill={color}
                  stroke="#fff"
                  strokeWidth={2}
                />
              </g>
            )
          })}

          {/* ── Right-side labels for highlighted teams ── */}
          {(() => {
            // Sort highlighted teams by current position to avoid label overlap
            const labelData = highlighted
              .map(name => ({ name, pos: curPos(name) }))
              .filter(d => d.pos !== null)
              .sort((a, b) => a.pos - b.pos)

            // Nudge labels that are too close together
            const MIN_GAP = 11
            const nudged = labelData.map(d => ({ ...d, y: yOf(d.pos) }))
            for (let i = 1; i < nudged.length; i++) {
              if (nudged[i].y - nudged[i-1].y < MIN_GAP) {
                nudged[i].y = nudged[i-1].y + MIN_GAP
              }
            }

            return nudged.map(({ name, y }) => {
              const isSaints = name === saint
              const color = isSaints ? SAINTS_COLOR : (COLORS[name] || '#6b7280')
              return (
                <text key={name+'-lbl'}
                  x={xOf(fractionalMD) + 9} y={y + 4}
                  fill={color}
                  fontSize={isSaints ? '11' : '10'}
                  fontFamily="Outfit"
                  fontWeight={isSaints ? '800' : '600'}>
                  {SHORT[name] || name.split(' ')[0]}
                </text>
              )
            })
          })()}
        </svg>
      </div>

      {/* Controls */}
      <div style={{ display:'flex', gap:10, marginTop:14, alignItems:'center', flexWrap:'wrap', justifyContent:'center' }}>
        <button
          onClick={() => { setPlaying(false); setFractionalMD(1) }}
          style={{ background:'#f3f4f6', border:'1px solid #e5e7eb', borderRadius:7, color:'#374151', padding:'7px 16px', cursor:'pointer', fontSize:12, fontWeight:600 }}>
          ↺ Reset
        </button>
        <button
          onClick={handlePlay}
          style={{ background: playing ? '#fef2f2' : '#dc2626', border:`1px solid ${playing ? '#fecaca' : '#dc2626'}`, borderRadius:7, color: playing ? '#dc2626' : '#fff', padding:'7px 18px', cursor:'pointer', fontSize:13, fontWeight:700 }}>
          {playing ? '⏸ Pause' : fractionalMD >= maxMD ? '↺ Replay' : '▶ Play'}
        </button>
        <input
          type="range" min={1} max={maxMD || 46} step={0.01}
          value={fractionalMD}
          onChange={e => handleScrub(e.target.value)}
          style={{ width:180, accentColor:'#dc2626', cursor:'pointer' }}
        />
        <select
          value={speed}
          onChange={e => setSpeed(+e.target.value)}
          style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:6, color:'#374151', padding:'6px 10px', fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>
          <option value={1800}>Slow</option>
          <option value={600}>Normal</option>
          <option value={250}>Fast</option>
          <option value={80}>Very Fast</option>
        </select>
      </div>

      {/* Legend */}
      <div style={{ display:'flex', gap:16, marginTop:12, flexWrap:'wrap', justifyContent:'center', fontSize:11, color:'#9ca3af' }}>
        {[
          ['rgba(220,38,38,0.4)','Auto Promotion (1–2)'],
          ['rgba(200,160,0,0.4)','Play-offs (3–6)'],
          ['rgba(107,114,128,0.35)','Relegation (22–24)'],
        ].map(([c,l]) => (
          <span key={l} style={{ display:'flex', alignItems:'center', gap:5 }}>
            <span style={{ width:16, height:2.5, background:c, display:'inline-block', borderRadius:2 }}/>{l}
          </span>
        ))}
        <span style={{ color:'#d1d5db' }}>·</span>
        <span>{matches.filter(m=>m.status==='FINISHED').length} results · table computed per matchday</span>
      </div>

    </div>
  )
}
