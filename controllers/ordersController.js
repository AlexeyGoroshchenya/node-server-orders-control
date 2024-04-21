require('dotenv').config()
const ApiError = require('../error/ApiError')
const { Order, User } = require('../models/models')
const statuses = require('../statuses')
var smsc = require('../smsc/smsc_api.js');


class OrdersController {

  async createOrder(req, res, next) {
    const { car, model, year, capacity, drive, type, description, phone } = req.body

    //проверка телефона на формат?


    if (!phone || !car || !model) return next(ApiError.badRequest({message: 'проверьте данные запроса'}))

    let userPhone = Number(phone)
    if (phone[0] === '+') userPhone = Number(phone.slice(1))

    let user = await User.findOne({ where: { phone: phone } })
    if (!user) {
      const password = Math.ceil(Math.random() * 1000000)
      try {
        user = await User.create({ name: 'Пользователь', phone: userPhone, password: password })
      } catch (error) {
        return next(ApiError.internal({message: 'ошибка создания заказа', error: error.message}))
      }
    }

    try {
      const order = await Order.create({ car: car, model: model, year: year, capacity: capacity, drive: drive, type: type, status: statuses[0].name, description: description, userId: user.id })
      return res.json({ order })
    } catch (error) {
      return next(ApiError.internal({message: 'ошибка создания заказа', error: error.message}))
    }
  }

  async getAllOrders(req, res, next) {

    let { limit = 10, page = 1 } = req.query
    let offset = page * limit - limit

    try {
      const orders = await Order.findAndCountAll({ limit, offset })

      return res.json(orders)
    } catch (error) {
      return next(ApiError.internal({message: 'ошибка получения заказов', error: error.message}))
    }
  }

  async getById(req, res, next) {

    try {
      const { id } = req.query
      const order = await Order.findOne({
        where: { id },
        attributes: ['car', 'model', 'year', 'capacity', 'drive', 'type', 'status']
      })

      if (!order) return next(ApiError.badRequest({message: 'заказ с таким id не найден'}))

      return res.json(order)
    } catch (error) {
      return next(ApiError.internal({message: 'ошибка получения заказов', error: error.message}))
    }
  }

  async getBySearchParams(req, res, next) {

    try {
      const { searchParam } = req.query

      const orders = await Order.findAll()
      if(!searchParam) return res.json(orders)

      let searchedById = orders.filter(order=> String(order.id).includes(searchParam))
      let searchedByCar = orders.filter(order=> order.car.toLowerCase().includes(searchParam.toLowerCase()))
      let searchedByModel = orders.filter(order=> order.model.toLowerCase().includes(searchParam.toLowerCase()))

      let searchResult = [...searchedById, ...searchedByCar]
      searchedByModel.forEach(result=>{
        if(!searchResult.find(item=> item.id === result.id)){
          searchResult.push(item)
        }
      })

      return res.json(searchResult)
    } catch (error) {
      return next(ApiError.internal({message: 'ошибка получения заказов', error: error.message}))
    }
  }







  async changeOrder(req, res, next) {
    const { orderId, status, description } = req.body


    try {

      if (!orderId) return next(ApiError.badRequest({message: 'заказ с таким id не найден'}))

      if (!status && !description) return next(ApiError.badRequest({message: 'проверьте сведения, которые нужно обновить'}))

      const order = await Order.findOne(
        {
          where: {
            id: orderId,
          },
        }
      )
      order.status = status
      order.description = description
      order.save()

      const user = await User.findOne(
        {
          where: {
            id: order.userId,
          },
        }
      )

      if (status) {
        //отправить смс
        const newStatus = statuses.find(item => item.name === status)

        let message = newStatus.message //+ ' Перейти в личный кабинет: ' + process.env.LOGIN_LINK

        smsc.send_sms({
          phones: [`${user.phone}`],
          mes: message
        }, function (data, raw, err, code) {
          if (err) return console.log(err, 'code: ' + code);
          console.log(data); // object
          console.log(raw); // string in JSON format

          setTimeout(() => {
            smsc.get_status({
              phones: `${user.phone}`,
              id: data.id,
              all: 1
            }, function (status, raw, err, code) {
              if (err) return console.log(err, 'code: ' + code);
              console.log(status);
            });
          }, 60000
          )

        });
      }

      return res.json(order)
    } catch (error) {
      return next(ApiError.internal({message: 'ошибка обновления сведений', error: error.message}))
    }

  }

  async getByUserId(req, res, next) {

    try {
      const { userId } = req.query
      const orders = await Order.findAll({
        where: { userId: userId },
        attributes: ['car', 'model', 'year', 'capacity', 'drive', 'type', 'status', 'id', 'description']
      })

      if (orders.length === 0) return next(ApiError.badRequest({message: 'заказы пользователя не найдены'}))

      return res.json(orders)
    } catch (error) {
      return next(ApiError.internal({message: 'ошибка получения заказов', error: error.message}))
    }
  }

  async getByUserPhone(req, res, next) {

    const { phone } = req.query

    if (!phone) return next(ApiError.badRequest({message: 'проверьте данные запроса'}))
    let userPhone = Number(phone)
    if (phone[0] === '+') userPhone = Number(phone.slice(1))

    try {
      const user = await User.findOne({ where: { phone: Number(userPhone) } })

      if (!user) {
        return next(ApiError.badRequest({message: 'пользователь с таким номером телефона не найден'}))
      }

      const orders = await Order.findAll({ where: { userId: user.id } })

      if (orders.length === 0) return next(ApiError.badRequest({message: 'заказы пользователя не найдены'}))

      return res.json(orders)
    } catch (error) {
      return next(ApiError.internal({message: 'ошибка получения заказов', error: error.message}))
    }
  }

  
  async getByStatus(req, res, next) {
    const { status, limit = 10, page = 1 } = req.query
    let offset = page * limit - limit


    try {
      
      const orders = await Order.findAndCountAll({where: {status}, limit, offset })
        

      if (orders.rows.length === 0) return next(ApiError.badRequest({message: 'заказы c таким статусом не найдены'}))

      return res.json(orders)
    } catch (error) {
      return next(ApiError.internal({message: 'ошибка получения заказов', error: error.message}))
    }
  }

}
module.exports = new OrdersController()