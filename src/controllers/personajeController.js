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
const estadisticas = (req, res, next) => {
  try {
    const stats = service.obtenerEstadisticas();
    res.json(stats);
  } catch (err) {
    next(err);
  }
};
module.exports = {
  listar,
  obtenerUno,
  crearManual,
  crearAleatorio,
  actualizar,
  eliminar,
  estadisticas,
};