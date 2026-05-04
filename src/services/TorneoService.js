// const AppError       = require('../utils/AppError')
// const PersonajeService = require('./PersonajeService')
// const Combate        = require('../classes/Combate')

const AppError         = require('../utils/AppError')
const PersonajeService = require('./PersonajeService')
const Combate          = require('../classes/Combate')
const StorageService   = require('./StorageService')
// Tamaños de bracket válidos
const TAMANIOS_VALIDOS = [4, 8]

class TorneoService {

  /**
   * Genera un bracket de eliminación directa.
   * @param {number[]} idsParticipantes - Array de IDs de personajes
   * @returns {object} Árbol completo del torneo con el campeón
   */
  generarTorneo(idsParticipantes) {
    if (!Array.isArray(idsParticipantes) || idsParticipantes.length < 2) {
      throw new AppError('Se necesitan al menos 2 participantes', 400)
    }

    if (idsParticipantes.length > 8) {
      throw new AppError('El torneo admite un máximo de 8 participantes', 400)
    }

    // Obtener personajes existentes y verificar que existen
    const participantes = idsParticipantes.map(id => {
      return PersonajeService.obtenerPorId(Number(id))
    })

    // Determinar tamaño del bracket (4 u 8)
    const tamanioBracket = this._calcularTamanioBracket(participantes.length)

    // Rellenar con personajes aleatorios si hacen falta
    const plantilla = this._rellenarConAleatorios(participantes, tamanioBracket)

    // Mezclar aleatoriamente los participantes
    const mezclados = this._mezclar(plantilla)

    // Simular el torneo por rondas y construir el árbol
    const { rondas, campeon } = this._simularRondas(mezclados)

    return {
      tamanioBracket,
      totalParticipantes: mezclados.length,
      participantes: mezclados.map(p => ({ id: p.id, nombre: p.nombre, especie: p.especie, categoria: p.categoria })),
      rondas,
      campeon: {
        id:        campeon.id,
        nombre:    campeon.nombre,
        especie:   campeon.especie,
        categoria: campeon.categoria
      }
    }
  }

  // ─── Helpers privados ────────────────────────────────────────────────────────

  _calcularTamanioBracket(n) {
    for (const t of TAMANIOS_VALIDOS) {
      if (n <= t) return t
    }
    return 8
  }

  _rellenarConAleatorios(participantes, tamanioBracket) {
    const resultado = [...participantes]
    const faltan    = tamanioBracket - resultado.length

    for (let i = 0; i < faltan; i++) {
      const aleatorio = PersonajeService.crearAleatorio()
      resultado.push(aleatorio)
    }

    return resultado
  }

  _mezclar(arr) {
    const copia = [...arr]
    for (let i = copia.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[copia[i], copia[j]] = [copia[j], copia[i]]
    }
    return copia
  }

  /**
   * Simula el torneo ronda a ronda.
   * Devuelve { rondas, campeon }.
   * 
   * Cada ronda es un array de enfrentamientos:
   * {
   *   p1: { id, nombre, ... },
   *   p2: { id, nombre, ... },
   *   resultado: { ganador, perdedor, rondas, log },
   *   avanza: { id, nombre, ... }
   * }
   */
  _simularRondas(participantes) {
    const rondas     = []
    let turno        = [...participantes]
    let numeroRonda  = 1

    while (turno.length > 1) {
      const enfrentamientos = []

      for (let i = 0; i < turno.length; i += 2) {
        const p1 = turno[i]
        const p2 = turno[i + 1]

        const resultado = Combate.simular(p1, p2)

        // Actualizar victorias/derrotas en el servicio
        const ganador  = resultado.ganador  === p1.nombre ? p1 : p2
        const perdedor = resultado.perdedor === p1.nombre ? p1 : p2
        // PersonajeService.registrarResultado(ganador.id, perdedor.id)

        PersonajeService.registrarResultado(ganador.id, perdedor.id)

StorageService.appendCombate({
  fecha:    new Date().toISOString(),
  ganador:  ganador.nombre,
  perdedor: perdedor.nombre,
  rondas:   resultado.rondas,
  log:      resultado.log
})

        enfrentamientos.push({
          enfrentamiento: i / 2 + 1,
          p1: { id: p1.id, nombre: p1.nombre, especie: p1.especie, categoria: p1.categoria },
          p2: { id: p2.id, nombre: p2.nombre, especie: p2.especie, categoria: p2.categoria },
          resultado,
          avanza: { id: ganador.id, nombre: ganador.nombre, especie: ganador.especie, categoria: ganador.categoria }
        })

        turno[i / 2] = ganador   // el ganador avanza
      }

      rondas.push({
        ronda:   numeroRonda,
        nombre:  this._nombreRonda(turno.length, participantes.length),
        enfrentamientos
      })

      turno = turno.slice(0, turno.length / 2)
      numeroRonda++
    }

    return { rondas, campeon: turno[0] }
  }

  _nombreRonda(ganadores, total) {
    if (ganadores === 1) return 'Final'
    if (ganadores === 2) return 'Semifinal'
    if (ganadores === 4) return 'Cuartos de final'
    return `Ronda de ${total}`
  }
}

module.exports = new TorneoService()