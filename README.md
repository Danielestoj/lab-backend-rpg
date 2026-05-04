
# Lab | Ejercicio en grupo — Backend RPG

### Requisitos

* Haz un fork de este repositorio
* Clona este repositorio

### Entrega

* Al finalizar, ejecuta los siguientes comandos:

```
git add .
git commit -m "done"
git push origin [master/main]
```

* Crea un Pull Request y envía tu entrega.

## Descripción del proyecto

Construiréis en grupo el backend completo de un juego de rol por turnos. La aplicación gestiona **fichas de personaje**, simula **combates** entre ellos y persiste los datos en **ficheros de texto** — sin base de datos, solo el módulo `fs` de Node.

El proyecto consolida todo lo visto hasta ahora: Express, Router, Controladores, Middleware y Programación Orientada a Objetos. Al terminar sabréis separar capas, modelar un dominio con clases y leer/escribir datos en disco.

## Requisitos previos

- Haber completado los Labs D1 y D2 de la semana (Express básico + Router y Controladores)
- Haber leído el material del D3 (Middleware y POO)
- Postman o Thunder Client
- Node.js 18+

## Sistema de juego

### Especies disponibles

| Especie  | vida | ataque | defensa | iniciativa |
|----------|:----:|:------:|:-------:|:----------:|
| humano   | +0   | +0     | +0      | +5         |
| enano    | +20  | +5     | +10     | -5         |
| elfo     | -10  | +10    | -5      | +10        |

### Categorías disponibles

| Categoría   | vida | ataque | defensa | iniciativa |
|-------------|:----:|:------:|:-------:|:----------:|
| guerrero    | +30  | +15    | +10     | +0         |
| explorador  | +10  | +10    | +5      | +15        |
| mago        | -10  | +25    | -5      | +5         |

**Stats base** de cualquier personaje antes de aplicar bonus: `vida=100, ataque=10, defensa=5, iniciativa=5`

Los stats finales se obtienen **sumando** el bonus de especie y el de categoría a la base.

**Ejemplo**: un elfo mago tendrá `vida=80, ataque=45, defensa=-5, iniciativa=20`

## Estructura de carpetas

Esta es la arquitectura profesional que debéis respetar. Cada capa tiene una responsabilidad única:

```
rpg-backend/
├── src/
│   ├── classes/                  ← POO pura, sin ninguna dependencia de Express
│   │   ├── Personaje.js          ← Clase base
│   │   ├── Guerrero.js           ← extends Personaje
│   │   ├── Explorador.js
│   │   ├── Mago.js
│   │   └── Combate.js            ← Motor de simulación de combate
│   ├── services/
│   │   ├── PersonajeService.js   ← CRUD en memoria + generadores
│   │   └── StorageService.js     ← Lectura y escritura de ficheros .txt
│   ├── controllers/
│   │   ├── personajeController.js
│   │   └── combateController.js
│   ├── routes/
│   │   ├── personajes.js
│   │   └── combates.js
│   ├── middleware/
│   │   ├── logger.js
│   │   ├── validarCampos.js
│   │   └── errorHandler.js
│   └── utils/
│       ├── AppError.js
│       └── nombresAleatorios.js
├── data/
│   ├── personajes.txt            ← Una ficha JSON por línea (formato NDJSON)
│   └── combates.txt              ← Historial de combates (bonus)
├── index.js
├── .env
└── package.json
```

> **Por qué esta estructura**: las `classes/` contienen lógica de dominio pura (matematicamente testeable sin Express). Los `services/` orquestan esa lógica. Los `controllers/` solo traducen HTTP a llamadas de servicio. Los `routes/` solo declaran qué middleware y controlador maneja cada verbo+ruta. Esta separación hace el código mantenible y testeable.

## División del trabajo

| Rol | Responsabilidad principal | Archivos |
|-----|--------------------------|----------|
| **Arquitecto de dominio** | Clases + herencia + combate | `src/classes/` |
| **Capa de datos** | Servicios + persistencia en fichero | `src/services/` |
| **Capa de API** | Rutas + controladores + middleware | `src/routes/`, `src/controllers/`, `src/middleware/` |
| **Integración** | Ensamblado, `.env`, README del proyecto | `index.js`, `data/` |

