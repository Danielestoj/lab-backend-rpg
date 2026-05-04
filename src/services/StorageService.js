const fs   = require('fs')
const path = require('path')

const RUTA_PERSONAJES = path.join(__dirname, '../../data/personajes.txt')
const RUTA_COMBATES   = path.join(__dirname, '../../data/combates.txt')

const StorageService = {
  leerPersonajes() {
    if (!fs.existsSync(RUTA_PERSONAJES)) return []
    const contenido = fs.readFileSync(RUTA_PERSONAJES, 'utf-8').trim()
    if (!contenido) return []
    return contenido
      .split('\n')
      .filter(linea => linea.trim())
      .map(linea => JSON.parse(linea))
  },

  guardarPersonajes(personajes) {
    const contenido = personajes.map(p => JSON.stringify(p)).join('\n')
    fs.writeFileSync(RUTA_PERSONAJES, contenido + '\n', 'utf-8')
  },

  appendPersonaje(personaje) {
    fs.appendFileSync(RUTA_PERSONAJES, JSON.stringify(personaje) + '\n', 'utf-8')
  },

  leerCombates() {
    if (!fs.existsSync(RUTA_COMBATES)) return []
    const contenido = fs.readFileSync(RUTA_COMBATES, 'utf-8').trim()
    if (!contenido) return []
    return contenido
      .split('\n')
      .filter(linea => linea.trim())
      .map(linea => JSON.parse(linea))
  },

  appendCombate(combate) {
    if (!fs.existsSync(RUTA_COMBATES)) {
      fs.writeFileSync(RUTA_COMBATES, '', 'utf-8')
    }
    fs.appendFileSync(RUTA_COMBATES, JSON.stringify(combate) + '\n', 'utf-8')
  },

  guardarCombates(combates) {
    const contenido = combates.map(c => JSON.stringify(c)).join('\n')
    fs.writeFileSync(RUTA_COMBATES, contenido ? contenido + '\n' : '', 'utf-8')
  }

}




module.exports = StorageService
