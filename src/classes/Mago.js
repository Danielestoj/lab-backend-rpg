const { Personaje } = require('./Personaje')

class Mago extends Personaje {
  // Hechizo: ignora la defensa del rival
  habilidadEspecial() {
    return { danio: this.stats.ataque, ignoraDefensa: true, descripcion: `${this.nombre} lanza BOLA DE FUEGO` }
  }
}

module.exports = Mago