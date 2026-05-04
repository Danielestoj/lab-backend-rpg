const request = require('supertest')
const app = require('../../app')

describe('PUT /api/personajes/:id', () => {

  test('actualiza el nombre correctamente y devuelve 200', async () => {
    // Creamos un personaje aleatorio para tener un ID real
    const crear = await request(app)
      .post('/api/personajes/aleatorio')
      .send({})

    expect(crear.statusCode).toBe(201)
    const id = crear.body.id

    const res = await request(app)
      .put(`/api/personajes/${id}`)
      .send({ nombre: 'NombreActualizado' })

    expect(res.statusCode).toBe(200)
    expect(res.body.nombre).toBe('NombreActualizado')
    expect(res.body.id).toBe(id)
  })

  test('devuelve 404 si el personaje no existe', async () => {
    const res = await request(app)
      .put('/api/personajes/99999')
      .send({ nombre: 'NuevoNombre' })

    expect(res.statusCode).toBe(404)
    expect(res.body).toHaveProperty('error')
  })

})