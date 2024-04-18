const Router = require('express')
const requestsController = require('../controllers/requestsController')
const checkRole = require('../middleware/CheckRoleMiddleware')
const authMiddleware = require('../middleware/AuthMiddleware')

const router = new Router()


router.post('/create', requestsController.createRequest)


router.get('/allRequests',  checkRole('OPERATOR'),  requestsController.getAllRequests)


router.get('/getById',  checkRole('OPERATOR'),  requestsController.getById)
router.get('/getByUserPhone',  checkRole('OPERATOR'),  requestsController.getByUserPhone)
router.get('/getByStatus',  checkRole('OPERATOR'),  requestsController.getByStatus)


router.put('/',  checkRole('OPERATOR'),  requestsController.changeRequest)






module.exports = router