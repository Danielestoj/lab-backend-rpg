const validarCampos = (camposRequeridos) => (req, res, next) => {
  const faltantes = camposRequeridos.filter(campo => {
    const v = req.body[campo]
    return v === undefined || v === null || v === ''
  })
  if (faltantes.length > 0) {
    return res.status(400).json({ error: `Campos obligatorios faltantes: ${faltantes.join(', ')}` })
  }
  next()
}

module.exports = validarCampos