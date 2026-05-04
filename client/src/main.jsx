import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  Activity,
  Axe,
  BookOpen,
  Crown,
  Dices,
  Heart,
  Home,
  Loader2,
  LogOut,
  Eye,
  EyeOff,
  Plus,
  Scroll,
  Shield,
  Sparkles,
  Swords,
  Trash2,
  Trophy,
  User,
  WandSparkles,
  Zap
} from 'lucide-react'
import './styles.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const especies = ['humano', 'enano', 'elfo']
const categorias = ['guerrero', 'explorador', 'mago']
const defaultStats = { vida: 100, ataque: 10, defensa: 5, iniciativa: 5 }

const especieIcon = {
  humano: 'E',
  enano: 'D',
  elfo: 'A'
}

const categoriaIcon = {
  guerrero: Axe,
  explorador: Sparkles,
  mago: WandSparkles
}

const habilidades = {
  guerrero: 'Golpe fuerte: duplica el ataque durante un turno, con coste de vida propia.',
  explorador: 'Esquivar: evita el daño recibido durante un turno.',
  mago: 'Bola de fuego: ignora parte de la defensa y provoca daño arcano adicional.'
}

const BONUS_ESPECIE = {
  humano: { vida: 0, ataque: 0, defensa: 0, iniciativa: 5 },
  enano: { vida: 20, ataque: 5, defensa: 10, iniciativa: -5 },
  elfo: { vida: -10, ataque: 10, defensa: -5, iniciativa: 10 },
}

const BONUS_CATEGORIA = {
  guerrero: { vida: 30, ataque: 15, defensa: 10, iniciativa: 0 },
  explorador: { vida: 10, ataque: 10, defensa: 5, iniciativa: 15 },
  mago: { vida: -10, ataque: 25, defensa: -5, iniciativa: 5 },
}

const calcularStats = (especie, categoria) => {
  const base = { vida: 50, ataque: 10, defensa: 10, iniciativa: 10 }

  const bonusEspecie = BONUS_ESPECIE[especie] || {}
  const bonusCategoria = BONUS_CATEGORIA[categoria] || {}

  return {
    vida: base.vida + (bonusEspecie.vida || 0) + (bonusCategoria.vida || 0),
    ataque: base.ataque + (bonusEspecie.ataque || 0) + (bonusCategoria.ataque || 0),
    defensa: base.defensa + (bonusEspecie.defensa || 0) + (bonusCategoria.defensa || 0),
    iniciativa: base.iniciativa + (bonusEspecie.iniciativa || 0) + (bonusCategoria.iniciativa || 0),
  }
}

const initialForm = () => ({
  nombre: "",
  especie: "humano",
  categoria: "guerrero",
  stats: calcularStats("humano", "guerrero"),
  habilidadEspecial: habilidades["guerrero"]
})



const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

