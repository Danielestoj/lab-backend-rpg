const nombres = {
  humano:   ['Aldric', 'Mara', 'Torben', 'Elisa', 'Cain', 'Sera'],
  enano:    ['Durgin', 'Broka', 'Halvard', 'Ilda', 'Grimr', 'Vorna'],
  elfo:     ['Aelindra', 'Sorin', 'Lyshara', 'Eryn', 'Caladel', 'Nimue']
}

const ESPECIES    = ['humano', 'enano', 'elfo']
const CATEGORIAS  = ['guerrero', 'explorador', 'mago']

const aleatorio = (arr) => arr[Math.floor(Math.random() * arr.length)]

const generarNombre   = (especie) => aleatorio(nombres[especie] || nombres.humano)
const generarEspecie  = () => aleatorio(ESPECIES)
const generarCategoria = () => aleatorio(CATEGORIAS)

module.exports = { generarNombre, generarEspecie, generarCategoria, ESPECIES, CATEGORIAS }