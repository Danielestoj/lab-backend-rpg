const AppError = require('../utils/AppError');
const StorageService = require('./StorageService');
const { 
  generarNombre, 
  generarEspecie, 
  generarCategoria, 
  ESPECIES, 
  CATEGORIAS 
} = require('../utils/nombresAleatorios');

const Guerrero = require('../classes/Guerrero');
const Explorador = require('../classes/Explorador');
const Mago = require('../classes/Mago');

const CLASES = { guerrero: Guerrero, explorador: Explorador, mago: Mago };

class PersonajeService {
  constructor() {

    this._personajes = StorageService.leerPersonajes();

    this._nextId = this._personajes.reduce((max, p) => Math.max(max, p.id), 0) + 1;
  }

  _crearInstancia(ficha) {
    const Clase = CLASES[ficha.categoria] || Guerrero;
    return new Clase(ficha);
  }

  _validarEspecieCategoria(especie, categoria) {
    if (!ESPECIES.includes(especie)) {
      throw new AppError(`Especie "${especie}" no válida. Opciones: ${ESPECIES.join(', ')}`, 400);
    }
    if (!CATEGORIAS.includes(categoria)) {
      throw new AppError(`Categoría "${categoria}" no válida. Opciones: ${CATEGORIAS.join(', ')}`, 400);
    }
  }

  obtenerTodos(filtros = {}) {
    let resultado = [...this._personajes];
    if (filtros.especie) resultado = resultado.filter(p => p.especie === filtros.especie);
    if (filtros.categoria) resultado = resultado.filter(p => p.categoria === filtros.categoria);
    return resultado;
  }

  obtenerPorId(id) {
    const ficha = this._personajes.find(p => p.id === id)
    if (!ficha) throw new AppError('Personaje no encontrado', 404)

    // Reconstruye la instancia real con métodos para el combate
    return this._crearInstancia(ficha)
  }

  crearManual({ nombre, especie, categoria, stats, habilidadEspecial }) {
    this._validarEspecieCategoria(especie, categoria);
    const statsNormalizados = stats
      ? {
          vida: Number(stats.vida),
          ataque: Number(stats.ataque),
          defensa: Number(stats.defensa),
          iniciativa: Number(stats.iniciativa),
        }
      : undefined;

    const instancia = this._crearInstancia({
      id: this._nextId++,
      nombre,
      especie,
      categoria,
      stats: statsNormalizados,
      habilidadEspecial,
    });
    const ficha = instancia.ficha;
    this._personajes.push(ficha);
    StorageService.appendPersonaje(ficha);
    return ficha;
  }

  crearAleatorio() {
    const especie = generarEspecie();
    const categoria = generarCategoria();
    const nombre = generarNombre(especie);
    return this.crearManual({ nombre, especie, categoria });
  }

  actualizarNombre(id, nuevoNombre) {
    const index = this._personajes.findIndex(p => p.id === id);
    if (index === -1) throw new AppError('Personaje no encontrado', 404);
    this._personajes[index].nombre = nuevoNombre;
    StorageService.guardarPersonajes(this._personajes);
    return this._personajes[index];
  }

  eliminar(id) {
    const index = this._personajes.findIndex(p => p.id === id);
    if (index === -1) throw new AppError('Personaje no encontrado', 404);
    const [eliminado] = this._personajes.splice(index, 1);
    StorageService.guardarPersonajes(this._personajes);
    return eliminado;
  }

  registrarResultado(idGanador, idPerdedor) {
    const g = this._personajes.find(p => p.id === idGanador);
    const p = this._personajes.find(p => p.id === idPerdedor);
    if (g) g.victorias++;
    if (p) p.derrotas++;
    StorageService.guardarPersonajes(this._personajes);
  }

  obtenerEstadisticas() {

    const combates = StorageService.leerCombates();
    const personajes = this._personajes;


    const distribucion = personajes.reduce(
      (acc, p) => {
        acc.especies[p.especie] = (acc.especies[p.especie] || 0) + 1;
        acc.categorias[p.categoria] = (acc.categorias[p.categoria] || 0) + 1;
        return acc;
      },
      { especies: {}, categorias: {} }
    );

 
    const campeon = [...personajes].sort((a, b) => b.victorias - a.victorias)[0] || null;

    return {
      totalCombates: combates.length,
      distribucion,
      campeon: campeon ? { nombre: campeon.nombre, victorias: campeon.victorias } : null,
    };
  }
}

// Exportamos la instancia única (Patrón Singleton)[cite: 1]
module.exports = new PersonajeService();
