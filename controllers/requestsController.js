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

    if (!phone || !name) return next(ApiError.badRequest({ message: 'Проверьте данные запроса' }))

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
      return next(ApiError.internal({ message: 'Ошибка создания заявки', error: error.message }))
    }
  }

  async getAllRequests(req, res, next) {

    let { limit = 2, page = 1 } = req.query
    let offset = page * limit - limit

    try {

      let requests = await Request.findAll()
      let sortedResult = requests.reverse().slice(offset, page * limit)

      return res.json(sortedResult)
    } catch (error) {
      return next(ApiError.internal({ message: 'Ошибка получения заявок', error: error.message }))
    }
  }

  async getById(req, res, next) {

    try {

      const { id } = req.query
      const request = await Request.findOne({ where: { id } })

      if (!request) return next(ApiError.badRequest({ message: 'Заявка с таким id не найден' }))

      return res.json(request)
    } catch (error) {
      return next(ApiError.internal({ message: 'Ошибка получения заявок', error: error.message }))
    }
  }

  async changeRequest(req, res, next) {
    const { requestId, handled } = req.body

    try {

      if (!requestId) return next(ApiError.badRequest({ message: 'Проверьте id заявки' }))
      if (typeof handled !== 'boolean') return next(ApiError.badRequest({ message: 'Неправильный формат параметра: Обработано' }))

      const request = await Request.findByPk(requestId)

      if (!request) return next(ApiError.badRequest({ message: 'Заявка с таким id не найдена' }))
      request.handled = handled
      request.save()

      return res.json(request)
    } catch (error) {
      return next(ApiError.internal({ message: 'Ошибка обновления сведений', error: error.message }))
    }
  }

  async getByUserPhone(req, res, next) {

    const { phone } = req.query

    if (!phone) return next(ApiError.badRequest({ message: 'Проверьте данные запроса' }))
    let userPhone = Number(phone)
    if (phone[0] === '+') userPhone = Number(phone.slice(1))

    try {

      let requests = await Request.findAll({ where: { phone: userPhone } })

      if (requests.length === 0) return next(ApiError.badRequest({ message: 'Заявки пользователя не найдены' }))

      requests.reverse()

      return res.json(requests)
    } catch (error) {
      return next(ApiError.internal({ message: 'Ошибка получения заявок', error: error.message }))
    }
  }


  async getByStatus(req, res, next) {
    const { handled, limit = 10, page = 1 } = req.query
    let offset = page * limit - limit

    try {

      let requests = await Request.findAll({ where: { handled: handled } })

      let sortedResult = requests.reverse().slice(offset, page * limit)

      return res.json(sortedResult)
    } catch (error) {
      return next(ApiError.internal({ message: 'Ошибка получения заявок', error: error.message }))
    }
  }

  async getBySearchParams(req, res, next) {

    try {
      const { searchParam, handled, limit = 100, page = 1 } = req.query

      let requests
      let offset = page * limit - limit
      let count

      if (handled === undefined) {
        requests = await Request.findAll()
      } else {
        requests = await Request.findAll({ where: { handled: handled } })
      }



      if (!searchParam) {
        const sortedUnsearchedRequests = requests.reverse().slice(offset, page * limit)
        count = requests.length
        return res.json({ count: count, rows: sortedUnsearchedRequests })

      } else {

        const searchedByPhone = requests.filter(request => String(request.phone).toLowerCase().includes(searchParam.toLowerCase()))
        const searchedByName = requests.filter(request => request.name.toLowerCase().includes(searchParam.toLowerCase()))
        const searchResult = [...searchedByPhone, ...searchedByName]
        const sortedSearchResult = searchResult.sort((a, b) => a.id < b.id ? 1 : -1).slice(offset, page * limit)
        count = sortedSearchResult.length
        return res.json({ count: count, rows: sortedSearchResult })
      }




    } catch (error) {
      return next(ApiError.internal({ message: 'Ошибка получения заказов', error: error.message }))
    }
  }

}
module.exports = new RequestsController()