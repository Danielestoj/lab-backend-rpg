const Combate        = require('../classes/Combate')
const service        = require('../services/PersonajeService')
const StorageService = require('../services/StorageService')
const AppError       = require('../utils/AppError')

const simular = (req, res, next) => {
  try {
    const { id1, id2 } = req.body
    if (id1 === id2) throw new AppError('Un personaje no puede combatir consigo mismo', 400)

    const p1 = service.obtenerPorId(Number(id1))
    const p2 = service.obtenerPorId(Number(id2))

    const resultado = Combate.simular(p1, p2)

    const idGanador  = resultado.ganador  === p1.nombre ? p1.id : p2.id
    const idPerdedor = resultado.perdedor === p1.nombre ? p1.id : p2.id
    service.registrarResultado(idGanador, idPerdedor)

    const registro = {
      fecha:    new Date().toISOString(),
      ganador:  resultado.ganador,
      perdedor: resultado.perdedor,
      rondas:   resultado.rondas,
      log:      resultado.log
    }
    StorageService.appendCombate(registro)

    res.json(resultado)
  } catch (err) {
    next(err)
  }
}

const historial = (req, res, next) => {
  try {
    const combates = StorageService.leerCombates()
    const resumen = combates.map((c, index) => ({
      id:       index,
      fecha:    c.fecha,
      ganador:  c.ganador,
      perdedor: c.perdedor,
      rondas:   c.rondas
    }))
    res.json({ total: resumen.length, combates: resumen })
  } catch (err) {
    next(err)
  }
}

const eliminarHistorial = (req, res, next) => {
  try {
    const index = Number(req.params.id)
    const combates = StorageService.leerCombates()

    if (!Number.isInteger(index) || index < 0 || index >= combates.length) {
      throw new AppError('Combate no encontrado en las crónicas', 404)
    }

    const [eliminado] = combates.splice(index, 1)
    StorageService.guardarCombates(combates)
    res.json({ mensaje: 'Combate eliminado de las crónicas', combate: eliminado })
  } catch (err) {
    next(err)
  }
}

const eliminarTodoHistorial = (req, res, next) => {
  try {
    StorageService.guardarCombates([])
    res.json({ mensaje: 'Historial de crónicas eliminado' })
  } catch (err) {
    next(err)
  }
}

module.exports = { simular, historial, eliminarHistorial, eliminarTodoHistorial }
