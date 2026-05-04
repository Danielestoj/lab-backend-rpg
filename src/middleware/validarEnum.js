const validarEnum = (campo, valoresValidos) => (req, res, next) => {
  const valor = req.body[campo]

  if (valor === undefined || valor === null || valor === '') {
    return res.status(400).json({ error: `El campo '${campo}' es obligatorio.` })
  }

  if (!valoresValidos.includes(valor)) {
    return res.status(400).json({ error: `Valor inválido para '${campo}'. Valores válidos: ${valoresValidos.join(', ')}` })
  }

  next()
}

module.exports = validarEnum
