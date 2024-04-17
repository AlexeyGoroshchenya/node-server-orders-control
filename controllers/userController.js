const ApiError = require('../error/ApiError')
var smsc = require('../smsc/smsc_api.js');
const generatePassword = require('../utils/utils')


const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { User, Order } = require('../models/models')
const { json } = require('sequelize')

const generateGWT = (id, phone, role) => {
        return jwt.sign({ id: id, phone: phone, role: role },
                process.env.SECRET_KEY,
                { expiresIn: '24h' }
        )
}

class UserController {

        async registration(req, res, next) {

                const { name, phone, password, role } = req.body

                const allowedRoles = ['ADMIN', 'OPERATOR', 'USER']

                if (!name || !phone || !password) {
                        return next(ApiError.badRequest({message:'проверьте имя, телефон и пароль'}))
                }

                if (!role || !allowedRoles.includes(role)) {
                        return next(ApiError.badRequest({message:'проверьте роль пользователя'}))
                }

                try {

                        const candidate = await User.findOne({ where: { phone } })
                        if (candidate) {
                                return next(ApiError.badRequest({message:'пользователь с таким номером уже зарегистрирован'}))
                        }

                        const hashPassword = await bcrypt.hash(password, 5)

                        const user = await User.create({ name, phone, password: hashPassword, role: role })

                        const token = generateGWT(user.id, user.phone, user.role)

                        return res.json({ token })
                } catch (error) {
                        return next(ApiError.internal({message: 'ошибка создания пользователя', error: error.message}))
                }
        }

        async login(req, res, next) {

                const { phone, password } = req.body
                try {
                        const user = await User.findOne({ where: { phone } })
                        if (!user) {
                                return next(ApiError.badRequest( {message:'пользователь не найден'}))
                        }

                        let comparePassword = bcrypt.compareSync(password, user.password)

                        if (!comparePassword) {
                                return next(ApiError.badRequest({message:'неправильный пароль'}))
                        }
                        const token = generateGWT(user.id, user.phone, user.role)

                        if (user.role !== 'ADMIN') {
                                const hashPassword = await bcrypt.hash(generatePassword(), 5)
                                user.password = hashPassword
                                user.save()
                        }

                        return res.json({ token })
                } catch (error) {
                        return next(ApiError.internal({message: 'ошибка авторизации', error: error.message}))
                }

        }



        async check(req, res, next) {

                try {
                        const token = generateGWT(req.user.id, req.user.phone, req.user.role)
                        return res.json({ token })
                } catch (error) {
                        return next(ApiError.internal({message: 'пользователь не авторизован', error: error.message}))
                }
        }

        async getAll(req, res, next) {

                let {limit = 10, page = 1} = req.query
                let offset = page*limit - limit

                try {
                        const users = await User.findAndCountAll({limit, offset})

                        return res.json({ users })
                } catch (error) {
                        return next(ApiError.internal({message: 'ошибка получения пользователя', error: error.message}))
                }
        }

        async getUserByID(req, res, next) {

                const { id } = req.query
                if (!id) return next(ApiError.badRequest({message:'проверьте данные id'}))

                try {
                        const user = await User.findByPk(id)

                        return res.json({ user })
                } catch (error) {
                        return next(ApiError.internal({message: 'ошибка получения пользователя', error: error.message}))
                }
        }


        async deleteUser(req, res, next) {

                const { id } = req.body
                if (!id) return next(ApiError.badRequest({message:'проверьте данные id'}))

                try {
                        await User.destroy({
                                where: {
                                        id: id
                                }
                        })

                        return res.json({ result: "ok" })
                } catch (error) {
                        return next(ApiError.internal({message: 'ошибка удаления пользователя', error: error.message}))
                }
        }

        async sendPassword(req, res, next) {
                const { phone } = req.body
                const message = Math.ceil(Math.random() * 1000000)

                const hashPassword = await bcrypt.hash(`${message}`, 5)

                let user

                try {
                        user = await User.findOne({ where: { phone } })
                        user.password = `${hashPassword}`
                        user.save()

                        smsc.send_sms({
                                phones: [phone],
                                mes: 'Ваш код:' + message
                        }, function (data, raw, err, code) {
                                if (err) return console.log(err, 'code: ' + code);
                                console.log(data); // object
                                console.log(raw); // string in JSON format


                                setTimeout(() => {
                                        smsc.get_status({
                                                phones: phone,
                                                id: data.id,
                                                all: 1
                                        }, function (status, raw, err, code) {
                                                if (err) return console.log(err, 'code: ' + code);
                                                console.log(status);
                                        });
                                }, 60000
                                )
                        });

                        return res.json({ result: message })

                } catch (error) {
                        return next(ApiError.internal({message: 'ошибка назначения временного пароля', error: error.message}))
                }
        }

}
module.exports = new UserController()