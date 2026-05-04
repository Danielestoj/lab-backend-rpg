const { Personaje } = require("../classes/Personaje");
const Guerrero = require("../classes/Guerrero");
const Explorador = require("../classes/Explorador");
const Mago = require("../classes/Mago");

describe("Funcionamiento de la habilidad especial", () => {
  test("Personaje no tiene una habilidad especial", () => {
    const personaje = new Personaje({
      id: 1,
      nombre: "Prueba",
      especie: "humano",
      categoria: "guerrero",
    });

    expect(() => personaje.habilidadEspecial()).toThrow(
      "Personaje debe implementar su habilidad especial",
    );
  });

  test("Cada personaje tiene su habilidad especial", () => {
    const guerrero = new Guerrero({
      id: 2,
      nombre: "Grimr",
      especie: "enano",
      categoria: "guerrero",
    });

    const explorador = new Explorador({
      id: 3,
      nombre: "Lyshara",
      especie: "elfo",
      categoria: "explorador",
    });

    const mago = new Mago({
      id: 4,
      nombre: "Sorin",
      especie: "elfo",
      categoria: "mago",
    });

    expect(guerrero.habilidadEspecial()).toHaveProperty("danio");
    expect(explorador.habilidadEspecial()).toHaveProperty("esquiva", true);
    expect(mago.habilidadEspecial()).toHaveProperty("ignoraDefensa", true);
  });
});
