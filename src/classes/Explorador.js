const { Personaje } = require('./Personaje')

class Explorador extends Personaje {
  // Esquivar: ignora el siguiente ataque (devuelve 0 de daño recibido este turno)
  habilidadEspecial() {
    return { danio: this.stats.ataque, esquiva: true, descripcion: `${this.nombre} usa ESQUIVAR` }
  }
}

module.exports = Explorador