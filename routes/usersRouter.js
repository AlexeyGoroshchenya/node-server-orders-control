const Router = require('express')
const userController = require('../controllers/userController')
const authMiddleware = require('../middleware/AuthMiddleware')
const checkRole = require('../middleware/CheckRoleMiddleware')

const router = new Router()

//сделать доступным только админу после деплоя
router.post('/registration', userController.registration)
// router.post('/registration', checkRole('ADMIN'), userController.registration)

router.post('/login', userController.login)

router.get('/auth', authMiddleware, userController.check)
router.get('/getAll', checkRole('ADMIN'), userController.getAll)
router.get('/getUserByID', checkRole('ADMIN'), userController.getUserByID)


router.post('/send', userController.sendPassword)

router.delete('/delete', checkRole('ADMIN'), userController.deleteUser)

module.exports = router