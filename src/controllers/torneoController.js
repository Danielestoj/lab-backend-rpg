const service = require('../services/TorneoService')

const crearTorneo = (req, res, next) => {
  try {
    const { participantes } = req.body

    if (!Array.isArray(participantes)) {
      return res.status(400).json({ error: 'El campo "participantes" debe ser un array de IDs' })
    }

    const resultado = service.generarTorneo(participantes)
    res.status(201).json(resultado)
  } catch (err) {
    next(err)
  }
}

module.exports = { crearTorneo }