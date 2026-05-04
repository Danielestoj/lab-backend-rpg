const request = require('supertest')
const app = require('../../app')

test('debe devolver 400 si faltan campos', async () => {

  const res = await request(app)
    .post('/api/personajes/manual')
    .send({
      nombre: "SoloNombre"
    })

  expect(res.statusCode).toBe(400)
  expect(res.body).toHaveProperty('error')
})