const Guerrero = require('../classes/Guerrero');
const Mago = require('../classes/Mago');
const Explorador = require('../classes/Explorador');

const CLASES = { guerrero: Guerrero, mago: Mago, explorador: Explorador };

describe('Validación de combinaciones de stats', () => {

  const combinaciones = [
    ['humano', 'guerrero',   130, 25], // 100+0+30 | 10+0+15
    ['humano', 'mago',       90,  35], // 100+0-10 | 10+0+25
    ['humano', 'explorador', 110, 20], // 100+0+10 | 10+0+10
    ['enano',  'guerrero',   150, 30], // 100+20+30 | 10+5+15
    ['enano',  'mago',       110, 40], // 100+20-10 | 10+5+25
    ['enano',  'explorador', 130, 25], // 100+20+10 | 10+5+10
    ['elfo',   'guerrero',   120, 35], // 100-10+30 | 10+10+15
    ['elfo',   'mago',       80,  45], // 100-10-10 | 10+10+25
    ['elfo',   'explorador', 100, 30], // 100-10+10 | 10+10+10
  ];

  test.each(combinaciones)(
    'Combinación: %s + %s debe dar %i de vida y %i de ataque',
    (especie, categoria, vidaEsperada, ataqueEsperado) => {
      const Clase = CLASES[categoria];
      const personaje = new Clase({ 
        id: 99, 
        nombre: 'TestBot', 
        especie, 
        categoria 
      });

      expect(personaje.stats.vida).toBe(vidaEsperada);
      expect(personaje.stats.ataque).toBe(ataqueEsperado);
    }
  );
});