const request = require('supertest')
const app = require('../../app')

describe('POST /api/personajes/manual', () => {

  test('debe crear un personaje y devolver 201', async () => {
    const nuevoPersonaje = {
      nombre: "TestHero", 
      especie: "humano",
      categoria: "guerrero"
    }

    const res = await request(app)
      .post('/api/personajes/manual')
      .send(nuevoPersonaje)

    expect(res.statusCode).toBe(201)
    expect(res.body).toHaveProperty('id')
    expect(res.body.nombre).toBe("TestHero")
    expect(res.body.especie).toBe("humano")
    expect(res.body.categoria).toBe("guerrero")
  })

})