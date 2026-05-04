const { Router }   = require('express')
const validar      = require('../middleware/validarCampos')
const ctrl         = require('../controllers/personajeController')
const validarEnum = require('../middleware/validarEnum')
const { ESPECIES, CATEGORIAS } = require('../utils/nombresAleatorios')

const router = Router()

router.get('/',              ctrl.listar)
router.get('/estadisticas',  ctrl.estadisticas)
router.get('/:id',           ctrl.obtenerUno)
router.post('/manual',       validar(['nombre', 'especie', 'categoria']),
                             validarEnum('especie', ESPECIES),
                             validarEnum('categoria', CATEGORIAS),
                             ctrl.crearManual)
router.post('/aleatorio',    ctrl.crearAleatorio)
router.put('/:id',           validar(['nombre']), ctrl.actualizar)
router.delete('/:id',        ctrl.eliminar)

module.exports = router