> Los roles se pueden repartir entre 3 o 4 personas. En grupos de 3, el Arquitecto de dominio también asume la Capa de datos.

## Endpoints a implementar

```
GET    /api/personajes             → Lista todos (filtros opcionales: ?especie= ?categoria=)
GET    /api/personajes/:id         → Detalle de un personaje
POST   /api/personajes/manual      → Crea un personaje con datos concretos
POST   /api/personajes/aleatorio   → Genera un personaje aleatorio completo
PUT    /api/personajes/:id         → Actualiza el nombre
DELETE /api/personajes/:id         → Elimina

POST   /api/combates               → Simula un combate (body: { id1, id2 })
GET    /api/combates/historial     → Lista combates guardados (bonus)

GET    /api/estadisticas           → Distribución por especie/categoría + campeón (bonus)
```

## Setup inicial

```bash
mkdir rpg-backend && cd rpg-backend
npm init -y
npm install express dotenv
mkdir -p src/classes src/services src/controllers src/routes src/middleware src/utils data
touch index.js .env data/personajes.txt
```

`.env`:
```
PORT=3000
```

## Paso 1: Utilidad AppError

Crea `src/utils/AppError.js`:

```javascript
class AppError extends Error {
  constructor(mensaje, statusCode) {
    super(mensaje)
    this.statusCode = statusCode
    this.isOperational = true
    Error.captureStackTrace(this, this.constructor)
  }
}

module.exports = AppError
```

## Paso 2: Pool de nombres aleatorios

Crea `src/utils/nombresAleatorios.js`:

```javascript
const nombres = {
  humano:   ['Aldric', 'Mara', 'Torben', 'Elisa', 'Cain', 'Sera'],
  enano:    ['Durgin', 'Broka', 'Halvard', 'Ilda', 'Grimr', 'Vorna'],
  elfo:     ['Aelindra', 'Sorin', 'Lyshara', 'Eryn', 'Caladel', 'Nimue']
}

const ESPECIES    = ['humano', 'enano', 'elfo']
const CATEGORIAS  = ['guerrero', 'explorador', 'mago']

const aleatorio = (arr) => arr[Math.floor(Math.random() * arr.length)]

const generarNombre   = (especie) => aleatorio(nombres[especie] || nombres.humano)
const generarEspecie  = () => aleatorio(ESPECIES)
const generarCategoria = () => aleatorio(CATEGORIAS)

module.exports = { generarNombre, generarEspecie, generarCategoria, ESPECIES, CATEGORIAS }
```

## Paso 3: Clase base `Personaje`

Crea `src/classes/Personaje.js`:

```javascript
const BONUS_ESPECIE = {
  humano:  { vida: 0,   ataque: 0,  defensa: 0,  iniciativa: 5  },
  enano:   { vida: 20,  ataque: 5,  defensa: 10, iniciativa: -5 },
  elfo:    { vida: -10, ataque: 10, defensa: -5, iniciativa: 10 }
}

const BONUS_CATEGORIA = {
  guerrero:   { vida: 30,  ataque: 15, defensa: 10, iniciativa: 0  },
  explorador: { vida: 10,  ataque: 10, defensa: 5,  iniciativa: 15 },
  mago:       { vida: -10, ataque: 25, defensa: -5, iniciativa: 5  }
}

class Personaje {
  constructor({ id, nombre, especie, categoria }) {
    this.id        = id
    this.nombre    = nombre
    this.especie   = especie
    this.categoria = categoria
    this.stats     = this._calcularStats()
    this.victorias = 0
    this.derrotas  = 0
  }

  _calcularStats() {
    const base = { vida: 100, ataque: 10, defensa: 5, iniciativa: 5 }
    const be   = BONUS_ESPECIE[this.especie]   || {}
    const bc   = BONUS_CATEGORIA[this.categoria] || {}

    return {
      vida:       base.vida       + (be.vida       || 0) + (bc.vida       || 0),
      ataque:     base.ataque     + (be.ataque      || 0) + (bc.ataque     || 0),
      defensa:    base.defensa    + (be.defensa     || 0) + (bc.defensa    || 0),
      iniciativa: base.iniciativa + (be.iniciativa  || 0) + (bc.iniciativa || 0)
    }
  }

  // Método que las subclases deben sobreescribir
  habilidadEspecial() {
    throw new Error(`${this.constructor.name} debe implementar habilidadEspecial()`)
  }

  get ficha() {
    return {
      id:        this.id,
      nombre:    this.nombre,
      especie:   this.especie,
      categoria: this.categoria,
      stats:     this.stats,
      victorias: this.victorias,
      derrotas:  this.derrotas
    }
  }
}

module.exports = { Personaje, BONUS_ESPECIE, BONUS_CATEGORIA }
```

