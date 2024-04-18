const Router = require('express')
const requestsController = require('../controllers/requestsController')
const checkRole = require('../middleware/CheckRoleMiddleware')
const authMiddleware = require('../middleware/AuthMiddleware')

const router = new Router()


router.post('/create', requestsController.createRequest)

// checkRole('ADMIN'), 
router.get('/allRequests', requestsController.getAllRequests)

// checkRole('OPERATOR'),  
router.get('/getById', requestsController.getById)
router.get('/getByUserPhone', requestsController.getByUserPhone)
router.get('/getByStatus', requestsController.getByStatus)

// checkRole('OPERATOR'), 
router.put('/', requestsController.changeRequest)






module.exports = router