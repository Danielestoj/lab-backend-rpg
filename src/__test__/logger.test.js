// TEST PARA COMPROBAR QUE EL LOGGER SE EJECUTA EN CADA REQUEST

const request = require('supertest')
const app = require('../../app')

describe('Logger middleware', () => {

  test('se ejecuta en cada request', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {})

    await request(app).get('/api/personajes')

    expect(spy).toHaveBeenCalled()

    spy.mockRestore()
  })
})
