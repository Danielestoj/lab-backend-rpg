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

    // Cooldowns
    let cdA = 0
    let cdB = 0

    // Efectos especiales
    let quemaduraA = 0
    let quemaduraB = 0
    let esquivaA = false
    let esquivaB = false

    // Determinar orden: mayor iniciativa ataca primero
    const [primero, segundo] =
      fichaA.stats.iniciativa >= fichaB.stats.iniciativa
        ? [fichaA, fichaB]
        : [fichaB, fichaA]

    let vidaPrimero  = primero  === fichaA ? vidaA : vidaB
    let vidaSegundo  = primero  === fichaA ? vidaB : vidaA
    let cdPrimero = primero === fichaA ? cdA : cdB
    let cdSegundo = primero === fichaA ? cdB : cdA
    let quemaduraPrimero = primero === fichaA ? quemaduraA : quemaduraB
    let quemaduraSegundo = primero === fichaA ? quemaduraB : quemaduraA
    let esquivaPrimero = false
    let esquivaSegundo = false

    log.push(`⚔️  ${primero.nombre} (iniciativa ${primero.stats.iniciativa}) ataca primero`)

    while (vidaPrimero > 0 && vidaSegundo > 0) {
      ronda++

      // Turno del primero
      let resultadoPrimero
      let esTurnoEspecialPrimero = false

      const puedeUsarEspecialPrimero = cdPrimero === 0 && primero.habilidadEspecial
      const randomPrimero = Math.floor(Math.random() * 10)

      if (puedeUsarEspecialPrimero && randomPrimero >= 5) {
        resultadoPrimero = primero.habilidadEspecial()
        cdPrimero = 3
        esTurnoEspecialPrimero = true
        log.push(`✨ ${primero.nombre} activa su habilidad especial (random=${randomPrimero}) → ${resultadoPrimero.descripcion}`)

        // Explorador
        if (primero.categoria === "explorador") {
          esquivaPrimero = true
        }

        // Mago
        if (primero.categoria === "mago") {
          const defensaReducida = Math.floor(segundo.stats.defensa / 2)
          resultadoPrimero.danio = Math.max(1, primero.stats.ataque - defensaReducida)
          quemaduraSegundo = 2
          log.push(`🔥 ${primero.nombre} ignora la mitad de la defensa de ${segundo.nombre}`)
        }

        // Guerrero
        if (primero.categoria === "guerrero") {
          resultadoPrimero.danio = primero.stats.ataque * 2
          const autoDanio = 10
          vidaPrimero -= autoDanio
          log.push(`💥 ${primero.nombre} usa Golpe Fuerte y se hace ${autoDanio} de daño a sí mismo`)
        }

      } else {
        if (puedeUsarEspecialPrimero) {
          log.push(`🎲 ${primero.nombre} falla el intento de habilidad especial (random=${randomPrimero})`)
        } else if (cdPrimero > 0) {
          log.push(`⏳ ${primero.nombre} no puede usar su habilidad especial. Faltan ${cdPrimero} ronda(s).`)
        }

        resultadoPrimero = { danio: Math.max(1, primero.stats.ataque - segundo.stats.defensa) }
      }

      // Aplicar daño del primero
      if (!resultadoPrimero.esquiva) {
        let danio = resultadoPrimero.danio

        // Quemadura (solo si NO es turno especial)
        if (quemaduraSegundo > 0 && !esTurnoEspecialPrimero) {
          danio += 5
          quemaduraSegundo--
          log.push(`🔥 ${segundo.nombre} sufre +5 de daño por quemaduras`)
        }

        vidaSegundo -= danio

        log.push(
          `Ronda ${ronda}a: ${primero.nombre} → ${segundo.nombre} [-${danio} vida] (${Math.max(0, vidaSegundo)} restante)`
        )
      }

      if (vidaSegundo <= 0) break

      if (cdPrimero > 0) cdPrimero--

      // Turno del segundo
      let resultadoSegundo
      let esTurnoEspecialSegundo = false

      const puedeUsarEspecialSegundo = cdSegundo === 0 && segundo.habilidadEspecial
      const randomSegundo = Math.floor(Math.random() * 10)

      if (puedeUsarEspecialSegundo && randomSegundo >= 5) {
        resultadoSegundo = segundo.habilidadEspecial()
        cdSegundo = 3
        esTurnoEspecialSegundo = true
        log.push(`✨ ${segundo.nombre} activa su habilidad especial (random=${randomSegundo}) → ${resultadoSegundo.descripcion}`)

        if (segundo.categoria === "explorador") {
          esquivaSegundo = true
        }

        if (segundo.categoria === "mago") {
          const defensaReducida = Math.floor(primero.stats.defensa / 2)
          resultadoSegundo.danio = Math.max(1, segundo.stats.ataque - defensaReducida)
          quemaduraPrimero = 2
          log.push(`🔥 ${segundo.nombre} ignora la mitad de la defensa de ${primero.nombre}`)
        }

        if (segundo.categoria === "guerrero") {
          resultadoSegundo.danio = segundo.stats.ataque * 2
          const autoDanio = 10
          vidaSegundo -= autoDanio
          log.push(`💥 ${segundo.nombre} usa Golpe Fuerte y se hace ${autoDanio} de daño a sí mismo`)
        }

      } else {
        if (puedeUsarEspecialSegundo) {
          log.push(`🎲 ${segundo.nombre} falla el intento de habilidad especial (random=${randomSegundo})`)
        } else if (cdSegundo > 0) {
          log.push(`⏳ ${segundo.nombre} no puede usar su habilidad especial. Faltan ${cdSegundo} ronda(s).`)
        }

        resultadoSegundo = { danio: Math.max(1, segundo.stats.ataque - primero.stats.defensa) }
      }

      // Aplicar daño del segundo
      if (!esquivaPrimero) {
        let danio = resultadoSegundo.danio

        if (quemaduraPrimero > 0 && !esTurnoEspecialSegundo) {
          danio += 5
          quemaduraPrimero--
          log.push(`🔥 ${primero.nombre} sufre +5 de daño por quemaduras`)
        }

        vidaPrimero -= danio

        log.push(
          `Ronda ${ronda}b: ${segundo.nombre} → ${primero.nombre} [-${danio} vida] (${Math.max(0, vidaPrimero)} restante)`
        )
      } else {
        log.push(`🛡️ ${primero.nombre} esquiva todo el daño este turno`)
        esquivaPrimero = false
      }

      if (vidaPrimero <= 0) break

      if (cdSegundo > 0) cdSegundo--
    }

    const ganador  = vidaPrimero > 0 ? primero : segundo
    const perdedor = ganador === primero ? segundo : primero

    log.push(`🏆 Ganador: ${ganador.nombre} en ${ronda} ronda(s)`)

    return { ganador: ganador.nombre, perdedor: perdedor.nombre, rondas: ronda, log }
  }
}

module.exports = Combate
