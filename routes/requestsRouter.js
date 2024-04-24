const Router = require('express')
const requestsController = require('../controllers/requestsController')
const checkRole = require('../middleware/CheckRoleMiddleware')
const authMiddleware = require('../middleware/AuthMiddleware')

const router = new Router()


router.post('/create', requestsController.createRequest)

router.get('/allRequests',  authMiddleware, checkRole('OPERATOR'),  requestsController.getAllRequests)

router.get('/getById',  authMiddleware, checkRole('OPERATOR'),  requestsController.getById)
router.get('/getByUserPhone',  authMiddleware, checkRole('OPERATOR'),  requestsController.getByUserPhone)
router.get('/getByStatus',  authMiddleware, checkRole('OPERATOR'),  requestsController.getByStatus)

router.get('/getBySearchParams', authMiddleware, checkRole('OPERATOR'), requestsController.getBySearchParams)

router.put('/',  authMiddleware, checkRole('OPERATOR'),  requestsController.changeRequest)






module.exports = router