require('dotenv').config()
const ApiError = require('../error/ApiError')
const { Request } = require('../models/models')
const sendToMail = require('../utils/nodemailer.js') 

const moment = require('moment')


class RequestsController {

  async createRequest(req, res, next) {
    const { name, phone } = req.body
    console.log(name);

    //проверка телефона на формат?

    if (!phone || !name) return next(ApiError.badRequest({message: 'проверьте данные запроса'}))

    let userPhone = Number(phone)
    if (phone[0] === '+') userPhone = Number(phone.slice(1))

    const currentDate = new Date()
    
    let date = moment(currentDate).format("DD.MM.YYYY");
    let time = moment(currentDate).format("HH:mm");

    try {
      const request = await Request.create({ name: name, phone: userPhone, date: date, time: time, handled: false })

      sendToMail({
        subject: 'Новая Заявка',
        html:
            `
            Имя: ${name} <br>
            Телефон: ${phone} <br>
            Создана:<br>
            ${date}<br>
            ${time}<br>
            Перейти в личный кабинет: ${process.env.LOGIN_LINK}.
            `,
    })

      return res.json({ request })
    } catch (error) {
      return next(ApiError.internal({message: 'ошибка создания заявки', error: error.message}))
    }
  }

  async getAllRequests(req, res, next) {

    let { limit = 2, page = 1 } = req.query
    let offset = page * limit - limit

    try {

      let requests = await Request.findAll()
      let sortedResult = requests.reverse().slice(offset, page * limit )
      // let requests = await Request.findAndCountAll({ limit, offset })

      return res.json(sortedResult)
    } catch (error) {
      return next(ApiError.internal({message: 'ошибка получения заявок', error: error.message}))
    }
  }

  async getById(req, res, next) {

    try {

      const { id } = req.query
      const request = await Request.findOne({where: { id }})

      if (!request) return next(ApiError.badRequest({message: 'заявка с таким id не найден'}))

      return res.json(request)
    } catch (error) {
      return next(ApiError.internal({message: 'ошибка получения заявок', error: error.message}))
    }
  }

  async changeRequest(req, res, next) {
    const { requestId, handled } = req.body

    try {

      if (!requestId) return next(ApiError.badRequest({message: 'проверьте id заявки'}))
      if (typeof handled !== 'boolean') return next(ApiError.badRequest({message: 'невправильный формат параметра: Обработано'}))

      const request = await Request.findByPk(requestId)

      if(!request) return next(ApiError.badRequest({message: 'заявка с таким id не найдена'}))
      request.handled = handled
      request.save()

      return res.json(request)
    } catch (error) {
      return next(ApiError.internal({message: 'ошибка обновления сведений', error: error.message}))
    }
  }

  async getByUserPhone(req, res, next) {

    const { phone } = req.query

    if (!phone) return next(ApiError.badRequest({message: 'проверьте данные запроса'}))
    let userPhone = Number(phone)
    if (phone[0] === '+') userPhone = Number(phone.slice(1))

    try {

      let requests = await Request.findAll({ where: { phone: userPhone } })

      if (requests.length === 0) return next(ApiError.badRequest({message: 'заявки пользователя не найдены'}))

      requests.reverse()

      return res.json(requests)
    } catch (error) {
      return next(ApiError.internal({message: 'ошибка получения заявок', error: error.message}))
    }
  }

  
  async getByStatus(req, res, next) {
    const { handled, limit = 10, page = 1 } = req.query
    let offset = page * limit - limit

    try {

      // const requests = await Request.findAndCountAll({where: {handled}, limit, offset })

      let requests = await Request.findAll({where: {handled}})
      if (requests.rows.length === 0) return next(ApiError.badRequest({message: 'заявки c таким статусом не найдены'}))

      let sortedResult = requests.reverse().slice(offset, page * limit )

      return res.json(sortedResult)
    } catch (error) {
      return next(ApiError.internal({message: 'ошибка получения заявок', error: error.message}))
    }
  }

  async getBySearchParams(req, res, next) {

    try {
      const { searchParam } = req.query

      const requests = await Request.findAll()
      if(!searchParam) return res.json(requests)

      let searchedByPhone = requests.filter(request=> String(request.phone).toLowerCase().includes(searchParam.toLowerCase()))
      let searchedByName = requests.filter(request=> request.name.toLowerCase().includes(searchParam.toLowerCase()))

      const searchResult = [...searchedByPhone, ...searchedByName]
      
      searchResult.sort((a, b) => a.id < b.id ? 1 : -1)

      return res.json(searchResult)
    } catch (error) {
      return next(ApiError.internal({message: 'ошибка получения заказов', error: error.message}))
    }
  }

}
module.exports = new RequestsController()