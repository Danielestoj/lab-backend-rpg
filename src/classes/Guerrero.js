const { Personaje } = require('./Personaje')

class Guerrero extends Personaje {
  // Golpe fuerte: daño doble, pero pierde 10 de vida propia
  habilidadEspecial(vidaActualOponente) {
    const danio = this.stats.ataque * 2
    return { danio, costePropio: 10, descripcion: `${this.nombre} usa GOLPE FUERTE (${danio} daño)` }
  }
}

module.exports = Guerrero