## Paso 4: Subclases

Crea `src/classes/Guerrero.js`:

```javascript
const { Personaje } = require('./Personaje')

class Guerrero extends Personaje {
  // Golpe fuerte: daño doble, pero pierde 10 de vida propia
  habilidadEspecial(vidaActualOponente) {
    const danio = this.stats.ataque * 2
    return { danio, costePropio: 10, descripcion: `${this.nombre} usa GOLPE FUERTE (${danio} daño)` }
  }
}

module.exports = Guerrero
```

Crea `src/classes/Explorador.js`:

```javascript
const { Personaje } = require('./Personaje')

class Explorador extends Personaje {
  // Esquivar: ignora el siguiente ataque (devuelve 0 de daño recibido este turno)
  habilidadEspecial() {
    return { danio: this.stats.ataque, esquiva: true, descripcion: `${this.nombre} usa ESQUIVAR` }
  }
}

module.exports = Explorador
```

Crea `src/classes/Mago.js`:

```javascript
const { Personaje } = require('./Personaje')

class Mago extends Personaje {
  // Hechizo: ignora la defensa del rival
  habilidadEspecial() {
    return { danio: this.stats.ataque, ignoraDefensa: true, descripcion: `${this.nombre} lanza HECHIZO` }
  }
}

module.exports = Mago
```

## Paso 5: Motor de combate `Combate`

Crea `src/classes/Combate.js`:

```javascript
class Combate {
  /**
   * Simula un combate por turnos entre dos personajes.
   * Recibe objetos planos (fichas), no instancias de clase.
   * Devuelve: { ganador, perdedor, rondas, log }
   */
  static simular(fichaA, fichaB) {
    // Copias de vida para no mutar los originales
    let vidaA = fichaA.stats.vida
    let vidaB = fichaB.stats.vida
    const log = []
    let ronda  = 0

    // Determinar orden: mayor iniciativa ataca primero
    const [primero, segundo] =
      fichaA.stats.iniciativa >= fichaB.stats.iniciativa
        ? [fichaA, fichaB]
        : [fichaB, fichaA]

    let vidaPrimero  = primero  === fichaA ? vidaA : vidaB
    let vidaSegundo  = primero  === fichaA ? vidaB : vidaA

    log.push(`⚔️  ${primero.nombre} (iniciativa ${primero.stats.iniciativa}) ataca primero`)

    while (vidaPrimero > 0 && vidaSegundo > 0) {
      ronda++

      // Turno del primero
      const danioPrimero = Math.max(1, primero.stats.ataque - segundo.stats.defensa)
      vidaSegundo -= danioPrimero
      log.push(`Ronda ${ronda}a: ${primero.nombre} → ${segundo.nombre} [-${danioPrimero} vida] (${Math.max(0, vidaSegundo)} restante)`)

      if (vidaSegundo <= 0) break

      // Turno del segundo
      const danioSegundo = Math.max(1, segundo.stats.ataque - primero.stats.defensa)
      vidaPrimero -= danioSegundo
      log.push(`Ronda ${ronda}b: ${segundo.nombre} → ${primero.nombre} [-${danioSegundo} vida] (${Math.max(0, vidaPrimero)} restante)`)
    }

    const ganador  = vidaPrimero > 0 ? primero : segundo
    const perdedor = ganador === primero ? segundo : primero

    log.push(`🏆 Ganador: ${ganador.nombre} en ${ronda} ronda(s)`)

    return { ganador: ganador.nombre, perdedor: perdedor.nombre, rondas: ronda, log }
  }
}

module.exports = Combate
```

