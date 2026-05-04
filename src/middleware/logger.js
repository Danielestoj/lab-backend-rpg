const logger = (req, res, next) => {
  const inicio = Date.now()
  res.on('finish', () => {
    const ms    = Date.now() - inicio
    const color = res.statusCode >= 400 ? '\x1b[31m' : '\x1b[32m'
    const reset = '\x1b[0m'
    console.log(`${color}[${new Date().toISOString()}] ${req.method} ${req.originalUrl} → ${res.statusCode} (${ms}ms)${reset}`)
  })
  next()
}

module.exports = logger