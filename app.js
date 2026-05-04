require('dotenv').config()
const express      = require('express')
const cors         = require('cors')
const logger       = require('./src/middleware/logger')
const errorHandler = require('./src/middleware/errorHandler')

const app = express()

app.use(cors())
app.use(express.json())
app.use(logger)

app.use('/api/personajes', require('./src/routes/personajes'))
app.use('/api/combates',   require('./src/routes/combates'))
app.use('/api/torneos',    require('./src/routes/torneos'))
app.get("/api/estadisticas", require("./src/controllers/personajeController").estadisticas);

app.use((req, res) => {
  res.status(404).json({ error: `Ruta ${req.method} ${req.url} no encontrada` })
})

app.use(errorHandler)

module.exports = app
