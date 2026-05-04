//TORNEOS
const { Router } = require('express')
const ctrl       = require('../controllers/torneoController')

const router = Router()

router.post('/', ctrl.crearTorneo)

module.exports = router