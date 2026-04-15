import { useState, useEffect, useRef } from 'react'

const FOOTBALL_TOKEN = '026558baeb234743b95ddc1e99d56fdf'

const POINT_DEDUCTIONS = [
  { team: 'Sheffield Wednesday', points: 12, fromMatchday: 11 },
  { team: 'Sheffield Wednesday', points: 6,  fromMatchday: 17 },
  { team: 'Leicester City',      points: 6,  fromMatchday: 25 },
]

const COLORS = {
  'Coventry City':'#59CDEF','Middlesbrough':'#E31837','Millwall':'#4A7FC1',
  'Ipswich Town':'#3D76BD','Hull City':'#F5A12D','Wrexham AFC':'#C8102E',
  'Southampton FC':'#FD2A20','Derby County':'#B0B0B0','Watford FC':'#E8C832',
  'Bristol City':'#9B2335','Birmingham City':'#0060A9','Preston North End':'#CBD5E1',
  'Sheffield United':'#EE2737','Stoke City':'#E03A3E','Queens Park Rangers':'#1D5BA4',
  'Swansea City AFC':'#888888','Norwich City':'#00A650','Charlton Athletic':'#D4122E',
  'Portsmouth FC':'#001489','Blackburn Rovers':'#009EE0','West Bromwich Albion':'#122F67',
  'Leicester City':'#003090','Oxford United FC':'#F9A02B','Sheffield Wednesday':'#3344AA',
}

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

