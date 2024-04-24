const Router = require('express')
const userController = require('../controllers/userController')
const authMiddleware = require('../middleware/AuthMiddleware')
const checkRole = require('../middleware/CheckRoleMiddleware')

const router = new Router()

//сделать доступным только админу после деплоя
router.post('/registration', userController.registration)
// router.post('/registration', authMiddleware, checkRole('ADMIN'), userController.registration)

router.post('/login', userController.login)

router.get('/auth', authMiddleware, userController.check)

router.get('/getAll', authMiddleware, checkRole('ADMIN'), userController.getAll)
router.get('/getUserByID', authMiddleware, checkRole('ADMIN'), userController.getUserByID)
router.get('/getByRole', authMiddleware, checkRole('ADMIN'), userController.getByRole)


router.post('/send', userController.sendPassword)

router.put('/delete', authMiddleware, checkRole('ADMIN'), userController.deleteOperator)

module.exports = router