## Paso 6: `StorageService` — persistencia en fichero

Crea `src/services/StorageService.js`:

```javascript
const fs   = require('fs')
const path = require('path')

// Ruta absoluta al fichero de datos
const RUTA = path.join(__dirname, '../../data/personajes.txt')

/**
 * Formato NDJSON: cada línea es un objeto JSON independiente.
 * Ventaja: podemos hacer append sin reescribir todo el fichero.
 */
const StorageService = {
  leerPersonajes() {
    if (!fs.existsSync(RUTA)) return []

    const contenido = fs.readFileSync(RUTA, 'utf-8').trim()
    if (!contenido) return []

    return contenido
      .split('\n')
      .filter(linea => linea.trim())           // ignorar líneas vacías
      .map(linea => JSON.parse(linea))         // parsear cada línea como JSON
  },

  guardarPersonajes(personajes) {
    const contenido = personajes
      .map(p => JSON.stringify(p))
      .join('\n')
    fs.writeFileSync(RUTA, contenido + '\n', 'utf-8')
  },

  // Añade un personaje sin reescribir el fichero completo
  appendPersonaje(personaje) {
    fs.appendFileSync(RUTA, JSON.stringify(personaje) + '\n', 'utf-8')
  }
}

module.exports = StorageService
```

> **¿Por qué NDJSON?** Con un JSON array normal habría que leer todo el fichero, hacer `JSON.parse`, añadir el elemento y volver a escribir todo. Con NDJSON podemos hacer `appendFileSync` de una sola línea. Para leer, dividimos por `\n` y parseamos cada línea.

## Paso 7: `PersonajeService` — lógica de negocio

Crea `src/services/PersonajeService.js`:

```javascript
const AppError     = require('../utils/AppError')
const StorageService = require('./StorageService')
const { generarNombre, generarEspecie, generarCategoria, ESPECIES, CATEGORIAS } = require('../utils/nombresAleatorios')
const Guerrero     = require('../classes/Guerrero')
const Explorador   = require('../classes/Explorador')
const Mago         = require('../classes/Mago')

const CLASES = { guerrero: Guerrero, explorador: Explorador, mago: Mago }

class PersonajeService {
  constructor() {
    // Al arrancar, cargamos los personajes que ya existían en disco
    this._personajes = StorageService.leerPersonajes()
    this._nextId     = this._personajes.reduce((max, p) => Math.max(max, p.id), 0) + 1
  }

  _crearInstancia(ficha) {
    const Clase = CLASES[ficha.categoria] || Guerrero
    return new Clase(ficha)
  }

  _validarEspecieCategoria(especie, categoria) {
    if (!ESPECIES.includes(especie)) {
      throw new AppError(`Especie "${especie}" no válida. Opciones: ${ESPECIES.join(', ')}`, 400)
    }
    if (!CATEGORIAS.includes(categoria)) {
      throw new AppError(`Categoría "${categoria}" no válida. Opciones: ${CATEGORIAS.join(', ')}`, 400)
    }
  }

  obtenerTodos(filtros = {}) {
    let resultado = [...this._personajes]
    if (filtros.especie)   resultado = resultado.filter(p => p.especie   === filtros.especie)
    if (filtros.categoria) resultado = resultado.filter(p => p.categoria === filtros.categoria)
    return resultado
  }

  obtenerPorId(id) {
    const personaje = this._personajes.find(p => p.id === id)
    if (!personaje) throw new AppError('Personaje no encontrado', 404)
    return personaje
  }

  crearManual({ nombre, especie, categoria }) {
    this._validarEspecieCategoria(especie, categoria)
    const instancia = this._crearInstancia({ id: this._nextId++, nombre, especie, categoria })
    const ficha     = instancia.ficha
    this._personajes.push(ficha)
    StorageService.appendPersonaje(ficha)
    return ficha
  }

  crearAleatorio() {
    const especie   = generarEspecie()
    const categoria = generarCategoria()
    const nombre    = generarNombre(especie)
    return this.crearManual({ nombre, especie, categoria })
  }

  actualizarNombre(id, nuevoNombre) {
    const index = this._personajes.findIndex(p => p.id === id)
    if (index === -1) throw new AppError('Personaje no encontrado', 404)
    this._personajes[index].nombre = nuevoNombre
    StorageService.guardarPersonajes(this._personajes)
    return this._personajes[index]
  }

  eliminar(id) {
    const index = this._personajes.findIndex(p => p.id === id)
    if (index === -1) throw new AppError('Personaje no encontrado', 404)
    const [eliminado] = this._personajes.splice(index, 1)
    StorageService.guardarPersonajes(this._personajes)
    return eliminado
  }

  registrarResultado(idGanador, idPerdedor) {
    const g = this._personajes.find(p => p.id === idGanador)
    const p = this._personajes.find(p => p.id === idPerdedor)
    if (g) g.victorias++
    if (p) p.derrotas++
    StorageService.guardarPersonajes(this._personajes)
  }
}

// Singleton: todos los módulos comparten la misma instancia
module.exports = new PersonajeService()
```

