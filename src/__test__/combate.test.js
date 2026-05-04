const request = require('supertest')
const express = require('express')

// Montamos una app mínima igual que index.js pero sin arrancar puerto
const app = express()
app.use(express.json())
app.use('/api/personajes', require('../routes/personajes'))
app.use('/api/combates',   require('../routes/combates'))

const errorHandler = require('../middleware/errorHandler')
app.use(errorHandler)

describe('POST /api/combates — IDs inexistentes', () => {

  test('devuelve 404 si el primer personaje no existe', async () => {
    const res = await request(app)
      .post('/api/combates')
      .send({ id1: 99999, id2: 99998 })

    expect(res.statusCode).toBe(404)
    expect(res.body).toHaveProperty('error')
  })

  test('devuelve 400 si se envía el mismo ID dos veces', async () => {
    const res = await request(app)
      .post('/api/combates')
      .send({ id1: 1, id2: 1 })

    expect(res.statusCode).toBe(400)
    expect(res.body).toHaveProperty('error')
  })

  test('devuelve 400 si faltan campos obligatorios', async () => {
    const res = await request(app)
      .post('/api/combates')
      .send({ id1: 1 }) // falta id2

    expect(res.statusCode).toBe(400)
    expect(res.body).toHaveProperty('error')
  })

})
