const request = require("supertest");
const app = require("../../app");

describe("DELETE /api/personajes/:id", () => {
  test("elimina correctamente", async () => {
    const personaje = {
      nombre: "Personaje Test",
      especie: "humano",
      categoria: "guerrero",
    };

    const crearRes = await request(app)
      .post("/api/personajes/manual")
      .send(personaje);

    expect(crearRes.statusCode).toBe(201);

    const id = crearRes.body.id;

    const borrarRes = await request(app).delete(`/api/personajes/${id}`);

    expect(borrarRes.statusCode).toBe(200);
    expect(borrarRes.body.mensaje).toBe("Personaje eliminado");
    expect(borrarRes.body.personaje.id).toBe(id);

    const comprobarRes = await request(app).get(`/api/personajes/${id}`);

    expect(comprobarRes.statusCode).toBe(404);
  });
});
