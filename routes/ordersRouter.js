const Router = require('express')
const ordersController = require('../controllers/ordersController')
const checkRole = require('../middleware/CheckRoleMiddleware')
const authMiddleware = require('../middleware/AuthMiddleware')

const router = new Router()


router.post('/create', authMiddleware, checkRole('OPERATOR'), ordersController.createOrder)

router.get('/allOrders', authMiddleware, checkRole('OPERATOR'), ordersController.getAllOrders)
router.get('/getById', authMiddleware, ordersController.getById)
router.get('/getByUserId', authMiddleware, ordersController.getByUserId)
router.get('/getByUserPhone',  authMiddleware, checkRole('OPERATOR'), ordersController.getByUserPhone)
router.get('/getByStatus', authMiddleware, ordersController.getByStatus)
router.get('/getStatuses', ordersController.getStatuses)



router.get('/getBySearchParams', authMiddleware, checkRole('OPERATOR'), ordersController.getBySearchParams)



router.put('/', authMiddleware, checkRole('OPERATOR'), ordersController.changeOrder)






module.exports = router