function App() {
  const [entered, setEntered] = useState(false)
  const [view, setView] = useState('hall')
  const [personajes, setPersonajes] = useState([])
  const [form, setForm] = useState(initialForm)
  const [fighters, setFighters] = useState({ id1: '', id2: '' })
  const [combatResult, setCombatResult] = useState(null)
  const [surrenderResult, setSurrenderResult] = useState(null)
  const [visibleRounds, setVisibleRounds] = useState(0)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [pendingDelete, setPendingDelete] = useState(null)
  const [pendingCombatDelete, setPendingCombatDelete] = useState(null)
  const [createSuccess, setCreateSuccess] = useState('')
  const [combates, setCombates] = useState([])
  const [loadingCombates, setLoadingCombates] = useState(false)

  const fighterOne = useMemo(
    () => personajes.find((personaje) => String(personaje.id) === fighters.id1),
    [personajes, fighters.id1]
  )
  const fighterTwo = useMemo(
    () => personajes.find((personaje) => String(personaje.id) === fighters.id2),
    [personajes, fighters.id2]
  )
  const totals = useMemo(() => {
    return personajes.reduce(
      (acc, personaje) => ({
        heroes: acc.heroes + 1,
        victories: acc.victories + (personaje.victorias || 0),
        defeats: acc.defeats + (personaje.derrotas || 0)
      }),
      { heroes: 0, victories: 0, defeats: 0 }
    )
  }, [personajes])

  const loadPersonajes = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/api/personajes`)
      const data = await response.json()
      setPersonajes(Array.isArray(data) ? data : [])
    } catch (error) {
      setMessage('No se pudo abrir el grimorio del backend. Revisa que node index.js esté activo.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (entered) loadPersonajes()
  }, [entered])

  useEffect(() => {
    if (entered && view === 'chronicles') loadCombates()
  }, [entered, view])

  useEffect(() => {
    if (!combatResult || surrenderResult) return
    setVisibleRounds(0)
    const timer = setInterval(() => {
      setVisibleRounds((current) => {
        if (current >= combatResult.log.length) {
          clearInterval(timer)
          return current
        }
        return current + 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [combatResult, surrenderResult])

  const createManual = async (event) => {
    event.preventDefault()
    const creado = await request(`${API_URL}/api/personajes/manual`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        stats: {
          vida: Number(form.stats.vida),
          ataque: Number(form.stats.ataque),
          defensa: Number(form.stats.defensa),
          iniciativa: Number(form.stats.iniciativa)
        }
      })
    })
    if (!creado) return
    setForm({ nombre: '', especie: 'humano', categoria: 'guerrero', stats: defaultStats, habilidadEspecial: '' })
    await loadPersonajes()
    setCreateSuccess(`${creado.nombre} se ha inscrito correctamente en The Roster.`)
  }

  const createRandom = async () => {
    const especie = especies[Math.floor(Math.random() * especies.length)]
    const categoria = categorias[Math.floor(Math.random() * categorias.length)]
    const nombres = ['Aldric', 'Mara', 'Torben', 'Elisa', 'Durgin', 'Broka', 'Aelindra', 'Sorin', 'Nimue']

    const statsCalculados = calcularStats(especie, categoria)

    setForm({
      nombre: nombres[Math.floor(Math.random() * nombres.length)],
      especie,
      categoria,
      stats: statsCalculados,
      habilidadEspecial: HABILIDADES[categoria] || ""
    })
  }


  const deletePersonaje = async (id) => {
    await request(`${API_URL}/api/personajes/${id}`, { method: 'DELETE' })
    setFighters((current) => ({
      id1: current.id1 === String(id) ? '' : current.id1,
      id2: current.id2 === String(id) ? '' : current.id2
    }))
    await loadPersonajes()
    setPendingDelete(null)
  }

  const loadCombates = async () => {
    try {
      setLoadingCombates(true)
      const response = await fetch(`${API_URL}/api/combates/historial`)
      const data = await response.json()
      setCombates(Array.isArray(data.combates) ? data.combates : [])
    } catch (error) {
      setMessage('No se pudieron abrir las crónicas de combate.')
    } finally {
      setLoadingCombates(false)
    }
  }

  const openRandomArena = () => {
    if (personajes.length < 2) {
      setMessage('Necesitas al menos dos héroes para preparar un combate aleatorio.')
      setView('arena')
      return
    }

    const shuffled = [...personajes].sort(() => Math.random() - 0.5)
    setFighters({ id1: String(shuffled[0].id), id2: String(shuffled[1].id) })
    setCombatResult(null)
    setSurrenderResult(null)
    setVisibleRounds(0)
    setView('arena')
  }

  const deleteCombate = async (id) => {
    const deleted = await request(`${API_URL}/api/combates/historial/${id}`, { method: 'DELETE' })
    if (!deleted) return
    setPendingCombatDelete(null)
    await loadCombates()
  }

  const deleteAllCombates = async () => {
    const deleted = await request(`${API_URL}/api/combates/historial`, { method: 'DELETE' })
    if (!deleted) return
    setPendingCombatDelete(null)
    await loadCombates()
  }

  const resetArena = () => {
    setFighters({ id1: '', id2: '' })
    setCombatResult(null)
    setSurrenderResult(null)
    setVisibleRounds(0)
  }

  const randomizeArena = () => {
    if (personajes.length < 2) {
      setMessage('Necesitas al menos dos héroes para preparar un combate aleatorio.')
      return
    }
    const shuffled = [...personajes].sort(() => Math.random() - 0.5)
    setFighters({ id1: String(shuffled[0].id), id2: String(shuffled[1].id) })
    setCombatResult(null)
    setSurrenderResult(null)
    setVisibleRounds(0)
  }

  const startCombat = async () => {
    if (!fighters.id1 || !fighters.id2) {
      setMessage('Elige dos campeones antes de abrir la arena.')
      return
    }
    if (fighters.id1 === fighters.id2) {
      setMessage('Un personaje no puede combatir contra sí mismo.')
      return
    }

    const data = await request(`${API_URL}/api/combates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id1: Number(fighters.id1), id2: Number(fighters.id2) })
    })

    if (data) {
      setCombatResult(data)
      setSurrenderResult(null)
      await loadPersonajes()
    }
  }

  const surrenderCombat = () => {
    if (!combatResult || !fighterOne || !fighterTwo || surrenderResult) return
    const playback = getCombatPlayback(combatResult, visibleRounds, fighterOne, fighterTwo)
    const winner = playback.hp1 >= playback.hp2 ? fighterOne : fighterTwo
    const loser = winner === fighterOne ? fighterTwo : fighterOne
    const log = combatResult.log.slice(0, visibleRounds)

    setSurrenderResult({
      ganador: winner.nombre,
      perdedor: loser.nombre,
      rondas: Math.max(1, visibleRounds),
      log
    })
    setVisibleRounds(log.length)
  }

  const request = async (url, options) => {
    try {
      setMessage('')
      const response = await fetch(url, options)
      const data = await response.json()
      if (!response.ok) {
        setMessage(data.error || 'Algo falló en la aventura.')
        return null
      }
      return data
    } catch (error) {
      setMessage('No hay respuesta del backend. Arranca node index.js y vuelve a intentarlo.')
      return null
    }
  }

  const enterHall = () => {
    setEntered(true)
  }

  const leaveHall = () => {
    setEntered(false)
    setView('hall')
    setCombatResult(null)
    setSurrenderResult(null)
    setVisibleRounds(0)
  }

  if (!entered) {
    return <AuthGate onEnter={enterHall} />
  }

  return (
    <main>
      <NavBar activeView={view} onNavigate={setView} onLeave={leaveHall} />

      {view === 'hall' && (
        <HallDashboard
          totals={totals}
          battles={totals.victories + totals.defeats}
          onNavigate={setView}
          onRandomArena={openRandomArena}
        />
      )}

      {view === 'heroes' && (
        <RosterPage
          personajes={personajes}
          loading={loading}
          message={message}
          onDelete={setPendingDelete}
          onCreate={() => setView('create')}
          onSendArena={(id) => {
            setFighters((current) => ({ ...current, id1: String(id) }))
            setView('arena')
          }}
        />
      )}

      {pendingDelete && (
        <ConfirmDeleteModal
          personaje={pendingDelete}
          onCancel={() => setPendingDelete(null)}
          onConfirm={() => deletePersonaje(pendingDelete.id)}
        />
      )}

      {pendingCombatDelete && (
        <ConfirmDeleteModal
          title="Eliminar crónica"
          message={pendingCombatDelete.all
            ? '¿Seguro que quieres borrar todo el historial de crónicas?'
            : `¿Seguro que quieres borrar el combate ${pendingCombatDelete.ganador} contra ${pendingCombatDelete.perdedor}?`}
          onCancel={() => setPendingCombatDelete(null)}
          onConfirm={() => pendingCombatDelete.all ? deleteAllCombates() : deleteCombate(pendingCombatDelete.id)}
        />
      )}

      {view === 'create' && (
        <>
          {message && <div className="notice">{message}</div>}
          <CharacterForm
            form={form}
            setForm={setForm}
            onSubmit={createManual}
            onRandom={createRandom}
            onBack={() => setView('heroes')}
            successMessage={createSuccess}
          />
        </>
      )}

      {view === 'arena' && (
        <section className="layout arena-layout">
          {message && <div className="notice">{message}</div>}
          <Arena
            personajes={personajes}
            fighters={fighters}
            setFighters={setFighters}
            fighterOne={fighterOne}
            fighterTwo={fighterTwo}
            result={surrenderResult || combatResult}
            visibleRounds={visibleRounds}
            onCombat={startCombat}
            onNew={resetArena}
            onRandom={randomizeArena}
            onSurrender={surrenderCombat}
            canSurrender={Boolean(combatResult && !surrenderResult && visibleRounds > 0 && visibleRounds < combatResult.log.length)}
          />
        </section>
      )}

      {view === 'chronicles' && (
        <ChroniclesPage
          combates={combates}
          loading={loadingCombates}
          onDelete={setPendingCombatDelete}
          onDeleteAll={() => setPendingCombatDelete({ all: true, ganador: 'todo el historial', perdedor: 'las crónicas' })}
        />
      )}
    </main>
  )
}

