const Guerrero = require('../classes/Guerrero');
const Mago = require('../classes/Mago');
const Combate = require('../classes/Combate');

describe('Pruebas de Combate.simular()', () => {

    test('Debe ganar el Guerrero si tiene stats muy superiores al Mago', () => {
        const fuerte = new Guerrero({ id: 1, nombre: 'GigaChad', especie: 'humano', categoria: 'guerrero' });
        const debil = new Mago({ id: 2, nombre: 'Aprendiz', especie: 'elfo', categoria: 'mago' });

        fuerte.stats.vida = 500;
        fuerte.stats.ataque = 100;
        
        debil.stats.vida = 10;
        debil.stats.ataque = 1;

        const resultado = Combate.simular(fuerte, debil);

        expect(resultado.ganador).toBe('GigaChad');
        expect(resultado.perdedor).toBe('Aprendiz');
    });

 
});