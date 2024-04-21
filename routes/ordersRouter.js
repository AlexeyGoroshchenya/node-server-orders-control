const Router = require('express')
const ordersController = require('../controllers/ordersController')
const checkRole = require('../middleware/CheckRoleMiddleware')
const authMiddleware = require('../middleware/AuthMiddleware')

const router = new Router()


router.post('/create', checkRole('OPERATOR'), ordersController.createOrder)
router.get('/allOrders', checkRole('OPERATOR'), ordersController.getAllOrders)
router.get('/getById', authMiddleware, ordersController.getById)
router.get('/getByUserId', authMiddleware, ordersController.getByUserId)
router.get('/getByUserPhone',  checkRole('OPERATOR'), ordersController.getByUserPhone)
router.get('/getByStatus', authMiddleware, ordersController.getByStatus)

checkRole('OPERATOR'),
router.get('/getBySearchParams',   ordersController.getBySearchParams)



router.put('/', checkRole('OPERATOR'), ordersController.changeOrder)






module.exports = router