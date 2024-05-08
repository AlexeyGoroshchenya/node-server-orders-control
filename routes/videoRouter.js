const Router = require('express')
const videoController = require('../controllers/videoController')

const router = new Router()



router.get('/', videoController.getAll)

module.exports = router