## Paso 8: Middleware

Crea `src/middleware/logger.js`:

```javascript
const logger = (req, res, next) => {
  const inicio = Date.now()
  res.on('finish', () => {
    const ms    = Date.now() - inicio
    const color = res.statusCode >= 400 ? '\x1b[31m' : '\x1b[32m'
    const reset = '\x1b[0m'
    console.log(`${color}[${new Date().toISOString()}] ${req.method} ${req.originalUrl} → ${res.statusCode} (${ms}ms)${reset}`)
  })
  next()
}

module.exports = logger
```

Crea `src/middleware/validarCampos.js`:

```javascript
const validarCampos = (camposRequeridos) => (req, res, next) => {
  const faltantes = camposRequeridos.filter(campo => {
    const v = req.body[campo]
    return v === undefined || v === null || v === ''
  })
  if (faltantes.length > 0) {
    return res.status(400).json({ error: `Campos obligatorios faltantes: ${faltantes.join(', ')}` })
  }
  next()
}

module.exports = validarCampos
```

Crea `src/middleware/errorHandler.js`:

```javascript
const errorHandler = (err, req, res, next) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({ error: err.message })
  }
  console.error('ERROR NO ESPERADO:', err.stack)
  res.status(500).json({ error: 'Error interno del servidor' })
}

module.exports = errorHandler
```

## Paso 9: Controladores

Crea `src/controllers/personajeController.js`:

```javascript
const service = require('../services/PersonajeService')

const listar = (req, res, next) => {
  try { res.json(service.obtenerTodos(req.query)) }
  catch (err) { next(err) }
}

const obtenerUno = (req, res, next) => {
  try { res.json(service.obtenerPorId(Number(req.params.id))) }
  catch (err) { next(err) }
}

const crearManual = (req, res, next) => {
  try { res.status(201).json(service.crearManual(req.body)) }
  catch (err) { next(err) }
}

const crearAleatorio = (req, res, next) => {
  try { res.status(201).json(service.crearAleatorio()) }
  catch (err) { next(err) }
}

const actualizar = (req, res, next) => {
  try { res.json(service.actualizarNombre(Number(req.params.id), req.body.nombre)) }
  catch (err) { next(err) }
}

const eliminar = (req, res, next) => {
  try { res.json({ mensaje: 'Personaje eliminado', personaje: service.eliminar(Number(req.params.id)) }) }
  catch (err) { next(err) }
}

module.exports = { listar, obtenerUno, crearManual, crearAleatorio, actualizar, eliminar }
```

Crea `src/controllers/combateController.js`:

```javascript
const Combate  = require('../classes/Combate')
const service  = require('../services/PersonajeService')
const AppError = require('../utils/AppError')

const simular = (req, res, next) => {
  try {
    const { id1, id2 } = req.body
    if (id1 === id2) throw new AppError('Un personaje no puede combatir consigo mismo', 400)

    const p1 = service.obtenerPorId(Number(id1))
    const p2 = service.obtenerPorId(Number(id2))

    const resultado = Combate.simular(p1, p2)

    // Actualizar victorias/derrotas
    const idGanador  = resultado.ganador  === p1.nombre ? p1.id : p2.id
    const idPerdedor = resultado.perdedor === p1.nombre ? p1.id : p2.id
    service.registrarResultado(idGanador, idPerdedor)

    res.json(resultado)
  } catch (err) {
    next(err)
  }
}

module.exports = { simular }
```

