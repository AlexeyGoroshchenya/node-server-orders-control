const Router = require('express')

const router = new Router()

const usersRouter = require('./usersRouter')
const ordersRouter = require('./ordersRouter')
const requestsRouter = require('./requestsRouter')
const videoRouter = require('./videoRouter')

router.use('/user', usersRouter)
router.use('/order', ordersRouter)
router.use('/request', requestsRouter)
router.use('/video', videoRouter)


module.exports = router