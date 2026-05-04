const { Router } = require('express')
const validar    = require('../middleware/validarCampos')
const ctrl       = require('../controllers/combateController')

const router = Router()

router.get('/historial', ctrl.historial)
router.delete('/historial', ctrl.eliminarTodoHistorial)
router.delete('/historial/:id', ctrl.eliminarHistorial)
router.post('/', validar(['id1', 'id2']), ctrl.simular)

module.exports = router