export default function ChampionshipChart() {
  const [matches,   setMatches]   = useState([])
  const [tables,    setTables]    = useState([])
  const [maxMD,     setMaxMD]     = useState(0)
  const [currentMD, setCurrentMD] = useState(1)
  const [phase,     setPhase]     = useState('loading')
  const [msg,       setMsg]       = useState('Connecting…')
  const [playing,   setPlaying]   = useState(false)
  const [speed,     setSpeed]     = useState(400)
  const [hovered,   setHovered]   = useState(null)
  const timer  = useRef(null)
  const retryN = useRef(0)

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
          setMatches(ms); setTables(tbls); setMaxMD(max); setCurrentMD(max)
          setPhase('ready'); return
        } catch (e) { console.warn(label, e.message) }
      }
      if (!dead) { setPhase('error'); setMsg('Could not load data.') }
    })()
    return () => { dead = true }
  }, [retryN.current])

  useEffect(() => {
    clearInterval(timer.current)
    if (playing) timer.current = setInterval(() => {
      setCurrentMD(p => { if (p >= maxMD) { setPlaying(false); return p }; return p + 1 })
    }, speed)
    return () => clearInterval(timer.current)
  }, [playing, speed, maxMD])

  const W=900, H=580, PL=12, PR=150, PT=48, PB=36
  const CW=W-PL-PR, CH=H-PT-PB
  const xOf = md  => PL + ((md - 1) / Math.max(maxMD - 1, 1)) * CW
  const yOf = pos => PT + ((pos - 1) / 23) * CH
  const names    = [...new Set(tables.flatMap(t => t.map(r => r.name)))]
  const saint    = names.find(n => n.includes('Southampton')) || ''
  const posH     = Object.fromEntries(names.map(n => [n, tables.map(t => { const i = t.findIndex(r => r.name === n); return i === -1 ? undefined : i + 1 })]))
  const curTable = tables[currentMD - 1] || []
  const curPos   = n => { const i = curTable.findIndex(r => r.name === n); return i === -1 ? null : i + 1 }
  const pathFor  = n => {
    const s = []
    for (let i = 0; i < currentMD; i++) {
      const pos = posH[n]?.[i]; if (pos === undefined) continue
      s.push(`${s.length === 0 ? 'M' : 'L'} ${xOf(i+1).toFixed(1)} ${yOf(pos).toFixed(1)}`)
    }
    return s.join(' ')
  }
  const saintsRow = curTable.find(r => r.name === saint)
  const saintsPos = curPos(saint)

  const root = { width:'100%', background:'radial-gradient(ellipse at 15% 25%, #0d1b2e 0%, #050a12 55%, #0a0d1a 100%)', display:'flex', flexDirection:'column', alignItems:'center', padding:'24px 16px 28px', fontFamily:"'Outfit','Helvetica Neue',sans-serif", color:'#e2e8f0' }

  if (phase === 'loading') return (
    <div style={root}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width:32, height:32, border:'3px solid rgba(255,255,255,0.08)', borderTop:'3px solid #FD2A20', borderRadius:'50%', animation:'spin 0.85s linear infinite', margin:'24px auto 0' }}/>
      <div style={{ color:'#e2e8f0', fontWeight:700, fontSize:14, marginTop:14 }}>Loading match data</div>
      <div style={{ color:'#475569', fontSize:11, marginTop:4 }}>{msg}</div>
    </div>
  )

  if (phase === 'error') return (
    <div style={root}>
      <div style={{ textAlign:'center', maxWidth:420, padding:'32px 0' }}>
        <div style={{ fontSize:28 }}>⚠️</div>
        <div style={{ color:'#fca5a5', fontWeight:700, fontSize:14, margin:'10px 0 6px' }}>Could not load data</div>
        <div style={{ color:'#475569', fontSize:12, lineHeight:1.7, marginBottom:16 }}>Unable to reach the football data API.</div>
        <button onClick={() => { retryN.current++; setPhase('loading') }}
          style={{ background:'rgba(253,42,32,0.85)', border:'1px solid #FD2A20', borderRadius:7, color:'#fff', padding:'8px 20px', cursor:'pointer', fontWeight:700, fontSize:13 }}>
          ↺ Retry
        </button>
      </div>
    </div>
  )

  return (
    <div style={root}>
      <div style={{ display:'flex', gap:8, marginBottom:10, alignItems:'center', flexWrap:'wrap', justifyContent:'center' }}>
        <div style={{ padding:'4px 14px', borderRadius:6, fontSize:15, fontWeight:800, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#e2e8f0', letterSpacing:1 }}>Matchday {currentMD}</div>
        {saintsRow && <div style={{ padding:'4px 12px', borderRadius:6, fontSize:12, fontWeight:700, background:'rgba(253,42,32,0.12)', border:'1px solid rgba(253,42,32,0.3)', color:'#FD2A20' }}>
          Southampton · {saintsPos}{ord(saintsPos)} · {saintsRow.pts}pts{saintsPos<=2?' 🔼':saintsPos<=6?' 🟡':saintsPos>=22?' 🔻':''}
        </div>}
        <div style={{ fontSize:11, color:'#334155' }}>{matches.filter(m=>m.status==='FINISHED').length} results loaded</div>
      </div>
      <div style={{ background:'rgba(255,255,255,0.015)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:12, overflow:'hidden', boxShadow:'0 20px 60px rgba(0,0,0,0.5)', width:'100%', maxWidth:900 }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display:'block', width:'100%', height:'auto' }} onMouseLeave={() => setHovered(null)}>
          <defs>
            <filter id="gr"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <filter id="gs"><feGaussianBlur stdDeviation="1.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          </defs>
          <rect x={PL} y={PT} width={CW} height={yOf(2.5)-PT} fill="rgba(253,42,32,0.07)"/>
          <rect x={PL} y={yOf(2.5)} width={CW} height={yOf(6.5)-yOf(2.5)} fill="rgba(250,204,21,0.05)"/>
          <rect x={PL} y={yOf(21.5)} width={CW} height={PT+CH-yOf(21.5)} fill="rgba(80,80,100,0.1)"/>
          {[[2.5,'rgba(253,42,32,0.2)'],[6.5,'rgba(250,204,21,0.18)'],[21.5,'rgba(120,120,140,0.15)']].map(([p,c])=>(
            <line key={p} x1={PL} y1={yOf(p)} x2={PL+CW} y2={yOf(p)} stroke={c} strokeWidth={1} strokeDasharray="4,4"/>
          ))}
          <text x={PL+4} y={PT+10} fill="rgba(253,42,32,0.4)" fontSize="8" fontFamily="Outfit" letterSpacing="1.5" fontWeight="600">AUTO PROMOTION</text>
          <text x={PL+4} y={yOf(2.5)+11} fill="rgba(250,204,21,0.38)" fontSize="8" fontFamily="Outfit" letterSpacing="1.5" fontWeight="600">PLAY-OFFS</text>
          <text x={PL+4} y={yOf(21.5)+11} fill="rgba(140,140,160,0.3)" fontSize="8" fontFamily="Outfit" letterSpacing="1.5" fontWeight="600">RELEGATION</text>
          {Array.from({length:maxMD},(_,i)=>i+1).map(md=>{
            const x=xOf(md),ic=md===currentMD,sl=md%5===0||md===1||md===maxMD
            return <g key={md}>
              <line x1={x} y1={PT} x2={x} y2={PT+CH} stroke={ic?'rgba(255,255,255,0.1)':'rgba(255,255,255,0.03)'} strokeWidth={ic?1.5:1}/>
              {sl&&<text x={x} y={H-6} textAnchor="middle" fill={ic?'#94a3b8':'rgba(255,255,255,0.18)'} fontSize={ic?'9':'7.5'} fontFamily="Outfit" fontWeight={ic?'700':'400'}>{md}</text>}
            </g>
          })}
          {[1,3,6,10,15,20,22,24].map(p=>(
            <text key={p} x={PL-3} y={yOf(p)+4} textAnchor="end" fill="rgba(255,255,255,0.15)" fontSize="8.5" fontFamily="Outfit">{p}</text>
          ))}
          <text x={PL+CW/2} y={H-1} textAnchor="middle" fill="rgba(255,255,255,0.1)" fontSize="8" fontFamily="Outfit" letterSpacing="2">MATCHDAY</text>
          {names.filter(n=>n!==saint).map(name=>{
            const pos=curPos(name),d=pathFor(name)
            if(!d) return null
            const top=pos&&pos<=6,rel=pos&&pos>=22,hov=name===hovered
            return <path key={name} d={d} fill="none" stroke={COLORS[name]||'#666'} strokeWidth={hov?2.5:top?1.8:rel?1.4:0.9} strokeOpacity={hov?0.9:top?0.55:rel?0.4:0.18} strokeLinecap="round" strokeLinejoin="round" style={{cursor:'pointer'}} onMouseEnter={()=>setHovered(name)}/>
          })}
          {saint&&<path d={pathFor(saint)} fill="none" stroke="#FD2A20" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" filter="url(#gr)" style={{pointerEvents:'none'}}/>}
          {names.map(name=>{
            const pos=curPos(name); if(!pos) return null
            if(pos>8&&pos<22&&name!==saint&&name!==hovered) return null
            const cx=xOf(currentMD),cy=yOf(pos),is=name===saint
            return <g key={name+'-d'}>{is&&<circle cx={cx} cy={cy} r={9} fill="rgba(253,42,32,0.2)"/>}<circle cx={cx} cy={cy} r={is?5:3.5} fill={COLORS[name]||'#777'} stroke={is?'#fff':'rgba(255,255,255,0.2)'} strokeWidth={is?2:1}/></g>
          })}
          {names.map(name=>{
            const pos=curPos(name); if(!pos) return null
            if(name!==saint&&name!==hovered&&pos>6&&pos<22) return null
            const is=name===saint
            return <text key={name+'-l'} x={xOf(currentMD)+9} y={yOf(pos)+4} fill={is?'#FD2A20':name===hovered?'#e2e8f0':'rgba(255,255,255,0.48)'} fontSize={is?'11':'9'} fontFamily="Outfit" fontWeight={is?'800':'500'} filter={is?'url(#gs)':undefined}>{SHORT[name]||name.split(' ')[0]}</text>
          })}
          {hovered&&hovered!==saint&&(()=>{
            const pos=curPos(hovered),row=curTable.find(r=>r.name===hovered)
            if(!pos||!row) return null
            return <g><rect x={xOf(currentMD)-83} y={yOf(pos)-31} width={81} height={22} rx={4} fill="rgba(8,15,35,0.93)" stroke="rgba(255,255,255,0.1)" strokeWidth={1}/><text x={xOf(currentMD)-42} y={yOf(pos)-16} textAnchor="middle" fill="#e2e8f0" fontSize="9" fontFamily="Outfit" fontWeight="600">{SHORT[hovered]||hovered.split(' ')[0]} · {pos}{ord(pos)} · {row.pts}pts</text></g>
          })()}
        </svg>
      </div>
      <div style={{ display:'flex', gap:10, marginTop:12, alignItems:'center', flexWrap:'wrap', justifyContent:'center' }}>
        <button onClick={()=>{setPlaying(false);setCurrentMD(1)}} style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:7, color:'#f8fafc', padding:'7px 16px', cursor:'pointer', fontSize:12, fontWeight:700 }}>↺ Reset</button>
        <button onClick={()=>{if(currentMD>=maxMD&&!playing){setCurrentMD(1);setPlaying(true)}else setPlaying(p=>!p)}} style={{ background:playing?'rgba(253,42,32,0.15)':'rgba(253,42,32,0.9)', border:`1px solid ${playing?'rgba(253,42,32,0.4)':'#FD2A20'}`, borderRadius:7, color:'#f8fafc', padding:'7px 16px', cursor:'pointer', fontSize:12, fontWeight:700 }}>
          {playing?'⏸ Pause':currentMD>=maxMD?'↺ Replay':'▶ Play'}
        </button>
        <input type="range" min={1} max={maxMD||46} value={currentMD} onChange={e=>{setPlaying(false);setCurrentMD(+e.target.value)}} style={{ width:160, accentColor:'#FD2A20', cursor:'pointer' }}/>
        <select value={speed} onChange={e=>setSpeed(+e.target.value)} style={{ background:'#1e293b', border:'1px solid rgba(255,255,255,0.12)', borderRadius:6, color:'#cbd5e1', padding:'6px 10px', fontSize:12, cursor:'pointer' }}>
          <option value={1200}>Slow</option><option value={400}>Normal</option><option value={150}>Fast</option><option value={60}>Very Fast</option>
        </select>
      </div>
      <div style={{ display:'flex', gap:16, marginTop:10, flexWrap:'wrap', justifyContent:'center', fontSize:10.5, color:'#334155' }}>
        {[['rgba(253,42,32,0.45)','Auto Promotion (1–2)'],['rgba(250,204,21,0.38)','Play-offs (3–6)'],['rgba(120,120,140,0.3)','Relegation (22–24)']].map(([c,l])=>(
          <span key={l} style={{display:'flex',alignItems:'center',gap:5}}><span style={{width:16,height:3,background:c,display:'inline-block',borderRadius:2}}/>{l}</span>
        ))}
        <span>· Hover any line to identify team</span>
      </div>
    </div>
  )
}