function AuthGate({ onEnter }) {
  const [mode, setMode] = useState('signin')
  const [credentials, setCredentials] = useState({ name: '', email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(credentials.email)
    const passwordIsValid = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(credentials.password)
    const email = credentials.email.trim().toLowerCase()
    const registeredEmails = JSON.parse(localStorage.getItem('rpg-emails') || '[]')

    if (!emailIsValid) {
      setAuthError('Introduce un email válido, por ejemplo nombre@example.com.')
      return
    }

    if (!passwordIsValid) {
      setAuthError('La contraseña debe tener 8 caracteres o más, letras, números y al menos un signo.')
      return
    }

    if (mode === 'enlist' && registeredEmails.includes(email)) {
      setAuthError('Ese email ya está inscrito. Usa otro correo o entra con la pestaña Entrar.')
      return
    }

    if (mode === 'enlist') {
      localStorage.setItem('rpg-emails', JSON.stringify([...registeredEmails, email]))
    }

    setAuthError('')
    onEnter()
  }

  return (
    <main className="auth-screen">
      <div className="auth-vignette" />
      <section className="auth-panel-wrap">
        <div className="auth-brand">
          <Scroll className="auth-scroll" aria-hidden="true" />
          <h1>Aetheria</h1>
          <p>Relatos de acero y hechicería</p>
        </div>

        <div className="parchment auth-card">
          <div className="auth-tabs" role="tablist" aria-label="Modo de entrada">
            <button
              className={mode === 'signin' ? 'active' : ''}
              type="button"
              onClick={() => setMode('signin')}
            >
              Entrar
            </button>
            <button
              className={mode === 'enlist' ? 'active' : ''}
              type="button"
              onClick={() => setMode('enlist')}
            >
              Alistarse
            </button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {mode === 'enlist' && (
              <label>
                Nombre de aventurer@
                <input
                  value={credentials.name}
                  onChange={(event) => setCredentials({ ...credentials, name: event.target.value })}
                  placeholder="Nombre"
                />
              </label>
            )}

            <label>
              Email
              <input
                type="email"
                value={credentials.email}
                onChange={(event) => setCredentials({ ...credentials, email: event.target.value })}
                placeholder="nombre@example.com"
                pattern="^[^\s@]+@[^\s@]+\.[^\s@]{2,}$"
                title="Introduce un email válido, por ejemplo nombre@example.com"
                required
              />
            </label>

            <label>
              Contraseña
              <span className="password-field">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={credentials.password}
                  onChange={(event) => setCredentials({ ...credentials, password: event.target.value })}
                  placeholder="Mínimo 8 caracteres"
                  minLength={8}
                  pattern="^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$"
                  title="Mínimo 8 caracteres, letras, números y al menos un signo"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </span>
            </label>

            {authError && <p className="auth-error">{authError}</p>}

            <button className="button primary auth-submit" type="submit">
              {mode === 'signin' ? 'Entrar al Hall' : 'Tomar el juramento'}
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}

function HallDashboard({ totals, battles, onNavigate, onRandomArena }) {
  return (
    <>
      <section className="hall-hero">
        <div className="hall-hero__content">
          <p className="hall-kicker">El Hall de los aventureros</p>
          <h1>Forja tu leyenda</h1>
          <p>Inscribe nuevos héroes sobre el pergamino, convoca campeones antiguos y hazlos luchar en la arena del destino.</p>
          <div className="hall-actions">
            <button className="button primary" type="button" onClick={() => onNavigate('create')}>
              <Plus size={18} />
              Forjar héroe
            </button>
            <button className="button outline-gold" type="button" onClick={() => onNavigate('heroes')}>
              <Scroll size={18} />
              Ver la lista
            </button>
            <button className="button outline-blood" type="button" onClick={onRandomArena}>
              <Swords size={18} />
              Entrar en la arena
            </button>
          </div>
        </div>
      </section>

      <section className="dashboard-layout">
        <div className="stats-strip">
          <Metric icon={<Scroll />} value={totals.heroes} label="Héroes" />
          <Metric icon={<Swords />} value={battles} label="Combates" arcane />
          <Metric icon={<Trophy />} value={totals.victories} label="Victorias" />
          <Metric icon={<Activity />} value={totals.defeats} label="Derrotas" blood />
        </div>

        <div className="dashboard-cards">
          <DashboardCard
            icon={<Scroll />}
            title="The Roster"
            copy="Elige entre tus héroes forjados o invoca campeones de leyenda."
            action="Ver héroes"
            onClick={() => onNavigate('heroes')}
          />
          <DashboardCard
            icon={<Swords />}
            title="La arena"
            copy="Enfrenta a dos guerreros. La iniciativa decide quién golpea primero."
            action="Empezar combate"
            onClick={() => onNavigate('arena')}
            blood
          />
        </div>

        <button className="parchment chronicles-card" type="button" onClick={() => onNavigate('chronicles')}>
          <BookOpen />
          <span>
            <strong>Las crónicas</strong>
            <small>Revisa combates pasados y sus relatos.</small>
          </span>
          <span className="arrow">→</span>
        </button>
      </section>
    </>
  )
}

function Metric({ icon, value, label, arcane, blood }) {
  return (
    <article className={`parchment metric ${arcane ? 'metric-arcane' : ''} ${blood ? 'metric-blood' : ''}`}>
      {icon}
      <strong>{value}</strong>
      <span>{label}</span>
    </article>
  )
}

function DashboardCard({ icon, title, copy, action, onClick, blood }) {
  return (
    <article className={`parchment dashboard-card ${blood ? 'dashboard-card--blood' : ''}`}>
      {icon}
      <h2>{title}</h2>
      <p>{copy}</p>
      <button type="button" onClick={onClick}>{action} →</button>
    </article>
  )
}

function RosterPage({ personajes, loading, message, onDelete, onCreate, onSendArena }) {
  const champions = personajes.slice(0, 4)
  const forgedHeroes = personajes.slice(4)

  return (
    <section className="roster-page">
      <div className="roster-heading">
        <div>
          <h1>The Roster</h1>
          <p>Campeones antiguos y héroes recién forjados.</p>
        </div>
        <button className="button primary" type="button" onClick={onCreate}>
          <Plus size={18} />
          Forjar nuevo héroe
        </button>
      </div>

      {message && <div className="notice">{message}</div>}

      {loading ? (
        <div className="empty-state parchment">
          <Loader2 className="spin" />
          Consultando pergaminos...
        </div>
      ) : (
        <>
          <RosterSection title="Campeones de leyenda" icon={<Crown />}>
            {champions.length > 0 ? (
              <div className="roster-grid">
                {champions.map((personaje) => (
                  <RosterCharacterCard key={personaje.id} personaje={personaje} onDelete={onDelete} onSendArena={onSendArena} legend />
                ))}
              </div>
            ) : (
              <div className="empty-state parchment">Todavía no hay campeones registrados.</div>
            )}
          </RosterSection>

          <RosterSection title="Tus héroes forjados" icon={<User />} accent="arcane">
            {forgedHeroes.length > 0 ? (
              <div className="roster-grid">
                {forgedHeroes.map((personaje) => (
                  <RosterCharacterCard key={personaje.id} personaje={personaje} onDelete={onDelete} onSendArena={onSendArena} />
                ))}
              </div>
            ) : (
              <div className="forged-empty parchment">
                <p>Aún no hay héroes creados por ti. La forja espera.</p>
                <button className="button primary" type="button" onClick={onCreate}>
                  <Plus size={18} />
                  Forjar héroe
                </button>
              </div>
            )}
          </RosterSection>
        </>
      )}
    </section>
  )
}

function RosterSection({ title, icon, accent, children }) {
  return (
    <section className={`roster-section ${accent ? `roster-section--${accent}` : ''}`}>
      <div className="roster-section-title">
        {icon}
        <h2>{title}</h2>
        <span />
      </div>
      {children}
    </section>
  )
}

function RosterCharacterCard({ personaje, onDelete, onSendArena, legend }) {
  const Icon = categoriaIcon[personaje.categoria] || Sparkles
  const maxHp = Math.max(1, personaje.stats?.vida || 1)
  const inicial = personaje.nombre?.trim()?.charAt(0)?.toUpperCase() || '?'

  return (
    <article className="parchment roster-character-card">
      <button className="icon-button danger card-delete" onClick={() => onDelete(personaje)} title="Eliminar">
        <Trash2 size={16} />
      </button>
      <div className="roster-glyph">{legend ? <Crown size={26} /> : inicial}</div>
      <h3>{personaje.nombre}</h3>
      <p>{personaje.especie} · {personaje.categoria}</p>
      <div className="mini-record">
        <Trophy size={13} /> {personaje.victorias || 0}
        <Activity size={13} /> {personaje.derrotas || 0}
      </div>
      <div className="roster-hp">
        <span><Heart size={14} /> Vida</span>
        <strong>{personaje.stats?.vida} / {maxHp}</strong>
        <div><i style={{ width: '100%' }} /></div>
      </div>
      <div className="stat-grid">
        <Stat icon={<Icon size={17} />} label="Ataque" value={personaje.stats?.ataque} />
        <Stat icon={<Shield size={17} />} label="Defensa" value={personaje.stats?.defensa} />
        <Stat icon={<Zap size={17} />} label="Iniciativa" value={personaje.stats?.iniciativa} />
      </div>
      <div className="special-ability">
        <div>
          <Sparkles size={16} />
          <span>Habilidad especial</span>
        </div>
        <p>{personaje.habilidadEspecial || habilidades[personaje.categoria] || 'Talento único preparado para el combate.'}</p>
      </div>
      <button className="button blood send-arena" type="button" onClick={() => onSendArena(personaje.id)}>
        <Swords size={18} />
        Enviar a la arena
      </button>
    </article>
  )
}

function ConfirmDeleteModal({ personaje, title = 'Eliminar héroe', message, onCancel, onConfirm }) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="parchment confirm-modal" role="dialog" aria-modal="true" aria-labelledby="delete-title">
        <Trash2 className="confirm-icon" />
        <h2 id="delete-title">{title}</h2>
        <p>{message || <>¿Seguro que quieres borrar a <strong>{personaje.nombre}</strong> del roster?</>}</p>
        <div className="modal-actions">
          <button className="button ghost" type="button" onClick={onCancel}>Cancelar</button>
          <button className="button blood" type="button" onClick={onConfirm}>Eliminar</button>
        </div>
      </section>
    </div>
  )
}
function ChroniclesPage({ combates, loading, onDelete, onDeleteAll }) {
  const orderedCombates = combates
    .map((combate, index) => ({ ...combate, id: combate.id ?? index }))
    .reverse()

  return (
    <section className="chronicles-page">
      <div className="roster-heading">
        <div>
          <h1>Las crónicas</h1>
          <p>Combates guardados en el historial del backend.</p>
        </div>
        {combates.length > 0 && (
          <button className="button blood" type="button" onClick={onDeleteAll}>
            <Trash2 size={18} />
            Eliminar historial
          </button>
        )}
      </div>

      {loading ? (
        <div className="empty-state parchment">
          <Loader2 className="spin" />
          Leyendo pergaminos...
        </div>
      ) : combates.length === 0 ? (
        <div className="parchment panel chronicles-empty">
          <BookOpen />
          <h2>No hay combates todavía</h2>
          <p>Cuando luches en la arena, las crónicas aparecerán aquí.</p>
        </div>
      ) : (
        <div className="chronicles-list">
          {orderedCombates.map((combate, index) => (
            <article className="parchment chronicle-entry" key={`${combate.fecha}-${index}`}>
              <div>
                <span className="chronicle-date">{formatDate(combate.fecha)}</span>
                <h2>{combate.ganador} venció a {combate.perdedor}</h2>
              </div>
              <div className="chronicle-actions">
                <strong>{combate.rondas} ronda{combate.rondas === 1 ? '' : 's'}</strong>
                <button className="icon-button danger" type="button" onClick={() => onDelete(combate)} title="Eliminar crónica">
                  <Trash2 size={16} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

function formatDate(value) {
  if (!value) return 'Fecha desconocida'
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value))
}

function NavBar({ activeView, onNavigate, onLeave }) {
  return (
    <nav className="navbar">
      <button type="button" className="brand brand-button" onClick={() => onNavigate('hall')}>
        <Scroll size={24} />
        <span>Aetheria</span>
      </button>
      <div className="nav-actions">
        <button className={activeView === 'hall' ? 'active' : ''} type="button" onClick={() => onNavigate('hall')}><Home size={15} /> Hall</button>
        <button className={activeView === 'heroes' ? 'active' : ''} type="button" onClick={() => onNavigate('heroes')}><Scroll size={15} /> Héroes</button>
        <button className={activeView === 'arena' ? 'active' : ''} type="button" onClick={() => onNavigate('arena')}><Swords size={15} /> Arena</button>
        <button className={activeView === 'chronicles' ? 'active' : ''} type="button" onClick={() => onNavigate('chronicles')}><BookOpen size={15} /> Crónicas</button>
      </div>
      <button className="depart-button" type="button" onClick={onLeave} title="Salir">
        <LogOut size={15} />
        Abandonar
      </button>
    </nav>
  )
}

function CharacterForm({ form, setForm, onSubmit, onRandom, onBack, successMessage }) {
  const blockNonNumeric = (event) => {
    if (['e', 'E', '+', '-', '.', ','].includes(event.key)) event.preventDefault()
  }

  const handleChange = (key, value) => {
  const newForm = { ...form, [key]: value }

  // Obtener especie y categoría ACTUALIZADAS
  const especieFinal = key === "especie" ? value : form.especie
  const categoriaFinal = key === "categoria" ? value : form.categoria

  // Recalcular stats y habilidad
  if (key === "especie" || key === "categoria") {
    newForm.stats = calcularStats(especieFinal, categoriaFinal)
    newForm.habilidadEspecial = habilidades[categoriaFinal] || ""
  }

  setForm(newForm)
}


  return (
      <section className="create-page">
        <button className="back-link" type="button" onClick={onBack}>← Volver</button>

        <div className="parchment create-card">
          <div className="create-heading">
            <Sparkles aria-hidden="true" />
            <h2>Forjar un héroe</h2>
            <p>Inscribe su nombre y dones sobre el pergamino.</p>
          </div>

          <form onSubmit={onSubmit} className="create-form">
            <div className="identity-grid">
              <label>
                Nombre
                <input
                  value={form.nombre}
                  onChange={(e) => handleChange("nombre", e.target.value)}
                  placeholder="Eldrin..."
                  required
                />
              </label>

            <label>
              Especie
              <select value={form.especie} onChange={(e) => handleChange("especie", e.target.value)}>
                {especies.map((especie) => (
                  <option key={especie} value={especie}>
                    {especie}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Categoría
              <select value={form.categoria} onChange={(e) => handleChange("categoria", e.target.value)}>
                {categorias.map((categoria) => (
                  <option key={categoria} value={categoria}>
                    {categoria}
                  </option>
                ))}
              </select>
            </label>

            </div>

            <div className="ornament-line" />

            <div className="stats-header">
              <h3>Stats</h3>
              <span>Calculados automáticamente</span>
            </div>

            <div className="stats-input-grid">
              <label>Vida <input value={form.stats.vida} disabled /></label>
              <label>Ataque <input value={form.stats.ataque} disabled /></label>
              <label>Defensa <input value={form.stats.defensa} disabled /></label>
              <label>Iniciativa <input value={form.stats.iniciativa} disabled /></label>
            </div>

            <div className="ornament-line" />

            <label>
              Habilidad especial
              <textarea value={form.habilidadEspecial} disabled />
            </label>

            <div className="button-row">
              <button className="button primary" type="submit">
                <Plus size={18} />
                Inscribir en el roster
              </button>

              <button className="button ghost" type="button" onClick={onRandom}>
                <Dices size={18} />
                Aleatorio
              </button>
            </div>
          </form>
        </div>

        {successMessage && <p className="create-success">{successMessage}</p>}
      </section>
    )
}
function Arena({ personajes, fighters, setFighters, fighterOne, fighterTwo, result, visibleRounds, onCombat, onNew, onRandom, onSurrender, canSurrender }) {
  const playback = getCombatPlayback(result, visibleRounds, fighterOne, fighterTwo)

  return (
    <section className="parchment panel" id="arena">
      <div className="arena-card-header">
        <div className="panel__header">
          <Swords aria-hidden="true" />
          <div>
            <h2>Arena de combate</h2>
            <p>Selecciona dos fichas y reproduce el log ronda a ronda.</p>
          </div>
        </div>
        <div className="arena-tools">
          <button className="button ghost compact-button" type="button" onClick={onNew}>Nuevo</button>
          <button className="button primary compact-button" type="button" onClick={onRandom}>Aleatorio</button>
        </div>
      </div>

      <div className="duel-selectors">
        <label>
          Campeón I
          <select value={fighters.id1} onChange={(event) => setFighters({ ...fighters, id1: event.target.value })}>
            <option value="">Elegir...</option>
            {personajes.map((personaje) => <option key={personaje.id} value={personaje.id}>{personaje.nombre}</option>)}
          </select>
        </label>
        <label>
          Campeón II
          <select value={fighters.id2} onChange={(event) => setFighters({ ...fighters, id2: event.target.value })}>
            <option value="">Elegir...</option>
            {personajes.map((personaje) => <option key={personaje.id} value={personaje.id}>{personaje.nombre}</option>)}
          </select>
        </label>
      </div>

      <div className="fighters">
        <CharacterCard
          personaje={fighterOne}
          placeholder="Esperando campeón I"
          currentHp={playback.hp1}
          active={playback.activeName === fighterOne?.nombre}
          defeated={playback.done && result?.perdedor === fighterOne?.nombre}
        />
        <CharacterCard
          personaje={fighterTwo}
          placeholder="Esperando campeón II"
          currentHp={playback.hp2}
          active={playback.activeName === fighterTwo?.nombre}
          defeated={playback.done && result?.perdedor === fighterTwo?.nombre}
          blood
        />
      </div>

      <div className="arena-actions">
        <button className="button blood full" type="button" onClick={onCombat}>
          <Swords size={18} />
          Combatir
        </button>
        <button className="button ghost surrender-button" type="button" onClick={onSurrender} disabled={!canSurrender}>
          Rendirse
        </button>
      </div>

      <CombatLog result={result} visibleRounds={visibleRounds} />
    </section>
  )
}

function getCombatPlayback(result, visibleRounds, fighterOne, fighterTwo) {
  const initial = {
    hp1: fighterOne?.stats?.vida || 0,
    hp2: fighterTwo?.stats?.vida || 0,
    activeName: '',
    done: Boolean(result && visibleRounds >= result.log.length)
  }

  if (!result || !fighterOne || !fighterTwo) return initial

  return result.log.slice(0, visibleRounds).reduce((state, line) => {
    const hit = line.match(/^(?:Ronda\s+\S+:\s+)?(.+?)\s+→\s+(.+?)\s+\[-\d+\s+vida\]\s+\((\d+)\s+restante\)/)
    if (hit) {
      const attacker = hit[1].trim()
      const defender = hit[2].trim()
      const remaining = Number(hit[3])
      return {
        ...state,
        activeName: attacker,
        hp1: defender === fighterOne.nombre ? remaining : state.hp1,
        hp2: defender === fighterTwo.nombre ? remaining : state.hp2
      }
    }

    const firstName = [fighterOne.nombre, fighterTwo.nombre].find((name) => line.includes(name))
    return firstName ? { ...state, activeName: firstName } : state
  }, initial)
}

function HouseEmblem({ personaje }) {
  const Icon = categoriaIcon[personaje.categoria] || Sparkles
  return <Icon size={26} />
}

function CharacterCard({ personaje, placeholder, blood, currentHp, active, defeated }) {
  if (!personaje) return <div className="fighter-placeholder">{placeholder}</div>
  const Icon = categoriaIcon[personaje.categoria] || Sparkles
  const hp = currentHp ?? personaje.stats.vida
  const hpPercent = Math.max(0, Math.min(100, (hp / personaje.stats.vida) * 100))

  return (
    <article className={`character-card ${blood ? 'blood-card' : ''} ${active ? 'is-active' : ''} ${defeated ? 'is-defeated' : ''}`}>
      <div className="crest"><HouseEmblem personaje={personaje} /></div>
      <h3>{personaje.nombre}</h3>
      <p>{personaje.especie} · {personaje.categoria}</p>
      <div className="hp-line">
        <Heart size={16} />
        <span style={{ width: `${hpPercent}%` }} />
        <strong>{hp} / {personaje.stats.vida}</strong>
      </div>
      <div className="stat-grid">
        <Stat icon={<Icon size={17} />} label="ATQ" value={personaje.stats.ataque} />
        <Stat icon={<Shield size={17} />} label="DEF" value={personaje.stats.defensa} />
        <Stat icon={<Zap size={17} />} label="INI" value={personaje.stats.iniciativa} />
      </div>
      <div className="record">
        <Trophy size={15} /> {personaje.victorias || 0}
        <Activity size={15} /> {personaje.derrotas || 0}
      </div>
      <div className="arena-ability">
        <Sparkles size={14} />
        <span>{personaje.habilidadEspecial || habilidades[personaje.categoria]}</span>
      </div>
    </article>
  )
}

function Stat({ icon, label, value }) {
  return (
    <div className="stat-box">
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function CombatLog({ result, visibleRounds }) {
  if (!result) {
    return <div className="combat-log muted">El log de combate aparecerá aquí cuando dos campeones crucen armas.</div>
  }

  const done = visibleRounds >= result.log.length

  return (
    <div className="combat-log">
      <div className="winner-banner">
        <Trophy />
        <div>
          <span>{done ? 'Ganador' : 'Combate en curso'}</span>
          <strong>{done ? result.ganador : 'Revelando rondas...'}</strong>
        </div>
      </div>
      <div className="rounds">
        {result.log.slice(0, visibleRounds).map((line, index) => (
          <p key={`${line}-${index}`}>{line}</p>
        ))}
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')).render(<App />)


