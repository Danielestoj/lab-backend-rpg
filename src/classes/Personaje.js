const BONUS_ESPECIE = {
  humano: { vida: 0, ataque: 0, defensa: 0, iniciativa: 5 },
  enano: { vida: 20, ataque: 5, defensa: 10, iniciativa: -5 },
  elfo: { vida: -10, ataque: 10, defensa: -5, iniciativa: 10 },
};

const BONUS_CATEGORIA = {
  guerrero: { vida: 30, ataque: 15, defensa: 10, iniciativa: 0 },
  explorador: { vida: 10, ataque: 10, defensa: 5, iniciativa: 15 },
  mago: { vida: -10, ataque: 25, defensa: -5, iniciativa: 5 },
};

class Personaje {
  constructor({ id, nombre, especie, categoria, stats, habilidadEspecial }) {
    this.id = id;
    this.nombre = nombre;
    this.especie = especie;
    this.categoria = categoria;
    this.stats = stats || this._calcularStats();
    this.habilidadEspecialTexto = habilidadEspecial || '';
    this.victorias = 0;
    this.derrotas = 0;
  }

  _calcularStats() {
    const base = { vida: 100, ataque: 10, defensa: 5, iniciativa: 5 };
    const be = BONUS_ESPECIE[this.especie] || {};
    const bc = BONUS_CATEGORIA[this.categoria] || {};

    return {
      vida: base.vida + (be.vida || 0) + (bc.vida || 0),
      ataque: base.ataque + (be.ataque || 0) + (bc.ataque || 0),
      defensa: base.defensa + (be.defensa || 0) + (bc.defensa || 0),
      iniciativa: base.iniciativa + (be.iniciativa || 0) + (bc.iniciativa || 0),
    };
  }
  /** README: Documenta qué métodos son obligatorios para cualquier subclase.
   * Clase abstracta BasePersonaje.js
   * Métodos obligatorios para cualquier subclase:
   * habilidadEspecial() => debe ser implementado por cualquier personaje. Si no, error 'Pesronaje debe implementar la habilidad especial'
   */
  habilidadEspecial() {
    throw new Error(
      `${this.constructor.name} debe implementar su habilidad especial`,
    );
  }

  get ficha() {
    return {
      id: this.id,
      nombre: this.nombre,
      especie: this.especie,
      categoria: this.categoria,
      stats: this.stats,
      habilidadEspecial: this.habilidadEspecialTexto,
      victorias: this.victorias,
      derrotas: this.derrotas,
    };
  }
}

module.exports = { Personaje, BONUS_ESPECIE, BONUS_CATEGORIA };
