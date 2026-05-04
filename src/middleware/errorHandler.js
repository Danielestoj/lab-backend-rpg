const errorHandler = (err, req, res, next) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({ error: err.message })
  }
  console.error('ERROR NO ESPERADO:', err.stack)
  res.status(500).json({ error: 'Error interno del servidor' })
}

module.exports = errorHandler