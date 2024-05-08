
const ApiError = require('../error/ApiError')
const { Videos } = require('../models/models')
require('dotenv').config()

class VideoController {



    async getAll(req, res, next) {

    
        try {
            const response = await Videos.findAll()




            return res.json({ data: response })
    
        } catch (error) {
          return next(ApiError.internal({ message: 'Ошибка получения видео', error: error.message }))
        }
      }

}

module.exports = new VideoController()