## Paso 10: Rutas

Crea `src/routes/personajes.js`:

```javascript
const { Router }   = require('express')
const validar      = require('../middleware/validarCampos')
const ctrl         = require('../controllers/personajeController')

const router = Router()

router.get('/',              ctrl.listar)
router.get('/:id',           ctrl.obtenerUno)
router.post('/manual',       validar(['nombre', 'especie', 'categoria']), ctrl.crearManual)
router.post('/aleatorio',    ctrl.crearAleatorio)
router.put('/:id',           validar(['nombre']), ctrl.actualizar)
router.delete('/:id',        ctrl.eliminar)

module.exports = router
```

Crea `src/routes/combates.js`:

```javascript
const { Router } = require('express')
const validar    = require('../middleware/validarCampos')
const ctrl       = require('../controllers/combateController')

const router = Router()

router.post('/', validar(['id1', 'id2']), ctrl.simular)

module.exports = router
```

## Paso 11: Ensamblar `index.js`

```javascript
require('dotenv').config()
const express      = require('express')
const logger       = require('./src/middleware/logger')
const errorHandler = require('./src/middleware/errorHandler')

const app  = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(logger)

app.use('/api/personajes', require('./src/routes/personajes'))
app.use('/api/combates',   require('./src/routes/combates'))

// 404 para rutas no definidas
app.use((req, res) => {
  res.status(404).json({ error: `Ruta ${req.method} ${req.url} no encontrada` })
})

// Error handler SIEMPRE al final (4 parámetros)
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`⚔️  RPG Backend en http://localhost:${PORT}`)
})
```

## Paso 12: Pruebas con Postman

### 12.1 Crear personaje manual
```bash
POST /api/personajes/manual
Body: { "nombre": "Grindal", "especie": "enano", "categoria": "guerrero" }
```
→ 201 con stats calculados: `vida=150, ataque=30, defensa=25, iniciativa=0`

### 12.2 Crear personaje aleatorio
```bash
POST /api/personajes/aleatorio
Body: {}
```
→ 201 con nombre, especie y categoría generados al azar.

### 12.3 Persistencia — reiniciar el servidor
```bash
# Para el servidor (Ctrl+C) y vuélvelo a arrancar
node index.js
```
Haz `GET /api/personajes` → los personajes deben seguir ahí (leídos del fichero).

### 12.4 Combate
```bash
POST /api/combates
Body: { "id1": 1, "id2": 2 }
```
→ Respuesta con ganador, perdedor, número de rondas y log completo del combate.

### 12.5 Validación de campos
```bash
POST /api/personajes/manual
Body: { "nombre": "Solo el nombre" }
```
→ 400 `Campos obligatorios faltantes: especie, categoria`

### 12.6 Especie inválida
```bash
POST /api/personajes/manual
Body: { "nombre": "Test", "especie": "dragon", "categoria": "guerrero" }
```
→ 400 `Especie "dragon" no válida. Opciones: humano, enano, elfo`

### 12.7 Personaje inexistente
```bash
GET /api/personajes/9999
```
→ 404 `Personaje no encontrado`

### 12.8 Logger en consola
Cualquier petición debe mostrar en consola:
```bash
[2024-01-15T10:30:00.000Z] GET /api/personajes → 200 (4ms)
```
En verde los 2xx, en rojo los 4xx y 5xx.

## Pregunta de reflexión

Cuando reiniciáis el servidor, el `PersonajeService` lee el fichero en el `constructor`. ¿Qué pasaría si dos servidores corrieran a la vez (ej. en dos puertos) y ambos intentaran escribir en el mismo fichero? ¿Cómo lo resolveríais en una aplicación real?

## Criterios de evaluación

- [ ] La estructura de carpetas respeta exactamente el árbol indicado
- [ ] Los stats se calculan correctamente sumando los bonus de especie y categoría
- [ ] `POST /api/personajes/manual` sin campos obligatorios devuelve 400 antes de llegar al controlador
- [ ] `POST /api/personajes/manual` con especie inválida devuelve 400 con mensaje claro
- [ ] `POST /api/personajes/aleatorio` genera nombre, especie y categoría aleatorios
- [ ] `POST /api/combates` devuelve ganador, perdedor y log de rondas
- [ ] Al reiniciar el servidor, los personajes siguen existiendo (persistencia en `.txt`)
- [ ] El logger muestra cada petición con código de color y duración
- [ ] El `errorHandler` captura todos los errores y devuelve el statusCode correcto
- [ ] Las clases `Guerrero`, `Explorador` y `Mago` implementan `habilidadEspecial()`

## Bonus

Los bonus están ordenados de menor a mayor dificultad. Hacedlos en orden.

### ⭐ Estadísticas
Añade `GET /api/estadisticas` que devuelva:
- Distribución de personajes por especie y por categoría
- El personaje con más victorias (campeón)
- Total de combates simulados

### ⭐⭐ Validación de enum en middleware
Crea un nuevo middleware `validarEnum(campo, valoresValidos)` en `src/middleware/validarEnum.js`. Es similar a `validarCampos` pero comprueba que el valor de un campo esté dentro de un array de opciones válidas. Úsalo en la ruta de creación manual en lugar de hacer la validación en el servicio.

### ⭐⭐ Historial de combates
Guarda cada combate en `data/combates.txt` (NDJSON, igual que personajes). Implementa `GET /api/combates/historial` que lea ese fichero y devuelva la lista de combates con fecha, ganador y perdedor.

### ⭐⭐⭐ Clase abstracta BasePersonaje
Crea `src/classes/BasePersonaje.js` con métodos que lancen `Error('No implementado')` si no se sobreescriben. Haz que `Personaje` extienda de `BasePersonaje`. Documenta qué métodos son obligatorios para cualquier subclase.

### ⭐⭐⭐ Habilidades con cooldown
Modifica el motor de combate para que la habilidad especial solo esté disponible cada 3 rondas. El log debe indicar cuándo se usa una habilidad y cuándo está en cooldown. Cada subclase debe tener su efecto diferenciado en el cálculo de daño.

### ⭐⭐⭐⭐ Torneo por eliminación
Implementa `POST /api/torneos` que reciba un array de IDs (`{ participantes: [1, 2, 3, 4] }`), genere un bracket de eliminación directa (8 o 4 participantes, rellenando con personajes aleatorios si hacen falta) y devuelva el árbol completo con el campeón final.

### ⭐⭐⭐⭐ Tests con Jest

```bash
npm install --save-dev jest supertest
```

Crea una carpeta `tests/` con al menos 8 tests que cubran:
- `Personaje.calcularStats()` calcula correctamente los stats de cada combinación
- `Combate.simular()` devuelve ganador correcto en un caso predecible (stats fijos)
- `GET /api/personajes` devuelve array JSON
- `POST /api/personajes/manual` con body válido devuelve 201
- `POST /api/personajes/manual` sin campos devuelve 400
- `POST /api/combates` con IDs inexistentes devuelve 404
- `DELETE /api/personajes/:id` elimina correctamente

### ⭐⭐⭐⭐⭐ Front con React (bonus máximo)

Construye una SPA con React (Vite) en una carpeta `client/` separada:

**Pantallas mínimas:**
1. **Lista de personajes** — tabla con nombre, especie, categoría y stats. Botón para eliminar.
2. **Crear personaje** — formulario con selects para especie y categoría, campo de texto para nombre, y botón "Aleatorio" que autorrellena todos los campos.
3. **Arena de combate** — selecciona dos personajes de la lista, pulsa "Combatir" y muestra el log de rondas animado (una ronda por segundo con `setInterval`) y el ganador al final.

**Comandos de arranque:**
```bash
# En una terminal: backend
node index.js

# En otra terminal: frontend
cd client && npm run dev
```

El backend debe añadir `app.use(cors())` (`npm install cors`) para permitir las peticiones del front.