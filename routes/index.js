const Router = require('express')

const router = new Router()

const usersRouter = require('./usersRouter')
const ordersRouter = require('./ordersRouter')

router.use('/user', usersRouter)
router.use('/order', ordersRouter)



module.exports = router