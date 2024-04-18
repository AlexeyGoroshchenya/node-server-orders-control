const Router = require('express')

const router = new Router()

const usersRouter = require('./usersRouter')
const ordersRouter = require('./ordersRouter')
const requestsRouter = require('./requestsRouter')

router.use('/user', usersRouter)
router.use('/order', ordersRouter)
router.use('/request', requestsRouter)



module.exports = router