//TEST PARA COMPROBAR QUE EL ERROR HANDLER DEVUELVE UN JSON CONSISTENTE PARA ERRORES OPERACIONALES

const request = require('supertest')
const express = require('express')
const errorHandler = require('../middleware/errorHandler')
const AppError = require('../utils/AppError')


describe('ErrorHandler', () => {

  test('devuelve JSON consistente para errores operacionales', async () => {

    const app = express()
    app.get('/error', () => {
      throw new AppError('Fallo controlado', 400)
    })
    app.use(errorHandler)

    const res = await request(app).get('/error')

    expect(res.statusCode).toBe(400)
    expect(res.body).toEqual({ error: 'Fallo controlado' })
  })
})
