const Router = require('express')
const ordersController = require('../controllers/ordersController')
const checkRole = require('../middleware/CheckRoleMiddleware')
const authMiddleware = require('../middleware/AuthMiddleware')

const router = new Router()


router.post('/create', checkRole('OPERATOR'), ordersController.createOrder)

router.get('/allOrders', checkRole('ADMIN'), ordersController.getAllOrders)
router.get('/getById', authMiddleware, ordersController.getById)
router.get('/getByUserId', authMiddleware, ordersController.getByUserId)
router.get('/getByUserPhone', authMiddleware, ordersController.getByUserPhone)
router.get('/getByStatus', authMiddleware, ordersController.getByStatus)

router.put('/', checkRole('OPERATOR'), ordersController.changeOrder)






module.exports = router