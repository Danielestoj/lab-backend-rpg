const request = require('supertest')
const express = require('express')

const app = express()
app.use(express.json())
app.use('/api/personajes', require('../routes/personajes'))
app.use('/api/torneos',    require('../routes/torneos'))

const errorHandler = require('../middleware/errorHandler')
app.use(errorHandler)

describe('POST /api/torneos', () => {

  test('devuelve 400 si participantes no es un array', async () => {
    const res = await request(app)
      .post('/api/torneos')
      .send({ participantes: 'no-es-array' })

    expect(res.statusCode).toBe(400)
    expect(res.body).toHaveProperty('error')
  })

  test('devuelve 400 si se envían más de 8 participantes', async () => {
    const res = await request(app)
      .post('/api/torneos')
      .send({ participantes: [1, 2, 3, 4, 5, 6, 7, 8, 9] })

    expect(res.statusCode).toBe(400)
    expect(res.body).toHaveProperty('error')
  })

  test('devuelve 400 si el array está vacío', async () => {
    const res = await request(app)
      .post('/api/torneos')
      .send({ participantes: [] })

    expect(res.statusCode).toBe(400)
    expect(res.body).toHaveProperty('error')
  })

  test('genera un torneo con 4 participantes existentes y devuelve campeón', async () => {
    // Primero creamos 4 personajes para tener IDs reales
    const ids = []
    for (let i = 0; i < 4; i++) {
      const res = await request(app)
        .post('/api/personajes/aleatorio')
        .send({})
      expect(res.statusCode).toBe(201)
      ids.push(res.body.id)
    }

    const res = await request(app)
      .post('/api/torneos')
      .send({ participantes: ids })

    expect(res.statusCode).toBe(201)
    expect(res.body).toHaveProperty('campeon')
    expect(res.body).toHaveProperty('rondas')
    expect(res.body).toHaveProperty('tamanioBracket')
    expect(res.body.campeon).toHaveProperty('nombre')
    expect(Array.isArray(res.body.rondas)).toBe(true)
  })

  test('rellena con aleatorios si hay menos de 4 participantes', async () => {
    // Creamos solo 2 personajes
    const ids = []
    for (let i = 0; i < 2; i++) {
      const res = await request(app)
        .post('/api/personajes/aleatorio')
        .send({})
      ids.push(res.body.id)
    }

    const res = await request(app)
      .post('/api/torneos')
      .send({ participantes: ids })

    expect(res.statusCode).toBe(201)
    expect(res.body.totalParticipantes).toBeGreaterThanOrEqual(4)
    expect(res.body).toHaveProperty('campeon')
  })

})