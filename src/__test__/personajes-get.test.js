const request = require("supertest");
const app = require("../../app");

describe("GET /api/personajes", () => {
  test("devuelve array JSON", async () => {
    const res = await request(app).get("/api/personajes");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
